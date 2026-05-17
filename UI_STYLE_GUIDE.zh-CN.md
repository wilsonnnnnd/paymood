# PayMood — UI 风格指南（中文团队协作版）

本文件是产品 UI 系统的中文协作基准。
在 Dashboard 与 Settings 页面新增或修改视觉前，请先阅读本指南。

## 产品宇宙

PayMood 是一个统一的「情绪化生产力 OS」，包含两个视图：

- Dashboard：实时进度与收益主视图
- Settings：平静、克制的系统控制面板

两者必须属于同一个产品宇宙，不能出现割裂的两套风格。

## 品牌定位

- 产品名：`PayMood`
- 域名标签：`paymood.work`
- 定位：一个平静陪伴用户工作日的可视化界面，表达时间流逝与收入增长

## 产品意图

本产品明确不是：

- KPI 工具
- 企业后台管理面板
- 高密度分析看板
- 游戏化主导界面

本产品应当安静地呈现：

- 时间正在流逝
- 收入正在累积
- 距离下班还剩多少时间

## 核心体验原则

1. 时间是第一信号

- 进度与剩余时间必须一眼可读
- 次级模块不能与圆环 + 金额中心争夺视觉主导

2. 数字要有情绪

- 收入应被感知为“在生长”，而不是“在报表化展示”
- 避免会计表格感、报表感布局

3. 动效应是氛围，不是表演

- 优先呼吸感光晕与柔和淡入淡出
- 禁止跳跃、俏皮、噪声化的动态反馈

4. 稀疏层级

- 更少表面层、更有意图的留白
- 新增 UI 必须有明确价值

## 统一视觉语言

### 布局

- 单主舞台、居中容器布局
- 圆形进度与金额读数始终是主角
- 辅助指标保持紧凑、克制
- 控件与设置是服务层，而非视觉主角

### 形状与密度

- 圆润、柔和，但不幼态
- 主容器大圆角，控件中圆角
- 避免网格化看板、密集卡片、复杂图表

## 主题策略

### Light mode（晨间工作空间）

- 轻盈白色玻璃表面
- 冷调日光渐变
- 柔和环境光

### Dark mode（午夜工作空间）

- 深海军蓝背景
- 冷蓝光晕层级
- 天空蓝主强调色
- 禁止琥珀色作为主强调色

琥珀色只允许用于 warning（警示）语义状态。

## Token 系统（强制）

所有组件颜色必须来自 `styles/globals.css` 中的 CSS 变量。
禁止在 TSX 组件中硬编码品牌色。

### 语义 token 分组

- Surface：`--surface-base`、`--surface-raised`、`--surface-floating`、`--surface-overlay`
- Text：`--text-primary`、`--text-secondary`、`--text-muted`
- Border：`--border-ghost`、`--border-soft`、`--border-active`
- Glow：`--glow-ambient`、`--glow-accent`、`--glow-ring`、`--glow-focus`、`--glow-success`、`--glow-danger`、`--glow-warning`
- State：`--state-hover`、`--state-active`
- Motion：`--ease`、`--ease-spring`、`--dur`、`--dur-fast`、`--dur-slow`

### 兼容别名

历史别名仍保留（`--surface`、`--surface-strong`、`--border`、`--text`、`--muted`、`--focus`），但新样式优先使用语义 token。

### Settings token 约束

`--s-*` 仅作为共享语义 token 的包装层。
除非有明确例外，不要新增独立的深色专用 `--s-*` 覆盖块。

## 组件规则

### Shell 与卡片

- 使用统一的 surface 层级：
  - base：日常区块
  - raised：轻抬升控件 / 气泡
  - floating：弹窗与顶层面板
- 使用 ghost/soft 边框，不使用高对比硬线

### 圆环与中心主区

- 圆环统一使用 `--ring-track`、`--ring-ink`、`--ring-glow`
- 圆环保持干净：无刻度、无图表叠层
- 金额读数始终是中心锚点

### 交互状态

- pressed/selected 使用 `--state-active` + `--border-active`
- hover 使用 `--state-hover`
- 禁止硬编码黄/橙色状态底

### Pet 氛围层

- 情绪色必须来自语义 glow（`--glow-warning`、`--glow-ambient`、`--glow-danger` 等）
- 气泡背景与边框必须使用语义 surface/border token
- 正向状态禁止使用硬编码 amber utility class

## 字体与排版

- 关键数字使用 `var(--font-mono)`
- 数字对齐使用 `font-variant-numeric: tabular-nums`
- 文案语气保持平静、克制，避免企业报表口吻

## 动效与可访问性

允许：

- 缓慢呼吸光效
- 柔和透明度/模糊过渡
- 克制的环境循环动效

避免：

- 以弹簧回弹为主导的动效语言
- 俏皮抖动类动效
- 高频、噪声化微交互

可访问性：

- 必须尊重 `prefers-reduced-motion`，关闭非必要动画

## Tailwind v4 约定

任意值变量写法统一为 Tailwind v4 规范：

- 优先 `border-(--token)`，不要写 `border-[var(--token)]`
- 优先 `bg-(--token)`，不要写 `bg-[var(--token)]`
- 若有对应尺度工具类，优先使用（例如 `max-w-70`）

## 文案语气

- 平静、支持、有人味
- 禁止效率羞辱、绩效施压语义
- 句子短、稳定、不过度煽动

## UI 变更检查清单

- 使用 `styles/globals.css` 里的语义 token
- 保证 Dashboard 与 Settings 属于同一视觉宇宙
- 保持圆环 + 金额为 Dashboard 第一层级
- 深色主题维持冷蓝主调（禁止 amber 作为主强调）
- 保持低密度与留白优先
- 动效克制并支持 reduced-motion
- 文案支持性、非评判
