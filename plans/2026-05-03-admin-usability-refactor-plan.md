# Admin Usability Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将数据字典重构成面向管理员的“选项配置”体验，补齐用户管理显式操作列，并对后端用户管理模块做适度收敛与输入校验增强。

**Architecture:** 前端保留现有 React + TanStack Query + Radix UI 封装，通过重命名、说明文案、显式操作列和统一错误反馈提升可用性。后端保留 Axum + SQLx 主链，只将用户管理逻辑从 handler 下沉到 service，并引入 `validator` 做更清晰的请求校验。

**Tech Stack:** React, TypeScript, TanStack Query, Radix UI primitives, Rust, Axum, SQLx, validator

---

### Task 1: 更新项目文档门禁

**Files:**
- Create: `documents/admin_usability_refactor_design.md`
- Create: `plans/2026-05-03-admin-usability-refactor-plan.md`
- Modify: `TODO.md`

**Step 1: 写设计文档**

- 记录管理员视角问题、信息架构重构、用户管理交互重构和后端模块收敛方案。

**Step 2: 写实施计划**

- 将前端、后端、验证拆成可执行任务。

**Step 3: 更新 TODO**

- 记录本次管理员易用性重构的目标与待办。

### Task 2: 重构选项配置入口与文案

**Files:**
- Modify: `frontend/src/layouts/MainLayout.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/router.tsx`（如有文案相关辅助）

**Step 1: 更新导航和仪表盘入口文案**

- 将“数据字典”统一改为“选项配置”。

**Step 2: 保持路由不变**

- 继续使用现有 `/dict-types`、`/dict-items/:typeId`，避免大范围改动。

### Task 3: 重构选项组页面

**Files:**
- Modify: `frontend/src/pages/DictTypes.tsx`

**Step 1: 改页面信息架构**

- 标题、副标题、空状态、列表列名改成管理员易懂语义。

**Step 2: 改表单文案**

- 将“类型编码”改为“系统编码”
- 将“备注”改为“用途说明”

**Step 3: 保留并优化操作**

- `管理选项`、`编辑`、`启用/禁用`、`删除`
- 删除门禁继续保留

### Task 4: 重构可选项页面

**Files:**
- Modify: `frontend/src/pages/DictItems.tsx`

**Step 1: 改页面标题和上下文**

- 标题改为“管理可选项”
- 增加组选项说明和系统编码展示

**Step 2: 改表单文案**

- `标签` -> `显示名称`
- `值` -> `实际值`
- `备注` -> `补充说明`

**Step 3: 优化空状态和说明**

- 明确告诉管理员下一步操作

### Task 5: 重构用户管理页

**Files:**
- Modify: `frontend/src/pages/Users.tsx`

**Step 1: 显式操作列**

- 列头显示“操作”
- 去掉仅靠三点菜单的操作入口

**Step 2: 前置高频动作**

- 行内提供编辑、启用/禁用、删除

**Step 3: 统一错误反馈**

- 页级错误
- 表单错误
- 提交中按钮禁用

### Task 6: 后端用户管理 service 下沉

**Files:**
- Modify: `backend/Cargo.toml`
- Create: `backend/src/service/user_admin.rs`
- Modify: `backend/src/service/mod.rs`
- Modify: `backend/src/handler/user_admin.rs`
- Modify: `backend/src/model/user.rs`

**Step 1: 引入 `validator`**

- 在 `Cargo.toml` 增加 `validator` derive 支持

**Step 2: 为用户管理 DTO 增加校验规则**

- 邮箱格式
- 用户名/密码最小长度

**Step 3: 下沉用户管理逻辑**

- 列表、获取、创建、更新、删除逻辑迁移到 service

**Step 4: handler 只做参数接收和响应包装**

- 保持接口路径与响应结构不变

### Task 7: 后端路由组织小幅收敛

**Files:**
- Modify: `backend/src/handler/mod.rs`
- Modify: `backend/src/main.rs`

**Step 1: 视实现情况提取路由注册辅助函数**

- 降低 `main.rs` 的路由堆叠感
- 不引入额外复杂抽象

### Task 8: 验证

**Files:**
- Verify existing frontend/backend files

**Step 1: 后端编译验证**

Run: `cd backend && cargo check`

**Step 2: 前端构建验证**

Run: `cd frontend && npm run build`

**Step 3: 关键人工回归**

- 选项配置入口文案是否统一
- 选项组页是否更易懂
- 可选项页上下文和字段命名是否清楚
- 用户管理行内操作是否直观
- 创建/编辑/启用/禁用/删除是否正常
