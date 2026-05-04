# Lightweight Scaffold Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在保持项目轻量定位的前提下，补齐脚手架级 CRUD 组合组件、统一表单方案、按领域拆分前端 API，并将后端路由注册从入口文件中收敛出来。

**Architecture:** 前端继续保留 React + TanStack Query + Radix UI primitives 的低抽象风格，在原子组件之上增加只负责骨架的组合组件，并逐页替换重复结构。后端继续保留 Axum + SQLx + handler/service 分层，只拆路由注册代码，不改变现有接口路径和中间件策略。

**Tech Stack:** React, TypeScript, TanStack Query, Radix UI, Axios, Rust, Axum, SQLx

---

### Task 1: 更新文档门禁与任务跟踪

**Files:**
- Create: `documents/lightweight_scaffold_refactor_design.md`
- Create: `plans/2026-05-03-lightweight-scaffold-refactor-plan.md`
- Modify: `TODO.md`

**Step 1: 写设计文档**

- 记录本轮重构的背景、目标、非目标、前端组合组件方案、统一表单方案、API 拆分方案和后端路由拆分方案。

**Step 2: 写实施计划**

- 将四个阶段拆成可以直接执行的小任务。

**Step 3: 更新 TODO**

- 将“轻量脚手架可扩展性重构”加入待完成项。

### Task 2: 盘点当前重复结构并确定首轮替换页面

**Files:**
- Inspect: `frontend/src/pages/Users.tsx`
- Inspect: `frontend/src/pages/DictTypes.tsx`
- Inspect: `frontend/src/pages/DictItems.tsx`
- Inspect: `frontend/src/pages/Settings.tsx`
- Inspect: `frontend/src/pages/OperationLogs.tsx`
- Inspect: `frontend/src/components/ui/Table.tsx`
- Inspect: `frontend/src/components/ui/Dialog.tsx`
- Inspect: `frontend/src/components/ui/AlertDialog.tsx`

**Step 1: 标出重复的页头结构**

- 找出标题、副标题、右侧主操作区域的重复写法。

**Step 2: 标出重复的筛选区结构**

- 找出搜索框、下拉筛选、边框容器的重复写法。

**Step 3: 标出重复的表格骨架**

- 找出 `loading / empty / table / pagination` 的重复块。

**Step 4: 标出重复的表单弹窗结构**

- 找出新增 / 编辑弹窗中外层结构的重复写法。

### Task 3: 新增前端 CRUD 组合组件

**Files:**
- Create: `frontend/src/components/crud/PageHeader.tsx`
- Create: `frontend/src/components/crud/FilterBar.tsx`
- Create: `frontend/src/components/crud/DataTable.tsx`
- Create: `frontend/src/components/crud/RowActions.tsx`
- Create: `frontend/src/components/crud/FormDialog.tsx`
- Create: `frontend/src/components/crud/StatusBadge.tsx`
- Modify: `frontend/src/components/ui/Table.tsx`（仅当需要补类型或导出辅助 props）

**Step 1: 实现 `PageHeader`**

- 提供标题、副标题、actions 容器。

**Step 2: 实现 `FilterBar`**

- 提供筛选控件容器和统一边框 / 间距。

**Step 3: 实现 `DataTable`**

- 统一包裹筛选区、表格区、空态、加载态和分页区。

**Step 4: 实现 `RowActions`**

- 统一按钮区折行和间距。

**Step 5: 实现 `FormDialog`**

- 统一新增 / 编辑弹窗标题与内容外壳。

**Step 6: 实现 `StatusBadge`**

- 支持启用 / 禁用、角色、HTTP 方法等常用状态样式。

**Step 7: 跑前端 lint**

Run: `cd frontend && yarn lint`

Expected: 新增组件本身无 ESLint 报错。

### Task 4: 用组合组件重构用户管理页

**Files:**
- Modify: `frontend/src/pages/Users.tsx`
- Use: `frontend/src/components/crud/PageHeader.tsx`
- Use: `frontend/src/components/crud/DataTable.tsx`
- Use: `frontend/src/components/crud/FilterBar.tsx`
- Use: `frontend/src/components/crud/RowActions.tsx`
- Use: `frontend/src/components/crud/FormDialog.tsx`
- Use: `frontend/src/components/crud/StatusBadge.tsx`

**Step 1: 替换页头**

- 用 `PageHeader` 替代原有标题与新增按钮布局。

**Step 2: 替换搜索区和表格容器**

- 用 `DataTable` + `FilterBar` 收敛搜索框、空态、加载态和分页容器。

**Step 3: 替换行内操作区**

- 用 `RowActions` 承载编辑、启用 / 禁用、删除。

**Step 4: 替换状态与角色展示**

- 用 `StatusBadge` 统一状态色和角色色。

**Step 5: 替换新增 / 编辑弹窗外壳**

- 用 `FormDialog` 承载 `UserForm`。

**Step 6: 跑前端 lint**

Run: `cd frontend && yarn lint`

Expected: `Users.tsx` 无新增 lint 问题。

### Task 5: 用组合组件重构选项组和可选项页面

**Files:**
- Modify: `frontend/src/pages/DictTypes.tsx`
- Modify: `frontend/src/pages/DictItems.tsx`
- Use: `frontend/src/components/crud/*`

**Step 1: 重构 `DictTypes.tsx` 页头与列表骨架**

- 用 `PageHeader`、`DataTable`、`FilterBar`、`RowActions`、`StatusBadge` 替换重复结构。

**Step 2: 重构 `DictTypes.tsx` 弹窗外壳**

- 用 `FormDialog` 承载选项组表单。

**Step 3: 重构 `DictItems.tsx` 页头与列表骨架**

- 用相同组合组件收敛结构，但保留当前“返回 + 上下文说明”的业务内容。

**Step 4: 重构 `DictItems.tsx` 弹窗外壳**

- 用 `FormDialog` 承载可选项表单。

**Step 5: 跑前端 lint**

Run: `cd frontend && yarn lint`

Expected: `DictTypes.tsx` 和 `DictItems.tsx` 无新增 lint 问题。

### Task 6: 补齐统一表单字段和表单错误流

**Files:**
- Create: `frontend/src/components/ui/Textarea.tsx`
- Create: `frontend/src/components/ui/FormField.tsx`
- Create: `frontend/src/hooks/useFormError.ts` 或 `frontend/src/lib/form-error.ts`
- Modify: `frontend/src/components/ui/Input.tsx`
- Modify: `frontend/src/components/ui/Select.tsx`
- Modify: `frontend/src/components/ui/Checkbox.tsx`
- Modify: `frontend/src/pages/Users.tsx`
- Modify: `frontend/src/pages/DictTypes.tsx`
- Modify: `frontend/src/pages/DictItems.tsx`
- Modify: `frontend/src/pages/Settings.tsx`

**Step 1: 实现 `FormField` 容器**

- 统一 `label / hint / error / required` 结构。

**Step 2: 实现 `Textarea`**

- 让设置页和后续表单不再手写原生 `textarea` 样式。

**Step 3: 收敛现有字段组件**

- 让 `Input`、`FormSelect`、`FormCheckbox` 在错误提示和间距上更一致。

**Step 4: 增加轻量表单错误工具**

- 统一接口错误转换和表单级错误展示模式。

**Step 5: 重构设置页**

- 用统一字段容器替代当前手写 label + textarea 结构。

**Step 6: 重构用户、选项组、可选项表单**

- 统一字段排版、提示文案、错误展示和提交态。

**Step 7: 跑前端 lint**

Run: `cd frontend && yarn lint`

Expected: 表单相关页面和新组件无 lint 报错。

### Task 7: 修复现有认证 Hook 的 lint 问题并收敛最小认证状态结构

**Files:**
- Modify: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/layouts/MainLayout.tsx`
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Register.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`

**Step 1: 解决 `react-hooks/set-state-in-effect` 报错**

- 重写初始化流程，避免在 effect 同步设置 `loading`。

**Step 2: 保持现有使用方式可用**

- 不在本轮引入完整 `AuthProvider`，只做最小修正，避免任务扩散。

**Step 3: 跑前端 lint**

Run: `cd frontend && yarn lint`

Expected: 当前已知 lint 报错被消除。

### Task 8: 拆分前端 HTTP、类型与 API 模块

**Files:**
- Create: `frontend/src/lib/http.ts`
- Create: `frontend/src/lib/types/auth.ts`
- Create: `frontend/src/lib/types/user.ts`
- Create: `frontend/src/lib/types/dict.ts`
- Create: `frontend/src/lib/types/file.ts`
- Create: `frontend/src/lib/types/notification.ts`
- Create: `frontend/src/lib/types/operation-log.ts`
- Create: `frontend/src/lib/types/setting.ts`
- Create: `frontend/src/lib/api/auth.ts`
- Create: `frontend/src/lib/api/users.ts`
- Create: `frontend/src/lib/api/dict.ts`
- Create: `frontend/src/lib/api/files.ts`
- Create: `frontend/src/lib/api/notifications.ts`
- Create: `frontend/src/lib/api/operation-logs.ts`
- Create: `frontend/src/lib/api/settings.ts`
- Modify: `frontend/src/lib/api.ts`（改为兼容导出层，或删除后逐页替换）
- Modify: `frontend/src/pages/**/*.tsx`
- Modify: `frontend/src/hooks/**/*.ts`
- Modify: `frontend/src/components/**/*.tsx`

**Step 1: 提取 axios 实例到 `http.ts`**

- 保留现有 token 注入和 401 处理逻辑。

**Step 2: 提取领域类型**

- 按领域拆类型，避免继续集中堆在一个文件里。

**Step 3: 提取领域 API**

- 按领域拆请求文件，继续保留薄封装。

**Step 4: 逐页替换 import**

- 保证每个页面只导入所需领域的类型和 API。

**Step 5: 清理旧聚合文件**

- 根据实际迁移方式选择保留兼容出口或完全删除。

**Step 6: 跑前端 lint**

Run: `cd frontend && yarn lint`

Expected: import 路径和类型引用全部正确。

### Task 9: 新增后端 router 模块并拆分路由注册

**Files:**
- Create: `backend/src/router/mod.rs`
- Create: `backend/src/router/auth.rs`
- Create: `backend/src/router/user.rs`
- Create: `backend/src/router/admin.rs`
- Create: `backend/src/router/dict.rs`
- Create: `backend/src/router/file.rs`
- Create: `backend/src/router/notification.rs`
- Modify: `backend/src/main.rs`

**Step 1: 创建 router 模块目录**

- 为领域路由拆分准备结构。

**Step 2: 提取认证与用户路由**

- 将 `/api/auth/*`、`/api/users/me` 等注册迁出 `main.rs`。

**Step 3: 提取管理端领域路由**

- 将用户、字典、操作日志等管理端路由按领域拆出。

**Step 4: 提取文件和通知路由**

- 将 `/api/files/*`、`/api/notifications*` 路由拆出。

**Step 5: 在 `main.rs` 中合并子路由**

- 保持中间件挂载和状态注入逻辑不变。

**Step 6: 跑后端编译检查**

Run: `cd backend && cargo check`

Expected: 编译通过，接口路径不变。

### Task 10: 做一轮端到端验证

**Files:**
- Verify existing frontend/backend files

**Step 1: 前端 lint**

Run: `cd frontend && yarn lint`

Expected: PASS

**Step 2: 后端编译检查**

Run: `cd backend && cargo check`

Expected: PASS

**Step 3: 前端构建**

Run: `cd frontend && yarn build`

Expected: PASS

**Step 4: 手动回归关键页面**

- 登录页
- 用户管理页
- 选项组页
- 可选项页
- 设置页

**Step 5: 重点确认**

- CRUD 骨架是否统一
- 表单错误和提交态是否正常
- API 拆分后页面行为是否不变
- 路由拆分后后端行为是否不变

### Task 11: 更新文档与任务状态

**Files:**
- Modify: `README.md`（如新增目录结构说明有必要）
- Modify: `TODO.md`

**Step 1: 视实际情况补项目结构说明**

- 如果新增 `components/crud`、`lib/api`、`router` 后结构变化明显，则补 README。

**Step 2: 更新 TODO**

- 将已完成项和剩余回归项同步到 `TODO.md`。
