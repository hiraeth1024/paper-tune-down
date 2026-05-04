# PaperTune

论文降重与降 AI 率一站式处理工具。上传 .docx 格式论文，智能文本处理降低查重率和 AI 检出率。

## 功能

- **文档解析** — 上传 .docx，自动识别论文标题、各级标题、摘要、关键词与正文段落
- **降重引擎** — 同义词替换 + 句式变换 + 语序调整（jieba 分词精准替换）
- **降 AI 率引擎** — AI 典型用语替换 + 句长随机化 + 冗余修饰词删除
- **ZWNJ 注入** — 零宽不连词随机插入，概率可调（0~1），干扰查重匹配
- **格式保留导出** — 导出 docx 保留原始字体、字号、加粗等格式，仅修改正文文本
- **查重入口聚合** — 知网 / 维普 / 万方 / Turnitin 信息展示页

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| 后端 | Python FastAPI |
| 文档处理 | mammoth.js (前端解析) + python-docx (后端导出) |
| NLP | jieba 分词 + 自建同义词库 |
| 认证 | JWT + 邮箱验证码 |

## 项目结构

```
paper-tune-down/
├── frontend/                  # Next.js 前端
│   ├── app/                   # App Router 页面
│   │   ├── (auth)/login/      # 登录注册页
│   │   ├── (main)/            # 主页面
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── process/       # 智能处理页
│   │   │   └── services/      # 查重平台页
│   │   └── layout.tsx
│   ├── components/            # UI 组件
│   │   ├── AuthProvider.tsx
│   │   ├── Navbar.tsx
│   │   ├── home/              # 首页组件
│   │   ├── process/           # 处理流程组件
│   │   └── services/          # 查重平台组件
│   └── lib/                   # 工具库
│       ├── api.ts             # 后端 API 封装
│       └── docx-parser.ts     # DOCX 段落解析与分类
├── backend/                   # FastAPI 后端
│   ├── main.py                # 应用入口
│   ├── api/                   # API 路由
│   ├── core/                  # 配置、认证、用户存储
│   ├── engines/               # 处理引擎
│   │   ├── rewrite.py         # 降重引擎
│   │   ├── deai.py            # 降 AI 引擎
│   │   ├── zwnj.py            # ZWNJ 注入引擎
│   │   └── orchestrator.py    # 编排器
│   ├── schemas/               # Pydantic 模型
│   └── data/                  # 同义词库
└── AGENT.md
```

## 快速开始

### 环境要求

- Node.js >= 20
- Python >= 3.11
- npm

### 环境配置

```bash
# 复制环境变量模板并填入实际值
cp backend/.env.example backend/.env
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SUPABASE_URL` | Supabase 项目地址 | - |
| `SUPABASE_SERVICE_KEY` | Supabase 服务密钥 | - |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | - |
| `CORS_ORIGINS` | 允许的前端域名，逗号分隔 | `http://localhost:3000` |
| `JWT_SECRET` | JWT 签名密钥 | 开发用默认值 |
| `EMAIL_PROVIDER` | 邮件发送方式：`dev` / `resend` / `smtp` | `dev` |
| `RESEND_API_KEY` | Resend API 密钥 | - |
| `SMTP_HOST` | SMTP 服务器地址 | - |
| `SMTP_PORT` | SMTP 端口 | `587` |

> 开发阶段可直接使用默认值，`EMAIL_PROVIDER=dev` 会将验证码打印到控制台。

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/process` | POST | 提交段落文本处理 |
| `/api/export` | POST | 导出处理结果为 .docx |
| `/api/auth/send-code` | POST | 发送邮箱验证码 |
| `/api/auth/register` | POST | 注册 |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |

## 注意事项

- 上传文件大小限制 20MB，仅支持 .docx 格式
- 处理后建议人工复核，深度模式可能产生语义偏移
- ZWNJ 作为辅助降重手段，主流查重系统可能会过滤零宽字符
- 查重平台入口仅做信息展示，不代理查重 API 调用
