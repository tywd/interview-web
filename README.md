# AI Interview Web

基于 `Vue 3 + Nuxt 3 + TypeScript + Naive UI + Vite` 的 AI 面试工具原型。

## 功能

- 分析简历内容质量、关键词覆盖与成果表达
- 分析岗位 JD 的要求、加分项与切题风险
- 分析公司业务特征、文化节奏与适配风险
- 生成综合匹配度、简历优化建议与面试建议
- 追踪简历优化前后版本
- 追踪面试准备进度与任务看板

## 启动

```bash
pnpm install
pnpm dev
```

## 生产启动

不要直接执行 `.nuxt/dist/server/server.mjs`。这是 Nuxt 开发阶段的内部产物，缺少运行时别名解析，直接运行会报类似 `#internal/nuxt/paths` 的错误。

请使用下面的正式方式：

```bash
pnpm build
pnpm start
```

## 说明

当前版本使用本地 mock 分析逻辑，接口位于 `server/api/analyze.post.ts`。后续可将 `server/utils/analyzer.ts` 替换为真实大模型调用逻辑。
