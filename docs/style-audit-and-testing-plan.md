# 样式审查与测试计划

## 本次修改

已调整：

- 在 [`components/JourneySidebar.vue`](../components/JourneySidebar.vue) 中为 `.journey-sidebar` 增加了 `align-content: start;`
- 在 [`assets/styles/main.css`](../assets/styles/main.css) 中补充了边框、阴影、圆角、hover、focus 等全局设计 token
- 在 [`components/AppHeader.vue`](../components/AppHeader.vue) 和 [`components/JourneySidebar.vue`](../components/JourneySidebar.vue) 中补充了当前导航高亮与键盘焦点态
- 在 [`pages/journey/index.vue`](../pages/journey/index.vue) 中补充了基于可视区的阶段滚动联动高亮
- 在 [`components/JourneySidebar.vue`](../components/JourneySidebar.vue) 中补充了移动端横向滚动导航

目的：

- 避免侧边栏在可用高度较大时出现内容被均匀拉开的情况。
- 保持导航项从顶部开始排列，更符合文档型导航和阶段型导航的阅读习惯。
- 让用户滚动查看阶段说明时能明确知道当前所处阶段。
- 让移动端阶段导航不再纵向堆叠过长。

---

## 当前样式审查

### 结论

当前视觉方向整体是成立的，属于：

- `Neo Brutal Lite` 作为主基调
- `VitePress / docs-style` 作为信息组织方式
- `求职产品` 作为交互目标场景

这个组合是合理的，优点是：

- 首页有识别度，不像普通后台。
- 阶段页结构清晰，适合逐步扩展。
- 工作台页和阶段页风格一致，没有完全割裂。

但也有一些已经可以预见的中期问题。

---

## 当前比较合理的地方

### 1. 全局宽度

当前 [`assets/styles/main.css`](../assets/styles/main.css) 使用：

- `width: min(1440px, calc(100vw - 32px))`

这对现在的信息密度是合理的。

可参考范围：

- 文档型 / 落地页主容器：`1200px - 1440px`
- 工具型工作台：`1280px - 1440px`

当前项目属于“文档 + 工作台混合型”，所以 `1440px` 上限可以接受。

### 2. 间距体系

当前主间距大量使用：

- `24px`
- `18px`
- `14px`
- `10px`

这是比较稳定的 4px 栅格系。

可参考范围：

- 页面区块间距：`24px - 32px`
- 卡片内边距：`18px - 24px`
- 小控件间距：`10px - 14px`

当前没有明显失控。

### 3. 圆角和阴影

当前主要使用：

- panel radius：`24px`
- card radius：`18px - 20px`
- brutal 阴影：`4px 4px 0` 到 `8px 8px 0`

这个区间和当前视觉方向是匹配的。

可参考范围：

- 大容器：`20px - 28px`
- 卡片：`16px - 20px`
- brutal 阴影位移：`4px - 8px`

当前视觉上有连续性。

### 4. 标题层级

当前首页和阶段页的标题大量使用：

- `36px - 56px`
- 大写
- 紧凑行高

对于 Neo Brutal Lite 是成立的，尤其首页 hero 和阶段页 hero 都能撑住这个体量。

---

## 当前不太合理或值得继续优化的地方

### 1. 阴影和边框有重复硬编码

问题：

- 很多组件直接写了 `box-shadow: 8px 8px 0 rgba(20, 16, 12, 0.9)`
- 卡片内部也直接写了 `4px 4px 0 ...`
- 边框颜色也大量直接写死为 `rgba(20, 16, 12, 0.9)`

风险：

- 后面一旦要微调整体视觉，改动面会很大。
- 页面越多，风格越容易漂移。

建议：

- 在 [`assets/styles/main.css`](../assets/styles/main.css) 增加变量：
  - `--border-strong`
  - `--shadow-panel`
  - `--shadow-card`
  - `--radius-card`

### 2. 交互态还不够系统化

问题：

- 一些导航卡片和阶段卡片没有统一的 `hover / active / focus-visible`
- 表单页按钮较多，但视觉反馈不完全统一
- 键盘焦点态基本没有被系统定义

风险：

- 鼠标体验和键盘体验不一致
- 文档型页面进入表单型页面后，交互质感会下降

建议：

- 统一定义：
  - hover：轻微上浮 `translateY(-1px ~ -2px)`
  - active：回弹 `translateY(0)`
  - focus-visible：`outline` 或高对比边框

### 3. 侧边导航还缺“当前项”高亮

当前状态：

- `基础 active route` 已完成
- `scroll spy 联动高亮` 已完成

剩余空间：

- 还可以继续补充滚动时的 URL hash 同步
- 还可以补当前阶段进入视图时的轻微过渡反馈

问题：

- [`components/JourneySidebar.vue`](../components/JourneySidebar.vue) 目前只有普通链接样式
- 没有根据当前锚点或当前页面高亮阶段

风险：

- 用户在 `/journey` 页面滚动时不容易知道自己读到哪个阶段

建议：

- 后续增加：
  - 当前 section 高亮
  - hover 态
  - active route 态

### 4. 原生 checkbox 风格与整体视觉不完全统一

问题：

- 准备阶段页面仍使用原生 `<input type="checkbox">`

风险：

- 在 macOS / Windows / 浏览器之间会有视觉差异
- 与当前 Neo Brutal 风格不一致

建议：

- 后续替换为统一风格的选择控件
- 或至少增加自定义外观层

### 5. 页面长表单的移动端压缩还不够细

问题：

- 准备、投递、面试页面都有连续大段输入区
- 目前主要依赖单列布局兜底

风险：

- 手机上纵向滚动会很长
- CTA 和当前上下文距离太远

建议：

- 后续对移动端增加：
  - 折叠区块
  - 吸底操作区
  - 更短的默认 textarea 高度

---

## 视觉与交互建议范围

后续如果继续打磨，我建议遵守下面这组范围，不要随意漂移：

### 布局

- 页面主宽度：`1280px - 1440px`
- 大区块 gap：`24px - 32px`
- 卡片内部 gap：`12px - 20px`

### 字体

- Hero 标题：`42px - 72px`
- 二级标题：`28px - 40px`
- 正文：`15px - 18px`
- 辅助文字：`12px - 14px`

### 交互

- hover 位移：`-1px ~ -2px`
- transition 时长：`160ms - 220ms`
- brutal 卡片阴影：`4px ~ 8px`

### 视觉一致性

- 大容器半径：`24px`
- 中型卡片半径：`18px - 20px`
- 强边框：统一使用一个变量，不要到处硬编码

---

## 是否有必要接 Chrome MCP 做自动化测试

### 结论

有必要，但不是所有测试都依赖它。

更准确地说：

- `有必要用于浏览器级 smoke test 和视觉交互回归`
- `没必要把所有逻辑测试都押在 Chrome MCP 上`

原因：

这个项目已经不是纯静态页面，而是包含：

- 多页面路由跳转
- 动态导入页面
- 本地持久化
- 表单交互
- 服务端 API
- AI 结果渲染

这类项目最容易出的问题，恰恰是在浏览器里才会暴露：

- 返回路由时报动态模块 500
- localStorage 状态污染
- 按钮点击后页面没更新
- 表单数据有保存但没渲染
- 移动端布局崩掉

---

## 当前测试设计建议

### 1. 测试分层

建议分成三层，而不是只做一种测试：

- `单元测试`：校验纯函数、数据整理、AI mock 回退逻辑
- `组件 / 页面交互测试`：校验表单输入、按钮状态、模块显隐
- `浏览器级 E2E`：校验真实路由、动态导入、localStorage 持久化、API 回退链路

当前项目已经落地了第一版浏览器级 smoke test，覆盖：

- 首页、阶段页、工作台是否可打开
- 准备阶段 AI 检查与同步工作台
- 匹配阶段诊断生成
- 投递阶段记录持久化
- 面试阶段题库生成与复盘输出

### 2. Playwright 适合承担什么

Playwright 更适合做：

- 路由级 smoke test
- 表单主流程回归
- 浏览器返回、刷新、直达 URL
- SSR / CSR 切换后的错误发现
- localStorage 持久化验证

不适合把所有细节都塞进 E2E：

- 细粒度文案变更
- 每个卡片的样式像素级断言
- 所有 mock 分支组合爆炸

### 3. Chrome MCP 是否有必要

有必要，但应作为增强层，不应代替 Playwright。

建议分工：

- `Playwright`：稳定的 CI 自动化回归
- `Chrome MCP`：人工联调、视觉巡检、复杂交互探索、性能观察

Chrome MCP 更适合这些场景：

- 查看真实渲染后的布局和滚动体验
- 人工检查 hover / focus / sticky 导航是否自然
- 观察控制台报错、网络瀑布和懒加载时机
- 手动探索“返回后白屏”“动态导入失败”等偶发问题

### 4. 推荐的测试清单

第一批必须自动化：

- 首页到各阶段页的导航跳转
- 每个阶段页首屏 SSR 不报 500
- 准备阶段 AI 检查结果可见
- 一键同步到工作台后内容可回填
- 投递记录刷新后仍存在
- 面试复盘结果可生成并展示

第二批建议补上：

- 侧边导航当前项高亮
- 移动端视口下布局不重叠
- API 超时后自动回退 mock
- 空状态、异常态、加载态

第三批可选增强：

- 视觉快照测试
- 可访问性扫描
- Lighthouse 基础性能基线

### 5. 视觉交互的验证范围

建议把视觉交互验证控制在“可感知但不脆弱”的范围：

- 卡片 hover 是否有统一位移和阴影反馈
- focus-visible 是否清晰
- 侧边栏是否始终从顶部开始排布
- 长表单在移动端是否仍可操作
- 主 CTA 是否在首屏或接近首屏能被发现

不要过度验证：

- 每个像素值
- 每段文案的换行位置
- 浏览器字体渲染的微小差异

### 6. 当前代码层面的样式建议

现在比较值得继续收口的点：

- 把强边框、面板阴影、卡片阴影抽成全局 CSS 变量
- 为卡片、按钮、导航补一套统一的 `hover / active / focus-visible`
- 为阶段导航增加当前路由高亮
- 对原生 checkbox 做统一皮肤或替换为统一组件
- 将 Naive UI 中 SSR 不稳定的控件优先放在 `ClientOnly` 中

### 7. 实施顺序

建议按下面顺序推进：

1. 先保证所有关键页面可 SSR 打开，不出现 500
2. 再补齐主流程 Playwright smoke test
3. 然后做视觉交互统一和移动端修正
4. 最后再接入 Chrome MCP 做人工巡检与复杂场景探索

这类问题只靠 `typecheck` 和 `build` 抓不住。

---

## 推荐测试分层

### 1. 静态层

目标：

- 保证代码能过编译

建议：

- `pnpm typecheck`
- `pnpm build`

这是最低保障，必须保留。

### 2. 逻辑层

目标：

- 保证 composable 和纯函数逻辑正确

建议覆盖：

- `usePreparationPlanner`
- `useMatchPlanner`
- `useApplyPlanner`
- `useInterviewCoach`
- `server/utils/analyzer.ts`
- `server/utils/stage-copilot.ts`

建议工具：

- `vitest`

### 3. 浏览器流程层

目标：

- 验证用户关键流程真的能跑通

这里最值得做自动化。

建议关键流程：

1. 首页 -> `/journey` -> `/journey/prepare` 路由跳转正常
2. 准备阶段填写内容后刷新，状态仍在
3. 点击“AI 检查准备缺失”，结果正常渲染
4. 点击“一键同步到工作台”，`/workspace` 能看到同步后的内容
5. 匹配阶段点击生成诊断后，优势 / 差距 / 风险正常出现
6. 投递阶段新增一条投递记录后刷新，数据仍在
7. 面试阶段生成题库、写复盘、生成复盘建议可用
8. 浏览器返回前一页不会触发动态模块 500

建议工具：

- 优先：`Playwright`
- 补充：`Chrome MCP`

### 4. 视觉回归层

目标：

- 防止样式调整后版面失真

建议页面：

- `/`
- `/journey`
- `/journey/prepare`
- `/journey/match`
- `/journey/apply`
- `/journey/interview`
- `/workspace`

建议断点：

- `1440`
- `1024`
- `390`

建议工具：

- `Playwright screenshot`
- 或 `Chrome MCP` 截图比对

---

## Chrome MCP 的定位建议

Chrome MCP 很适合做：

- 真实浏览器导航
- 点击、输入、返回、刷新
- 截图检查
- 快速复现线上式交互问题

但它不适合单独承担：

- 大规模稳定 CI 回归
- 纯逻辑断言
- 高密度单元测试

更合理的定位是：

- `Chrome MCP 用于人工驱动式自动检查`
- `Playwright / Vitest 用于可重复回归`

也就是说：

- 开发时：用 Chrome MCP 快速看真实效果
- 提交前：用 Playwright 跑核心 E2E
- 持续集成：跑 typecheck + build + 部分 E2E

---

## 推荐测试设计

### 第一阶段：最小可用测试

建议先做 5 条：

1. 首页能正常打开
2. `/journey/prepare` 可填写并持久化
3. `/journey/match` 可生成诊断
4. `/journey/interview` 可生成题库
5. 浏览器返回不会报动态模块错误

### 第二阶段：阶段闭环测试

建议增加：

1. 准备阶段 -> 同步到工作台 -> 工作台显示更新
2. 工作台分析 -> 匹配阶段读取结果
3. 投递阶段新增记录 -> 刷新保留
4. 面试复盘生成后本地持久化

### 第三阶段：视觉回归测试

建议检查：

- 首页 hero 是否溢出
- 侧边导航是否顶对齐
- 卡片阴影是否统一
- 移动端按钮是否挤压换行异常

---

## 当前建议结论

短期内最值得做的不是继续改一堆视觉，而是：

1. 先把交互态和状态联动测起来
2. 给关键页面做浏览器级 smoke test
3. 再开始做视觉回归截图

如果资源有限，优先顺序建议是：

1. `typecheck + build`
2. `关键流程 E2E`
3. `视觉回归`
4. `更细的交互动效测试`

如果你下一步要我继续推进，我建议直接做：

- 一套最小 Playwright 测试
- 或一套 Chrome MCP 驱动的人工回归清单

这两条都比继续纯主观调样式更值。 
