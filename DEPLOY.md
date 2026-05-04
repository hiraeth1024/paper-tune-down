# 单 IP 多项目部署指南

## 架构概览

```
互联网
  │
  ▼
shared-nginx (:80) ◄── 服务器唯一 HTTP 入口
  ├── /api/*     → papertune-backend:8000   (paper-tune-down 后端)
  ├── /*         → papertune-frontend:3000  (paper-tune-down 前端)
  ├── /app2/api/* → app2-backend:8000       (未来项目 2 后端)
  └── /app2/*     → app2-frontend:3000      (未来项目 2 前端)
```

- **每个项目** = 独立的 `docker-compose.yml`，拥有自己的 named network
- **shared-nginx** = 共享网关，连接所有项目网络，按路径前缀反代
- **端口** = 只有 nginx 对外 80，项目服务之间走内部网络

## 当前已部署项目

| 项目 | 路径 | 目录 |
|------|------|------|
| PaperTune (论文降重) | `/*`, `/api/*` | `/home/ubuntu/paper-tune-down` |

## 新增项目步骤

### 1. 新项目 docker-compose.yml

```yaml
# /home/ubuntu/new-project/docker-compose.yml
services:
  newproject-backend:
    build: ./backend
    restart: always
    env_file: ./backend/.env
    networks:
      - newproject

  newproject-frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: http://110.40.133.106
        HTTP_PROXY: ${HTTP_PROXY:-}
        HTTPS_PROXY: ${HTTPS_PROXY:-}
    restart: always
    depends_on:
      - newproject-backend
    networks:
      - newproject

networks:
  newproject:
    name: newproject
```

**关键约定：**
- 服务名格式：`{projectname}-backend` / `{projectname}-frontend`（必须唯一，避免跨网络 DNS 冲突）
- 网络名格式：`{projectname}`
- 网络必须是 `name: xxx` 格式（固定名称，供 shared-nginx 引用）

### 2. Next.js 项目配置

如果你的新项目部署在子路径下（如 `/app2/`），需在 `next.config.ts` 中设置：

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/app2",           // ← 子路径前缀
  assetPrefix: "/app2",        // ← 静态资源前缀
};
```

> 注意：设置 `basePath` 后，`NEXT_PUBLIC_API_URL` 不再需要手动拼接路径前缀。前端请求 `/api/xxx` 时 Next.js 会自动处理。

### 3. 更新 shared-nginx

#### 3.1 `shared-nginx/nginx.conf` 新增 location 块

```nginx
# ======================================================================
# Project 2: MyNewProject — http://110.40.133.106/app2/
# ======================================================================
location /app2/api/ {
    proxy_pass http://newproject-backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /app2/ {
    proxy_pass http://newproject-frontend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> **关键**：`/app2/api/` 必须在 `/app2/` 之前，nginx 匹配顺序从上到下，精确匹配优先。

#### 3.2 `shared-nginx/docker-compose.yml` 新增网络

```yaml
services:
  nginx:
    networks:
      - papertune
      - newproject          # ← 新增

networks:
  papertune:
    external: true
  newproject:               # ← 新增
    external: true
```

### 4. 部署

```bash
# 1. 先启动新项目（创建网络）
cd /home/ubuntu/new-project
HTTP_PROXY=http://172.17.0.1:7890 HTTPS_PROXY=http://172.17.0.1:7890 docker compose up -d --build

# 2. 更新共享 nginx（连接新网络 + 加载新路由）
cd /home/ubuntu/paper-tune-down/shared-nginx
docker compose up -d --build

# 3. 验证
curl http://localhost/app2/
```

## 网络代理说明

服务器通过 mihomo 代理访问外网（GFW 环境）。Docker 构建时需要：

```bash
# 宿主机环境中，proxy 地址为 127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890

# Docker 构建时，容器需通过 docker0 网桥访问宿主机代理
HTTP_PROXY=http://172.17.0.1:7890 HTTPS_PROXY=http://172.17.0.1:7890 docker compose up -d --build
```

## 服务命名约定总结

| 规则 | 示例 | 原因 |
|------|------|------|
| 服务名 = `{项目}-{角色}` | `papertune-backend`, `papertune-frontend` | 避免跨网络 DNS 冲突 |
| Docker 网络 = `{项目}` | `papertune` | nginx external network 引用 |
| 路由前缀 = 根项目无前缀，子项目有 | `/`, `/app2/` | nginx location 匹配 |

## 常见问题

**Q: 为什么 `/api/*` 要放在 `/*` 前面？**
A: nginx 的 `location` 按前缀匹配优先级规则：`/api/` 是更长的前缀，会优先于 `/`。如果顺序反了，`/` 会吞掉所有请求。

**Q: 新项目的前端报 404？**
A: 检查 Next.js 是否设置了 `basePath`。部署在子路径下没设 basePath 会导致资源路径错误。

**Q: 构建时 pip/npm 下载超时？**
A: Docker build 没有走宿主代理。确认 `HTTP_PROXY=http://172.17.0.1:7890` 在 docker compose 命令前。

**Q: nginx 报 `host not found`？**
A: 新项目的网络未连接。确认 `docker network ls` 中有该网络，且 shared-nginx 的 compose 文件中声明了 `external: true`。

## 后续升级到域名方案

有了域名后，只需改 nginx 配置，项目代码不用动：

```nginx
server {
    listen 80;
    server_name papertune.yourdomain.com;
    location / { proxy_pass http://papertune-frontend:3000; }
    location /api/ { proxy_pass http://papertune-backend:8000; }
}

server {
    listen 80;
    server_name app2.yourdomain.com;
    location / { proxy_pass http://newproject-frontend:3000; }
    location /api/ { proxy_pass http://newproject-backend:8000; }
}
```

此时可去掉 Next.js 的 `basePath` 配置，两个项目都回到 `/` 根路径。
