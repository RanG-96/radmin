# Docker Registry Prefix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为项目 Docker 构建和 PostgreSQL 运行时镜像增加可配置镜像前缀能力，兼容官方镜像与私有仓库/镜像源前缀切换。

**Architecture:** 通过 Dockerfile `ARG IMAGE_REGISTRY` 和 `docker-compose.yml` 中的 `build.args` / `image` 变量展开实现，不改运行逻辑，不引入厂商绑定。文档与环境变量示例同步更新，保证脚手架可直接复用。

**Tech Stack:** Dockerfile, Docker Compose, env files, Markdown docs

---

### Task 1: 更新项目文档门禁

**Files:**
- Create: `documents/docker_registry_prefix_design.md`
- Create: `plans/2026-05-03-docker-registry-prefix-plan.md`
- Modify: `TODO.md`

**Step 1: 写设计文档**

- 记录问题背景、方案、使用方式、风险和验证方法。

**Step 2: 写实施计划**

- 明确 Dockerfile、Compose、环境变量示例和 README 的修改路径。

**Step 3: 更新 TODO**

- 记录本次 Docker 镜像前缀能力的已完成与待验证项。

### Task 2: 改造 Dockerfile

**Files:**
- Modify: `frontend/Dockerfile`
- Modify: `backend/Dockerfile`

**Step 1: 增加 build arg**

- 为两个 Dockerfile 添加 `ARG IMAGE_REGISTRY=""`。

**Step 2: 替换基础镜像引用**

- 将 `FROM` 语句改成 `${IMAGE_REGISTRY}<image>` 形式。

**Step 3: 顺手修正 Dockerfile warning**

- 将 `as builder` 改成 `AS builder`，消除 `FromAsCasing` warning。

### Task 3: 改造 Compose 和环境变量示例

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

**Step 1: 传递 build args**

- frontend/backend 的 build 配置增加 `args.IMAGE_REGISTRY`。

**Step 2: 统一 PostgreSQL 镜像前缀**

- 将 `postgres:16-alpine` 改为 `${IMAGE_REGISTRY:-}postgres:16-alpine`。

**Step 3: 增加环境变量示例**

- 在 `.env.example` 添加 `IMAGE_REGISTRY=`。

### Task 4: 更新 README

**Files:**
- Modify: `README.md`

**Step 1: 补使用说明**

- 说明默认行为。
- 说明如何在 `.env` 中设置镜像前缀。
- 明确前缀需要包含末尾 `/`。

### Task 5: 验证

**Files:**
- Verify existing config files

**Step 1: 校验 Compose 配置**

Run: `docker compose config`

Expected:
- frontend/backend `build.args.IMAGE_REGISTRY` 存在
- `postgres.image` 能根据 `IMAGE_REGISTRY` 正确展开
- 配置展开正常，无语法错误

**Step 2: 人工检查 Dockerfile**

- 确认空前缀时镜像名仍合法。
- 确认带前缀时拼接格式正确。
