# PayMood

PayMood 现仅维护 [VS Code 插件](vscode-extension/README.md)，在编辑器中显示工作日进度、预估收入、编码与思考时长。

## 维护状态（2026-10-31）

网页版的 Next.js 页面、组件、浏览器 hooks、样式及相关依赖已移除。网站历史实现可从 Git 历史查阅，原图片和第三方素材保留。用户已确认删除 Vercel 项目；仓库的 `vercel.json` 另设 `git.deploymentEnabled: false`，禁止 Git 自动部署。该配置需推送到相应分支才会被远端读取。

## 项目结构

- `vscode-extension/`：插件源码、页面资源与回归测试。
- `lib/earnings.ts`、`lib/payCycle.ts`、`lib/settings.ts`、`lib/settingsModel.ts`：插件依赖的计算与设置模块。
- `test/`：共享收入及发薪周期计算测试。

## 开发与验证

使用现有 pnpm workspace 安装依赖后，在仓库根目录运行：

```bash
pnpm typecheck
pnpm test
```

`pnpm test` 依次运行共享计算、插件页面和插件存储测试，Vitest 最多使用两个 worker。

插件构建命令为 `pnpm build`；在 VS Code 中选择 **Run paymood Extension** 可启动扩展开发宿主。

薪资和设置保存在本机。预估收入按排班计算，活动时长单独统计；VS Code 内的 AI 面板和终端使用时间包含在窗口保持焦点期间的活动时长中。
