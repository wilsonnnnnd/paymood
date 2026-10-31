# PayMood 项目说明

## 当前范围（2026-10-31）

本仓库仅维护 VS Code 插件。网页版已移除，用户已确认删除 Vercel 项目；不恢复网站、不新增网站部署。`vercel.json` 禁止所有分支的 Git 自动部署，配置需推送后才会被远端读取。

## 技术与结构

- TypeScript、VS Code Extension API、esbuild、pnpm workspace。
- `vscode-extension/src/extension.ts`：插件入口、状态栏、页面通信和计时。
- `vscode-extension/src/storage.ts`：本地设置、活动记录、发薪日变更和计时间隔处理。
- `vscode-extension/media/`：插件页面及样式。
- `lib/earnings.ts`、`lib/payCycle.ts`、`lib/settings.ts`、`lib/settingsModel.ts`：插件复用的纯计算和设置模块。
- 无后端、数据库或远程薪资存储。节假日卡片沿用已有的公开节假日接口。

## 产品约束

收入是按排班和薪资计算的估算值，不是工资账本。编码与思考时长单独统计；VS Code 保持焦点时，Chat、Codex、Claude 面板及集成终端的使用时间也计入活动时长。窗口失去焦点后停止计时。缺失心跳超过 20 秒的间隔不计时，以减少休眠导致的虚增。

## 开发要求

优先复用现有计算、设置及页面逻辑，保持修改聚焦。遵守 `AGENTS.md` 的资源限制，负载任务串行，测试最多两个 worker。默认只运行相关类型检查及单元测试，不运行构建或 UI 自动化，除非用户要求。

- `pnpm typecheck`：插件类型检查。
- `pnpm test`：共享计算、插件页面及存储测试，依次运行。
- `pnpm build`：插件构建，仅在需要时执行。

## 安全边界

不读取或修改 `.env*`、凭证及用户薪资数据。部署、发布、依赖变更与第三方素材处理须在用户明确授权范围内进行。不新增外部遥测、AI 调用或远程持久化。保留现有 VS Code Marketplace 发布工作流，本次网站移除不发布插件。
