# AGENT.md — paper-tune-down 项目上下文

## 项目定位

论文降重降AI率工具网站。用户上传 .docx 格式论文，通过智能文本处理降低查重率和 AI 检出率，同时聚合各大查重平台入口。

## 关键决策

| 决策项 | 选择 | 原因 |
|--------|------|------|
| 降重引擎策略 | **规则引擎优先，LLM 兜底** | 成本可控，MVP 免费提供 |
| 商业模式 | **MVP 阶段免费** | 先验证需求 |
| 查重入口 | **仅做信息聚合页** | 安全无法律风险 |
| 目标用户 | **国内高校学生** | 知网/维普/万方场景，中文论文为主 |

## 技术栈

```
前端:   Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
后端:   Python FastAPI + Celery (异步文档处理)
文档:   python-docx (解析/生成)
AI:     规则引擎为主 (加入零宽不连词 + jieba分词 + 同义词库 + 句法模板) / LLM API 兜底
数据库: PostgreSQL + Redis
部署:   Docker Compose
```

## 核心功能模块

1. **文档上传解析** — .docx → 分段 → 在线预览
2. **降重引擎** — 同义词替换 → 句式变换 → 语序调整 (规则优先)
3. **降AI率引擎** — 句长随机化 → 连接词替换 → 困惑度调节
4. **查重入口聚合** — 知网/维普/万方/Turnitin 信息页
5. **结果导出** — 处理后 .docx + 对照版

## 项目结构规划

```
paper-tune-down/
├── frontend/          # Next.js app
│   ├── app/           # App Router pages
│   ├── components/    # UI components
│   └── lib/           # Shared utils
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── core/      # Config, auth, deps
│   │   ├── models/    # SQLAlchemy models
│   │   ├── services/  # Business logic
│   │   │   ├── doc_parser.py      # .docx 解析
│   │   │   ├── rewrite_engine.py  # 降重规则引擎
│   │   │   ├── de_ai_engine.py    # 降AI率引擎
│   │   │   └── doc_exporter.py    # .docx 导出
│   │   └── tasks/     # Celery tasks
│   └── requirements.txt
├── docker-compose.yml
└── AGENT.md
```

## 规则引擎数据源
- 加入零宽不连词：在文本中随机插入零宽不连词ZWNJ = '\u200c'
- 同义词库：中文 WordNet + 哈工大同义词词林
- 连接词库：自建中文连接词映射表
- 句法模板：中文常见句式变换规则 (主动/被动、把字句/被字句)

## 注意事项

- 文档处理耗时较长，必须异步 (Celery + 轮询/SSE)
- 上传大小限制 20MB
- 不做查重 API 代理（法律风险），仅做信息展示
- 中文分词用 jieba，NLP 考虑用 HanLP 或 LAC
- MVP 不做用户系统，直接使用 session 跟踪
