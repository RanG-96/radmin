# Radmin

A reusable, lightweight full-stack admin scaffold built with Rust and React.

一个可复用的轻量级全栈管理后台脚手架，基于 Rust + React 构建。

## Tech Stack / 技术栈

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Radix UI, TanStack Query, TailwindCSS v4, TypeScript |
| Backend | Rust, Axum 0.8, SQLx, PostgreSQL |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Deploy | Docker Compose (PostgreSQL + Backend + Frontend/Nginx) |

## Features / 功能特性

- JWT authentication (register / login / token verification)
- Default admin account auto-created on startup
- Radix UI component library with TailwindCSS
- Docker Compose one-click deployment
- Clean, minimal project structure

---

- JWT 认证（注册 / 登录 / Token 验证）
- 启动时自动创建默认管理员账号
- Radix UI 组件库 + TailwindCSS 样式
- Docker Compose 一键部署
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
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

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

### 3. Run with Docker / Docker 启动

```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:3000

### 4. Run locally / 本地开发

```bash
# Start PostgreSQL / 启动数据库
docker compose up -d postgres

# Start backend / 启动后端
cd backend && cargo run

# Start frontend / 启动前端
cd frontend && tyarn dev
```

- Frontend: http://localhost:5173
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

## Makefile Commands / 常用命令

```bash
make dev            # Start all services / 启动全部服务
make dev-backend    # Start backend only / 仅启动后端
make dev-frontend   # Start frontend only / 仅启动前端
make docker-up      # Docker deploy / Docker 部署
make docker-down    # Stop Docker / 停止 Docker
make build          # Build all / 构建全部
make db-reset       # Reset database / 重置数据库
```

## License

MIT
