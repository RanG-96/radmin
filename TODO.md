# TODO

## ✅ 已完成

- 选项配置生命周期方案确认：采用“启用/禁用为主，删除仅允许空选项组”的规则
- 选项配置设计文档：明确唯一性约束、删除门禁、前端交互与错误反馈
- 选项配置实施计划：拆分后端、前端与验证步骤
- 后端 migration：补 `dict_items` 同类型内唯一约束
- 后端服务与接口：补删除门禁、重复值校验、类型详情查询
- 前端类型页：补状态操作、删除门禁、错误反馈
- 前端可选项页：补所属选项组上下文、状态操作、错误反馈
- 构建验证：执行 `cargo check` 与 `npm run build`
- Docker 镜像前缀方案确认：采用“可配置前缀，默认官方镜像”的方式
- Docker 镜像前缀设计文档与实施计划已补齐
- Docker 构建配置改造：为 frontend/backend Dockerfile 和 compose 增加 `IMAGE_REGISTRY`
- Docker 使用文档更新与 compose 配置验证
- Docker 统一镜像前缀：`postgres:16-alpine` 已纳入同一 `IMAGE_REGISTRY`
- Docker 真实拉取验证：`docker.1ms.run/library/postgres:16-alpine` 已验证可拉取
- 管理员易用性重构方案确认：采用“选项配置 + 显式操作列 + 后端适度收敛”
- 管理员易用性重构设计文档与实施计划已补齐
- 选项配置前端重构：已完成去术语化文案、说明和空状态优化
- 用户管理前端重构：已补显式操作列与统一错误反馈
- 后端用户管理收敛：已引入 `validator` 并下沉 service 逻辑
- 本地优先开发方案确认：默认使用本地 PostgreSQL 与前后端分别启动
- 本地优先开发与选项配置使用说明文档已补齐
- 本地优先开发改造：Makefile 与 README 已切换为本地 PostgreSQL 主路径
- 选项配置文档闭环：已补管理员使用说明与开发者消费说明
- 收尾清理方案确认：采用“最小运行时清理 + 精确暂存提交”
- 轻量脚手架可扩展性重构方案确认：采用“CRUD 组合组件 -> 统一表单 -> API 分模块 -> 后端路由拆分”的渐进式顺序
- 轻量脚手架可扩展性重构设计文档与实施计划已补齐
- CRUD 组合组件落地：已补 `PageHeader`、`FilterBar`、`DataTable`、`RowActions`、`FormDialog`、`StatusBadge`
- 统一表单方案落地：已补 `Textarea`、字段容器、错误映射和提交态收敛
- 前端 API 分模块：已拆为 `http.ts + types/ + api/`，并完成页面 import 迁移
- 后端路由拆分：已将 `backend/src/main.rs` 的路由注册按领域迁到 `backend/src/router/`
- 前端全量校验：`yarn lint` 与 `yarn build` 已通过
- 后端编译校验：`cargo check` 已通过
- Docker compose 配置校验：`docker compose config` 已通过，镜像前缀展开正确
- 迁移风险检查：本地数据库已确认不存在同选项组下重复 `value` 的历史数据
- 本地 API 运行态冒烟：`health`、登录、`users`、`settings`、`dict`、`files`、`notifications`、`operation-logs` 已验证通过
- 轻量附件库增强方案确认：采用“搜索 + 筛选 + 预览 + 复制链接 + 上传约束”的轻量增强方式
- 轻量附件库增强设计文档与实施计划已补齐
- 轻量附件库增强：已补文件搜索筛选、上传校验、预览和复制链接能力
- 轻量附件库接口回归：新实例已验证列表筛选、合法上传、非法类型拦截和删除能力

## ⏳ 待完成

- 选项配置人工回归：在真实页面确认启停、删除门禁和错误提示符合预期
- 页面人工回归：确认用户、设置、文件、通知、仪表盘与操作日志页在运行态行为正常
- Docker 整栈构建验证：待本机 Docker daemon 可用后执行 `IMAGE_REGISTRY=docker.1ms.run/library/ docker compose up --build -d`
- 版本提交：确认人工回归结果后整理暂存并提交本轮轻量脚手架重构
