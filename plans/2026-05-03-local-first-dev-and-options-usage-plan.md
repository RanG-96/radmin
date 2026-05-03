# Local-First Dev And Options Usage Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将项目默认开发方式调整为本地 PostgreSQL + 前后端分别启动，并通过文档补齐选项配置的管理员使用方式与开发者消费方式说明。

**Architecture:** 保留现有运行结构，只调整默认工作流和文档信息架构。Makefile 不再自动依赖 Docker PostgreSQL，README 改为本地优先，Docker Compose 保留为可选方案。

**Tech Stack:** Makefile, Markdown docs, existing frontend/backend runtime commands

---

### Task 1: 更新项目文档门禁

**Files:**
- Create: `documents/local_first_dev_and_options_usage_design.md`
- Create: `plans/2026-05-03-local-first-dev-and-options-usage-plan.md`
- Modify: `TODO.md`

**Step 1: 写设计文档**

- 记录本地优先开发方式和选项配置文档闭环方案。

**Step 2: 写实施计划**

- 明确 Makefile、README 和使用说明的修改路径。

**Step 3: 更新 TODO**

- 记录这次开发模式调整和文档补全目标。

### Task 2: 调整 Makefile

**Files:**
- Modify: `Makefile`

**Step 1: 调整 `dev` 命令**

- 删除自动启动 Docker PostgreSQL 的行为。
- 保留前后端并行启动。

**Step 2: 保留 Docker 命令**

- `docker-up` / `docker-down` 继续保留，但不作为默认开发入口。

### Task 3: 调整 README 的开发路径

**Files:**
- Modify: `README.md`

**Step 1: 将本地开发提升为默认推荐**

- 本地 PostgreSQL
- 后端启动
- 前端启动

**Step 2: 将 Docker 启动降级为可选**

- 说明 Docker 仍可用，但不是默认方式。

**Step 3: 补本地 PostgreSQL 准备说明**

- 默认数据库名
- 默认连接串
- migration 命令

### Task 4: 补齐选项配置使用说明

**Files:**
- Modify: `README.md`
- Optional Modify: `documents/admin_usability_refactor_design.md`

**Step 1: 写管理员使用说明**

- 创建选项组
- 添加可选项
- 启停与排序

**Step 2: 写开发者消费说明**

- `type_code`
- `/api/dict/{type_code}`
- `DictSelect`
- `label/value` 关系

### Task 5: 验证

**Files:**
- Verify existing config/docs

**Step 1: 检查 Makefile**

Run: `sed -n '1,220p' Makefile`

Expected:
- `dev` 不再调用 Docker PostgreSQL

**Step 2: 检查 README**

Run: `sed -n '1,260p' README.md`

Expected:
- 本地开发为主
- Docker 为可选
- 选项配置使用说明完整
