# PayMood

## 维护状态（2026-10-31）

后续仅维护 [VS Code 插件](vscode-extension/README.md)。网站已归档、停止维护，源代码保留在原位置；此状态不表示网站已下线。本文其余网站说明及 `PROJECT.md` 中的网站背景保留作历史参考。插件仍依赖的共享计算模块继续按插件需求维护。

PayMood 是一个安静的工作日进度与预估收入仪表盘，面向日常工作者。它以浏览器优先的 Next.js 应用运行，同时包含一个 VS Code 扩展，用于在编辑器里展示同一套工作进度/收入状态。

## 它做什么

- 显示今天的工作进度、剩余时间和当前预估已赚收入。
- 显示本周和本月的预估累计收入。
- 将工作时间、薪资、货币、颜色模式和陪伴宠物设置保存在本机。
- 包含一个小型桌面宠物：它会移动、响应工作状态、悬停时暂停，并在不干扰卡片和控件的前提下移动到页面空白点击位置。
- 提供 VS Code 扩展，并复用网站里的同一套工作时间/薪资计算逻辑。

PayMood 刻意保持简单。它不是工资系统、税务建议、HR 软件，也不是正式工资记录来源。

## 计算模型

核心计算逻辑位于 `lib/earnings.ts`。

网站、宠物 UI 和 VS Code 扩展都会使用共享的 `calculateWorkEarnings()` 入口来计算：

- 今天已赚收入
- 工作日进度
- 剩余工作时间
- 本周已赚收入
- 本月已赚收入
- 标准化小时工资

对于月薪，本月累计会使用当前日历月的实际排班工作小时数。一个完整完成的工作月应加总到用户输入的月薪，而不是使用 `52 / 12` 这类固定平均月份。

## 项目结构

- `app/` - Next.js App Router 页面。
- `components/` - 仪表盘、设置、法律页面和宠物 UI。
- `hooks/` - 浏览器状态、时钟、设置和宠物行为 hooks。
- `lib/` - 共享计算、设置和宠物 mood/message 逻辑。
- `styles/` - 全局样式和设计 token。
- `test/` - 面向计算 helper 和宠物 mood 规则的 Vitest 覆盖。
- `vscode-extension/` - PayMood VS Code 扩展源码和 webview 资源。

## 快速开始

安装依赖：

```bash
pnpm install
```

本地运行网站：

```bash
pnpm dev
```

运行测试：

```bash
pnpm test
```

构建网站：

```bash
pnpm build
```

## AdSense 部署开关

`.env.example` 默认开启 AdSense，用于生产审核/部署默认值。中国本地或无广告环境可以省略 `NEXT_PUBLIC_ADSENSE_ENABLED`，或将它设为 `false`。

- `NEXT_PUBLIC_ADSENSE_ENABLED=true` 会启用 AdSense 渲染。
- 同时必须设置 `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` 和 `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT`。
- 如果 `NEXT_PUBLIC_ADSENSE_ENABLED` 缺失或不是 `true`，页面不会注入 AdSense script 或 meta tag。

## VS Code 扩展

扩展位于 `vscode-extension/`，并从 `lib/` 导入共享项目代码。

常用命令：

```bash
pnpm --filter paymood typecheck
pnpm --filter paymood build
pnpm --filter paymood test
```

## 开发注意事项

- 开始 AI 辅助修改前，先阅读 `AGENTS.md` 和 `.aidw/AI_project.md`。
- 优先复用现有 components、hooks、utilities 和设计 token。
- 计算逻辑应保持在共享 helper 中，确保网站和 VS Code 扩展一致。
- 新增或修改 UI 前，先阅读 `UI_STYLE_GUIDE.md`。
