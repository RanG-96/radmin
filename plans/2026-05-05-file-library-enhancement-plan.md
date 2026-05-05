# File Library Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前文件页面从最小上传示例补成适合中小型后台复用的轻量附件库，增加搜索、筛选、预览、复制链接以及上传约束。

**Architecture:** 保持现有 `files` 表、路由结构和页面结构不变，在后端列表与上传接口上做轻量增强，在前端 `Files.tsx` 与 `FileUpload.tsx` 上补常见后台附件交互。继续遵循“轻封装、业务逻辑留在页面和 service”的原则。

**Tech Stack:** React, TypeScript, TanStack Query, Axios, Rust, Axum, SQLx

---

### Task 1: 更新文档门禁与任务跟踪

**Files:**
- Create: `documents/file_library_design.md`
- Create: `plans/2026-05-05-file-library-enhancement-plan.md`
- Modify: `TODO.md`

**Step 1: 写设计文档**

- 记录本轮文件模块增强的背景、边界、交互和验证方式。

**Step 2: 写实施计划**

- 将后端、前端与验证拆成可直接执行的任务。

**Step 3: 更新 TODO**

- 将“轻量附件库增强”加入当前任务跟踪。

### Task 2: 增强后端文件模型与查询参数

**Files:**
- Modify: `backend/src/model/file.rs`
- Modify: `backend/src/handler/file.rs`
- Modify: `backend/src/service/file.rs`

**Step 1: 增加列表查询参数结构**

- 为文件列表增加 `keyword` 和 `mime_type` 查询参数。

**Step 2: 扩展文件返回结构**

- 为 `FileResponse` 增加 `uploader_name`。

**Step 3: 收敛 MIME 分组判断**

- 在 service 中实现图片、文档、音视频、其他的过滤映射。

### Task 3: 增强后端上传校验与列表查询

**Files:**
- Modify: `backend/src/handler/file.rs`
- Modify: `backend/src/service/file.rs`
- Modify: `backend/src/config.rs`（仅当需要新增可配置上限时）

**Step 1: 实现上传大小校验**

- 默认限制 10MB。

**Step 2: 实现上传类型校验**

- 允许图片、PDF、Office 常见格式、文本、压缩包、音视频常见格式。

**Step 3: 实现列表筛选 SQL**

- 支持文件名关键字模糊搜索和 MIME 分组过滤。

**Step 4: 保持下载和删除接口不变**

- 避免把本轮需求扩散到文件生命周期重构。

### Task 4: 增强前端文件 API 和类型

**Files:**
- Modify: `frontend/src/lib/types/file.ts`
- Modify: `frontend/src/lib/api/files.ts`

**Step 1: 扩展文件类型定义**

- 增加 `uploader_name`。

**Step 2: 扩展列表请求参数**

- 增加 `keyword` 和 `mime_type`。

### Task 5: 增强上传组件

**Files:**
- Modify: `frontend/src/components/ui/FileUpload.tsx`

**Step 1: 增加前端上传前校验**

- 校验大小和 MIME 类型。

**Step 2: 增加辅助文案和反馈**

- 显示支持格式、大小上限、上传成功、上传失败。

**Step 3: 保持组件轻量**

- 不引入上传队列和多文件复杂状态。

### Task 6: 增强文件管理页面

**Files:**
- Modify: `frontend/src/pages/Files.tsx`

**Step 1: 增加筛选区**

- 关键字搜索
- 类型筛选

**Step 2: 增加列信息**

- 上传人
- 文件链接

**Step 3: 增加行操作**

- 预览
- 复制链接
- 下载
- 删除

**Step 4: 完善异常提示和空态**

- 区分“暂无文件”和“无筛选结果”。

### Task 7: 执行验证

**Files:**
- Verify existing backend/frontend files

**Step 1: 跑前端检查**

Run: `cd frontend && yarn lint`

Expected: 文件模块相关代码无 lint 报错。

**Step 2: 跑前端构建**

Run: `cd frontend && yarn build`

Expected: 构建通过。

**Step 3: 跑后端检查**

Run: `cd backend && cargo check`

Expected: 编译检查通过。

**Step 4: 跑接口冒烟**

- 登录获取 token
- 调用文件列表接口验证筛选参数
- 调用上传接口验证大小 / 类型限制

Expected: 正常场景成功，非法上传返回明确错误。
