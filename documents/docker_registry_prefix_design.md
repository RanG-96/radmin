# Docker 镜像前缀可配置设计

## 1. 背景

当前项目的 `frontend/Dockerfile`、`backend/Dockerfile` 和 `docker-compose.yml` 中的 PostgreSQL 运行时镜像都直接使用 Docker Hub 官方镜像：

- `node:20-alpine`
- `nginx:alpine`
- `rust:1.88-bookworm`
- `debian:bookworm-slim`
- `postgres:16-alpine`

在部分网络环境下，Docker 在拉取这些镜像时需要访问 `auth.docker.io` 获取匿名 token。若该链路不稳定，会在构建阶段失败，即使项目代码本身没有问题。

## 2. 目标

- 让项目支持通过环境变量切换基础镜像前缀。
- 默认仍兼容官方镜像，不强制绑定任意私有仓库或公共镜像源。
- 保持 Dockerfile 与 `docker-compose.yml` 简洁，适合作为脚手架复用。

## 3. 非目标

- 不修改应用运行逻辑。
- 不接入某家云厂商专属逻辑。
- 不解决宿主机 Docker Daemon 的镜像加速配置问题。

## 4. 方案

### 4.1 方案选择

采用“镜像前缀可配置，默认保持官方镜像”的方案。

### 4.2 具体实现

- 在 `frontend/Dockerfile` 和 `backend/Dockerfile` 中增加：
  - `ARG IMAGE_REGISTRY=""`
- 将 `FROM` 改为：
  - `FROM ${IMAGE_REGISTRY}node:20-alpine AS builder`
  - `FROM ${IMAGE_REGISTRY}nginx:alpine`
  - `FROM ${IMAGE_REGISTRY}rust:1.88-bookworm AS builder`
  - `FROM ${IMAGE_REGISTRY}debian:bookworm-slim`
- 在 `docker-compose.yml` 的 frontend/backend `build.args` 中传入：
  - `IMAGE_REGISTRY: ${IMAGE_REGISTRY:-}`
- 在 `docker-compose.yml` 中将 PostgreSQL 镜像改为：
  - `${IMAGE_REGISTRY:-}postgres:16-alpine`
- 在根目录 `.env.example` 中新增：
  - `IMAGE_REGISTRY=`

## 5. 使用方式

### 5.1 默认行为

- `IMAGE_REGISTRY` 为空时，Dockerfile 行为与当前一致，仍然从官方镜像地址解析。

### 5.2 使用镜像前缀

- 用户可在 `.env` 中设置：

```env
IMAGE_REGISTRY=registry.example.com/library/
```

- 注意前缀必须自行包含结尾 `/`，否则镜像名会拼接错误。

## 6. 设计取舍

### 6.1 为什么不写死镜像源

- 脚手架应面向不同环境复用，而不是绑定某个团队当前网络条件。

### 6.2 为什么统一覆盖 `postgres:16-alpine`

- 仅覆盖 build 阶段会留下 PostgreSQL 仍直连 Docker Hub 的缺口。
- 使用同一个 `IMAGE_REGISTRY` 前缀可以让整个 compose 的镜像来源一致，降低部署环境差异。

## 7. 风险

- 若用户提供的前缀未包含尾部 `/`，会导致镜像名拼接错误。
- 若用户镜像源未同步对应 tag，构建仍会失败，但错误会更聚焦于镜像不存在，而不是 Docker Hub 鉴权问题。

## 8. 验证

- `docker compose config` 可验证变量替换、build args 和 PostgreSQL 镜像展开结果是否正确。
- 手工检查 Dockerfile `FROM` 语句是否兼容空前缀与带前缀两种场景。
