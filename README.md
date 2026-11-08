# 做饭助手 🍳

基于 RAG（检索增强生成）的家常菜问答助手。菜谱来自开源项目 [HowToCook](https://github.com/Anduin2017/HowToCook)，模型全部在本地用 Ollama 运行，不需要调用任何云端大模型 API。

你可以这样问它：

- "宫保鸡丁怎么做？"
- "冰箱里有鸡蛋和番茄，能做什么？"
- "有什么简单的素菜推荐？"
- "可乐鸡翅要放多少可乐？"

## ✨ 功能

- **菜谱检索问答**：从 371 道菜谱中检索最相关的 3 道，再由大模型整理成回答，用量和步骤以菜谱原文为准
- **多轮追问**：问完"宫保鸡丁怎么做"，接着问"那要放多少盐？"也能听懂（会先结合对话历史把追问改写成完整问题）
- **相似度阈值**：检索不到相关菜谱时不硬套，避免把不相干的菜谱塞给模型
- **流式输出**：回答逐字显示（SSE）
- **用户系统**：注册登录（JWT）、多会话管理、自动生成会话标题
- **评测体系**：用 82 道测试题评测检索准确率，并用 GPT 当评委给回答打分（评测脚本未包含在本仓库中）

## 🏗️ 架构

```
浏览器 ──▶ frontend (Next.js, :3000)
              │
              ▼
           server (FastAPI, :8000) ──▶ PostgreSQL（用户、会话、消息）
              │                    └─▶ Redis
              ▼
           agent (FastAPI, :8001)
              ├─▶ Weaviate（菜谱向量库, :8080）
              └─▶ Ollama（bge-m3 向量模型 + qwen2.5:7b 对话模型, :11434）
```

| 模块 | 技术 | 作用 |
|---|---|---|
| `agent/` | LangChain 0.3、Weaviate v4、Ollama | 菜谱入库、检索、生成回答 |
| `server/` | FastAPI、SQLAlchemy 2.0、Alembic、PostgreSQL、Redis、JWT | 用户认证、会话和消息存储，转发问题给 agent |
| `frontend/` | Next.js 13（App Router）、React 18、TypeScript、Tailwind | 聊天界面 |

## 🚀 快速开始

### 0. 准备

- Python 3.12（推荐用 [uv](https://github.com/astral-sh/uv) 管理虚拟环境）
- Node.js 18+
- Docker（运行 Weaviate、PostgreSQL、Redis）
- [Ollama](https://ollama.com)，并下载两个模型（约 6 GB）：

```bash
ollama pull bge-m3
ollama pull qwen2.5:7b
```

### 1. 启动 agent

```bash
cd agent
docker compose up -d              # 启动 Weaviate
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
.venv/Scripts/python http_service.py   # macOS / Linux：.venv/bin/python http_service.py
```

第一次启动会把 371 道菜谱向量化后存入 Weaviate，需要几分钟；之后启动会直接复用。服务地址：http://localhost:8001/docs

> Weaviate 容器不会随电脑开机自动启动，重启电脑后需要重新执行 `docker compose up -d`。

### 2. 启动 server

```bash
cd server
cp .env.example .env              # 然后编辑 .env，填写 SERVER_JWT_SECRET_KEY
docker compose -f deploy/docker-compose.yml up -d   # 启动 PostgreSQL（5433 端口）和 Redis
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
.venv/Scripts/alembic upgrade head     # 建表
.venv/Scripts/python -m server
```

JWT 密钥可以用 `python -c "import secrets; print(secrets.token_hex(32))"` 生成。服务地址：http://localhost:8000

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:3000 ，注册账号后即可开始对话。

## 📊 评测

测试集共 82 道题，覆盖 9 种题型：查做法、换说法描述、口语和错别字、按食材推荐、按条件推荐、问具体用量、库里没有的菜、闲聊、与做饭无关的问题。检索评测只看正确的菜有没有排在前面；回答评测由 qwen 生成回答，GPT 当评委对照菜谱原文打分。

当前结果：

| 评测 | 指标 | 结果 |
|---|---|---|
| 检索 | Hit@1 / Hit@3（67 道可回答题） | 89.6% / 97.0% |
| 回答 | 评委判定通过率（82 题） | 70% |

已知的主要问题：

- 闲聊和与做饭无关的问题，模型常会主动推荐菜
- 问到库里没有的菜时，模型偶尔会凭自己的知识编出做法
- "不含酒精""下饭的荤菜"这类带否定或分类条件的问题，单靠向量检索效果不好

## 📁 项目结构

```
├── agent/
│   ├── agent/
│   │   ├── config.py          # 模型、检索参数、提示词
│   │   ├── recipe_agent.py    # 检索、问题改写、生成回答
│   │   └── import_data.py     # 解析 HowToCook 的 Markdown 菜谱
│   ├── data/HowToCook/        # 菜谱数据
│   ├── http_service.py        # agent 的 HTTP 接口（/stream、/chat）
│   └── docker-compose.yml     # Weaviate
├── server/
│   ├── server/
│   │   ├── web/api/           # 用户、会话接口
│   │   ├── models/            # 数据库表
│   │   ├── dao/               # 数据库读写
│   │   └── migrations/        # Alembic 迁移
│   └── deploy/docker-compose.yml   # PostgreSQL + Redis
└── frontend/
    ├── app/                   # 页面：首页、登录、注册、聊天
    ├── services/              # 调用后端接口
    └── ui/                    # 组件
```

## 📝 菜谱数据说明

菜谱来自 [Anduin2017/HowToCook](https://github.com/Anduin2017/HowToCook)，该项目以 [Unlicense](agent/data/HowToCook/LICENSE) 发布（公有领域）。

相比原项目，删除了「基础牛奶面包」和「戚风蛋糕」两道菜：这两篇菜谱太长，超出了 bge-m3 向量模型的输入长度限制。

## 致谢

- [HowToCook](https://github.com/Anduin2017/HowToCook)：菜谱数据
- 项目最初基于一个客服工单 RAG 框架改造而来
