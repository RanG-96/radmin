# Radmin

A reusable, lightweight full-stack admin scaffold built with Rust and React.

一个可复用的轻量级全栈管理后台脚手架，基于 Rust + React 构建。

## Tech Stack / 技术栈

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Radix UI, TanStack Query, TailwindCSS v4, TypeScript |
| Backend | Rust, Axum 0.8, SQLx, PostgreSQL |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Dev Workflow | Local PostgreSQL + separate frontend/backend processes |
| Optional Deploy | Docker Compose (PostgreSQL + Backend + Frontend/Nginx) |

## Features / 功能特性

- JWT authentication (register / login / token verification)
- Default admin account auto-created on startup
- Radix UI component library with TailwindCSS
- Local-first development workflow
- Docker Compose optional deployment
- Clean, minimal project structure

---

- JWT 认证（注册 / 登录 / Token 验证）
- 启动时自动创建默认管理员账号
- Radix UI 组件库 + TailwindCSS 样式
- 本地优先开发工作流
- Docker Compose 可选部署方案
- 简洁清晰的项目结构

## Project Structure / 项目结构

```
radmin/
├── backend/                     # Rust + Axum
│   ├── src/
│   │   ├── main.rs              # Entry, route registration
│   │   ├── config.rs            # Env config
│   │   ├── db.rs                # PostgreSQL connection pool
│   │   ├── error.rs             # Unified error handling
│   │   ├── middleware/          # JWT auth, CORS
│   │   ├── handler/             # Route handlers
│   │   ├── model/               # Data models
│   │   └── service/             # Business logic + seed
│   ├── migrations/              # SQL migrations
│   ├── Dockerfile
│   └── Cargo.toml
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/ui/       # Radix UI components
│   │   ├── pages/               # Login, Register, Dashboard
│   │   ├── layouts/             # Layout + route guard
│   │   ├── hooks/               # useAuth
│   │   ├── lib/                 # API client, query config
│   │   └── router.tsx           # Routes
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── Makefile
└── .env.example
```

## Quick Start / 快速开始

### Prerequisites / 环境要求

- Rust 1.75+
- Node.js 20+
- PostgreSQL 16
- Docker & Docker Compose (optional / 可选)

### 1. Clone / 克隆

```bash
git clone https://github.com/RanG-96/radmin.git
cd radmin
```

### 2. Configure / 配置

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env files to customize / 编辑 .env 自定义配置
```

If your network cannot pull Docker Hub base images reliably, you can set a registry prefix in `.env`:

如果你的网络环境无法稳定拉取 Docker Hub 基础镜像，可以在 `.env` 中设置镜像前缀：

```env
IMAGE_REGISTRY=registry.example.com/library/
```

- Leave it empty to keep using official image names / 留空则继续使用官方镜像名
- The prefix must include the trailing `/` / 前缀必须包含末尾 `/`
- The same prefix now applies to frontend, backend, and PostgreSQL / 该前缀现在同时作用于 frontend、backend 和 PostgreSQL

### 3. Run locally / 本地开发（推荐）

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Make sure local PostgreSQL is running and the default database exists:

请确认本地 PostgreSQL 已启动，并且默认数据库已经创建：

```bash
createdb my_admin
```

The default connection string is:

默认连接串是：

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_admin
```

Run database migrations:

执行数据库迁移：

```bash
cd backend && sqlx migrate run
```

Start backend:

启动后端：

```bash
cd backend && cargo run
```

Start frontend:

启动前端：

```bash
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

You can also use:

也可以使用：

```bash
make dev-backend
make dev-frontend
```

### 4. Run with Docker / Docker 启动（可选）

```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:3000

## Default Admin / 默认管理员

| Field | Value |
|-------|-------|
| Username | admin |
| Email | admin@example.com |
| Password | admin123 |

Configured via environment variables / 通过环境变量配置：

```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## API Endpoints / API 接口

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register / 注册 | No |
| POST | `/api/auth/login` | Login / 登录 | No |
| GET | `/api/users/me` | Current user / 当前用户 | JWT |
| GET | `/api/health` | Health check / 健康检查 | No |

## Option Configuration / 选项配置说明

`选项配置` 用来统一管理系统中的下拉选项、状态选项和枚举配置。

`Option Configuration` is used to centrally manage dropdown options, status options, and enum-like field choices.

### For administrators / 给管理员

1. 先创建一个选项组，例如：
   - 性别
   - 用户来源
   - 订单状态
2. 为选项组填写：
   - 选项组名称：管理员能看懂的名称
   - 系统编码：供系统内部读取使用，例如 `gender`
   - 用途说明：这个选项组用在哪个页面或字段
3. 进入 `管理可选项`，添加具体选项：
   - 显示名称：给用户看的文字
   - 实际值：系统保存和接口返回时使用的值
   - 排序：决定显示顺序
4. 可通过启用/禁用控制选项是否对业务页面可见。

### For developers / 给开发者

- 后端按 `type_code` 提供可用选项：

```http
GET /api/dict/{type_code}
```

- 返回数据中：
  - `label` 用于显示
  - `value` 用于保存和提交

- 前端可直接使用现成组件：

```tsx
<DictSelect typeCode="gender" value={value} onValueChange={setValue} />
```

- 开发约定：
  - 页面展示使用 `label`
  - 表单提交与数据库存储使用 `value`
  - 业务代码通过稳定的 `type_code` 读取选项，不依赖数据库里的类型 ID

## Makefile Commands / 常用命令

```bash
make dev            # Start backend + frontend locally / 本地同时启动前后端
make dev-backend    # Start backend only / 仅启动后端
make dev-frontend   # Start frontend only / 仅启动前端
make docker-up      # Optional Docker deploy / 可选 Docker 部署
make docker-down    # Stop Docker / 停止 Docker
make build          # Build all / 构建全部
make db-reset       # Reset database / 重置数据库
```

## License

MIT
