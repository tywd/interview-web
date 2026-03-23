import type { ProgressItem, WorkspaceState } from '~/types/interview'

export const defaultResume = `张晨
5年前端开发经验，主导过企业级后台、数据可视化与 AI 产品前端落地。

核心能力
- Vue 3 / TypeScript / Nuxt / Vite / Node.js
- 组件设计、性能优化、前端工程化、低代码平台
- 与算法、产品、设计协作，推动复杂需求拆解与上线

项目经历
1. AI 知识助手平台
负责工作台、提示词配置、对话记录与权限系统，推动首屏性能提升 37%。
2. 数据分析中台
负责图表渲染层与配置化页面能力，支撑多个业务线自助搭建数据大屏。

教育经历
华东理工大学 计算机科学与技术`

export const defaultJD = `高级前端工程师 / AI 应用方向

岗位职责
- 负责 AI 产品 Web 端架构设计与核心功能开发
- 与算法、后端、产品协作，推进智能工作流、知识库、面试助手等功能上线
- 持续优化工程效率、可维护性与用户体验

任职要求
- 精通 Vue 3、TypeScript、工程化体系
- 有复杂中后台、SaaS 或 AI 产品经验
- 具备良好的业务抽象、沟通协作与性能优化能力
- 有 Nuxt、SSR、可视化平台经验优先`

export const defaultCompany = `星桥智能是一家专注企业级 AI Copilot 的 SaaS 公司，面向招聘、销售与客户成功团队提供智能助手工具。

公司特点
- 强调业务落地与交付速度
- 产品节奏快，要求工程师具备独立推进能力
- 注重数据反馈、实验迭代与跨团队协同
- 技术栈偏现代前端，重视组件复用与平台化能力`

export const defaultProgress: ProgressItem[] = [
  {
    id: 'p1',
    label: '补强 AI 项目成果量化',
    status: 'doing',
    owner: '候选人',
    dueDate: '2026-03-24',
  },
  {
    id: 'p2',
    label: '整理公司业务理解与提问清单',
    status: 'todo',
    owner: '候选人',
    dueDate: '2026-03-25',
  },
  {
    id: 'p3',
    label: '完成一轮模拟面试复盘',
    status: 'done',
    owner: '候选人',
    dueDate: '2026-03-20',
  },
]

export const defaultWorkspace = (): WorkspaceState => ({
  resumeText: defaultResume,
  jdText: defaultJD,
  companyText: defaultCompany,
  snapshots: [
    {
      id: 's1',
      title: '初始版本',
      content: defaultResume,
      createdAt: '2026-03-18 20:00',
      score: 71,
      notes: ['项目成果可量化程度偏弱', 'JD 关键词映射不够集中'],
    },
  ],
  progress: defaultProgress,
  latestReport: null,
  lastAnalyzedAt: null,
})
