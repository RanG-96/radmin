# Cleanup Release Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 对当前“选项配置 + 本地优先开发 + 用户管理易用性”这一批改动做最小收尾清理，并提交一个可验证版本。

**Architecture:** 不新增能力，只清理运行时旧术语、当前已知冗余字段和任务跟踪信息。提交时仅纳入与本批功能直接相关的文件，避免污染脏工作区中的其他变更。

**Tech Stack:** Rust, Axum, SQLx, React, Vite, Markdown, Git

---

### Task 1: 补齐收尾文档

**Files:**
- Create: `documents/cleanup_release_design.md`
- Create: `plans/2026-05-03-cleanup-release-plan.md`
- Modify: `TODO.md`

**Step 1: 写设计文档**

- 记录这次清理的边界、取舍、风险和验证方式。

**Step 2: 写实施计划**

- 明确需要改动的代码、文档和验证命令。

**Step 3: 更新 TODO**

- 记录“收尾清理与版本提交”已纳入当前任务闭环。

### Task 2: 清理后端冗余与旧术语

**Files:**
- Modify: `backend/src/model/notification.rs`
- Modify: `backend/src/service/notification.rs`
- Modify: `backend/src/handler/dict.rs`
- Optional Modify: `backend/src/service/dict.rs`

**Step 1: 删除未使用字段**

- 移除 `CreateNotification.send_email`，同时确认服务层没有依赖。

**Step 2: 统一返回文案**

- 将当前接口返回里的“字典类型 / 字典项”改成“选项组 / 可选项”。

**Step 3: 视需要同步服务层错误文案**

- 仅在确认会直接暴露给管理端时调整，不扩大改动范围。

### Task 3: 清理前端与使用说明文案

**Files:**
- Modify: `frontend/src/pages/DictItems.tsx`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: 统一页面文案**

- 把“正在加载所属字典类型...”改成管理员更容易理解的表述。

**Step 2: 对齐 README 与 TODO 的当前命名**

- 将面向当前使用者的说明统一到“选项配置 / 选项组 / 可选项”。
- 保留历史设计文档原貌，不做大范围替换。

### Task 4: 验证

**Files:**
- Verify existing codebase

**Step 1: 后端检查**

Run: `cd backend && cargo check`

Expected:
- 成功
- 不再出现 `send_email` 未使用 warning

**Step 2: 后端定向测试**

Run: `cd backend && cargo test service::dict::tests -- --nocapture`

Expected:
- PASS

Run: `cd backend && cargo test service::user_admin::tests -- --nocapture`

Expected:
- PASS

**Step 3: 前端构建**

Run: `cd frontend && npm run build`

Expected:
- 成功产出构建结果

### Task 5: 提交版本

**Files:**
- Stage only related files

**Step 1: 检查暂存范围**

Run: `git status --short`

Expected:
- 仅暂存本次相关文件

**Step 2: 创建提交**

Run: `git commit -m "feat: finalize admin scaffold cleanup"`

Expected:
- 提交成功
