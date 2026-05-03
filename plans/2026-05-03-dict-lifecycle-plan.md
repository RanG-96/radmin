# 数据字典生命周期实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将数据字典功能升级为稳定可靠的脚手架能力，补齐唯一性约束、生命周期管理、删除门禁与前端错误反馈。

**Architecture:** 继续沿用现有 Rust/Axum + React/TanStack Query + Radix UI 封装。后端在现有 CRUD 路径上补数据约束与业务校验，前端在现有页面上补状态操作、删除门禁、上下文展示与错误反馈。

**Tech Stack:** Rust, Axum, SQLx, PostgreSQL, React, TypeScript, TanStack Query, Radix UI primitives

---

### Task 1: 准备项目文档门禁

**Files:**
- Create: `documents/dict_lifecycle_design.md`
- Create: `plans/2026-05-03-dict-lifecycle-plan.md`
- Create: `TODO.md`

**Step 1: 写入设计文档**

- 记录生命周期规则、删除门禁、唯一性约束、前后端交互方案。

**Step 2: 写入实施计划**

- 将实现拆成可执行的小步骤，覆盖后端、前端、验证。

**Step 3: 更新 TODO**

- 标记本次任务已确认的设计项与待实施项。

### Task 2: 补数据库约束与后端模型

**Files:**
- Create: `backend/migrations/006_dict_item_unique_and_type_delete_guard.sql`
- Modify: `backend/src/model/dict.rs`

**Step 1: 写 migration**

- 为 `dict_items` 增加 `(dict_type_id, value)` 唯一约束。
- 如有需要，增加辅助查询所需索引。

**Step 2: 补响应模型**

- 为字典类型列表/详情补充 `item_count` 字段，支持前端删除门禁展示。
- 为字典项页头展示准备类型详情响应模型。

### Task 3: 补后端服务层规则

**Files:**
- Modify: `backend/src/service/dict.rs`

**Step 1: 实现字典值重复校验**

- 在创建、更新字典项前检查同类型下 `value` 是否重复。

**Step 2: 实现类型删除门禁**

- 删除类型前检查是否仍存在字典项。

**Step 3: 扩展列表与详情查询**

- 类型列表返回 `item_count`。
- 新增按 ID 获取字典类型详情的 service 方法。

### Task 4: 补后端 handler 与路由

**Files:**
- Modify: `backend/src/handler/dict.rs`
- Modify: `backend/src/main.rs`

**Step 1: 新增类型详情接口**

- 新增 admin 路由，例如 `GET /api/admin/dict-types/{id}`。

**Step 2: 复用现有更新接口支持状态修改**

- 确认 handler 层可正确接收并透传 `status` 字段。

### Task 5: 扩展前端 API 类型与请求

**Files:**
- Modify: `frontend/src/lib/api.ts`

**Step 1: 扩展字典类型模型**

- 为 `DictType` 增加 `item_count`。

**Step 2: 暴露类型详情接口**

- 新增 `getType(id)` 请求。

**Step 3: 明确更新入参**

- 让类型和字典项更新接口都显式使用 `status`。

### Task 6: 改造字典类型页

**Files:**
- Modify: `frontend/src/pages/DictTypes.tsx`
- Optional Create/Modify: `frontend/src/components/ui/Switch.tsx` 或复用 `Checkbox.tsx`

**Step 1: 补状态字段表单**

- 新增/编辑弹窗支持状态开关。

**Step 2: 补启用/禁用操作**

- 列表提供快速启停。

**Step 3: 补删除门禁**

- 基于 `item_count` 禁用非空类型删除按钮，并展示原因。

**Step 4: 补错误反馈**

- 对 create/update/delete mutation 增加错误展示。

### Task 7: 改造字典项页

**Files:**
- Modify: `frontend/src/pages/DictItems.tsx`
- Optional Create/Modify: `frontend/src/components/ui/Switch.tsx` 或复用 `Checkbox.tsx`

**Step 1: 拉取所属类型详情**

- 页头显示名称与 `type_code`。

**Step 2: 补状态字段表单与快速启停**

- 新增/编辑支持状态；列表支持快速启用/禁用。

**Step 3: 补错误反馈**

- 对 create/update/delete mutation 增加错误展示。

### Task 8: 验证

**Files:**
- Verify existing backend/frontend files

**Step 1: 后端编译校验**

Run: `cd backend && cargo check`

**Step 2: 前端构建校验**

Run: `cd frontend && npm run build`

**Step 3: 人工回归重点**

- 类型新增、编辑、启停
- 非空类型删除门禁
- 字典项新增、编辑、启停、删除
- 重复值错误提示
- 字典项页头上下文展示
