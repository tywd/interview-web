import type {
  InterviewQuestionCard,
  InterviewReviewResult,
  MatchDiagnosisResult,
  PreparationProjectNote,
  PreparationReviewResult,
} from '~/types/interview'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

const DEFAULT_MODEL = 'deepseek-chat'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 6000

const getConfig = () => ({
  apiKey: env.DEEPSEEK_API_KEY?.trim(),
  model: env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL,
})

const hasConfig = () => Boolean(getConfig().apiKey)

const chatJson = async <T>(prompt: string): Promise<T | null> => {
  const { apiKey, model } = getConfig()
  if (!apiKey) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是资深求职顾问。只输出合法 JSON。' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`DeepSeek request timed out after ${REQUEST_TIMEOUT_MS}ms, falling back to mock.`)
      return null
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error(`DeepSeek 请求失败: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  const content = String(data.choices?.[0]?.message?.content || '').trim()
  try {
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

const countDone = (labels: Array<{ done: boolean }>) => labels.filter((item) => item.done).length

export const reviewPreparation = async (payload: {
  checklist: Array<{ label: string; done: boolean }>
  resumeText: string
  selfIntro: string
  projectNotes: PreparationProjectNote[]
}): Promise<PreparationReviewResult> => {
  const completionScore = Math.round((countDone(payload.checklist) / Math.max(payload.checklist.length, 1)) * 100)
  const missingItems = payload.checklist.filter((item) => !item.done).map((item) => item.label)
  const resumeWarnings = [
    !/\d+[%个项年月人次万]/.test(payload.resumeText) ? '简历缺少明确量化结果，建议补充效率、性能或业务指标。' : '',
    payload.resumeText.length < 180 ? '简历内容偏短，项目背景和职责拆解可能不够充分。' : '',
    payload.projectNotes.some((item) => !item.result.trim()) ? '存在项目证据未补充结果字段，后续很难支撑简历和面试表达。' : '',
  ].filter(Boolean)

  const rewrittenProjects = payload.projectNotes.map((project) => ({
    title: project.title || '未命名项目',
    bullet: `${project.title || '项目'}：${project.situation || '负责核心模块'}，${project.action || '主导关键功能实现'}，${project.result || '建议补充量化结果以增强说服力。'}`,
  }))

  const optimizedSelfIntro = payload.selfIntro.trim()
    ? `大家好，我有较稳定的前端交付经验，过去重点负责 ${payload.projectNotes[0]?.title || '复杂项目'} 等项目，擅长把业务目标拆成可落地的前端方案，并通过性能优化、组件抽象和跨团队协作推动结果落地。现在我希望寻找更贴近 AI 与平台化方向的岗位，把既有的交付和抽象能力转化为更直接的业务价值。`
    : '建议先补一版 1 分钟自我介绍底稿，再让 AI 做贴岗优化。'

  if (!hasConfig()) {
    return {
      completionScore,
      missingItems,
      resumeWarnings,
      rewrittenProjects,
      optimizedSelfIntro,
    }
  }

  try {
    const ai = await chatJson<PreparationReviewResult>(`请基于下面的准备阶段信息输出 JSON：
{
  "completionScore": 0,
  "missingItems": [""],
  "resumeWarnings": [""],
  "rewrittenProjects": [{ "title": "", "bullet": "" }],
  "optimizedSelfIntro": ""
}

要求：
- rewrittenProjects 每个项目生成 1 条适合放进简历的 bullet。
- optimizedSelfIntro 输出 100-180 字。

输入数据：
${JSON.stringify(payload)}`)

    if (ai) {
      return ai
    }
  } catch (error) {
    console.error('Preparation review fallback to mock.', error)
  }

  return {
    completionScore,
    missingItems,
    resumeWarnings,
    rewrittenProjects,
    optimizedSelfIntro,
  }
}

export const diagnoseMatch = async (payload: {
  resume: string
  jd: string
  company: string
}): Promise<MatchDiagnosisResult> => {
  const keywords = ['Vue 3', 'TypeScript', 'Nuxt', 'AI', 'SaaS', '性能', '协作', '平台']
  const keywordGaps = keywords.filter((keyword) => !payload.resume.includes(keyword) && payload.jd.includes(keyword))
  const strengths = [
    payload.resume.includes('Nuxt') ? '已有 Nuxt / SSR 相关表达，可作为贴岗优势。' : '前端工程化和组件能力有基础，可继续强化到岗位语言。',
    payload.company.includes('交付速度') ? '公司强调交付速度，适合突出独立推进与业务落地。' : '公司业务资料可继续补充，以形成更强定制表达。',
    '已有一套简历、JD、公司资料输入，适合继续做精细匹配。',
  ]
  const gaps = [
    keywordGaps.length ? `简历中缺少这些岗位关键词的显式表达：${keywordGaps.join('、')}` : '岗位关键词覆盖尚可，重点是提升表达精度。',
    !/\d+[%个项年月人次万]/.test(payload.resume) ? '成果量化不足，容易影响被查看率。' : '量化结果已具备基础，接下来应统一口径。',
    '需要把项目经历从“做了什么”改成“解决了什么业务问题”。',
  ]
  const expressionRisks = [
    '项目描述若只写技术栈，容易被判断为通用型前端。',
    '没有把 AI、业务理解、协作关系写进项目时，邀约率会受影响。',
    '若自我介绍和简历用词不一致，面试追问容易暴露准备不足。',
  ]
  const companyQuestions = [
    '当前团队的 AI 能力是平台化建设，还是围绕具体业务场景快速交付？',
    '这个岗位最核心的成功指标是什么，偏交付速度、用户体验还是业务转化？',
    '前端和算法、后端的协作模式是固定流程还是快速试错？',
  ]
  const actionPlan = [
    '优先补齐缺失关键词，并写进项目成果句。',
    '增加一段“为什么适合这个岗位”的摘要。',
    '准备 2 个体现交付速度和协作推进的案例。',
  ]

  const overallScore = Math.max(52, 84 - keywordGaps.length * 6 - (/\d+[%个项年月人次万]/.test(payload.resume) ? 0 : 10))

  if (!hasConfig()) {
    return {
      overallScore,
      strengths,
      gaps,
      keywordGaps,
      expressionRisks,
      companyQuestions,
      actionPlan,
    }
  }

  try {
    const ai = await chatJson<MatchDiagnosisResult>(`请基于简历、JD、公司信息输出 JSON：
{
  "overallScore": 0,
  "strengths": [""],
  "gaps": [""],
  "keywordGaps": [""],
  "expressionRisks": [""],
  "companyQuestions": [""],
  "actionPlan": [""]
}
输入：
${JSON.stringify(payload)}`)

    if (ai) {
      return ai
    }
  } catch (error) {
    console.error('Match diagnosis fallback to mock.', error)
  }

  return {
    overallScore,
    strengths,
    gaps,
    keywordGaps,
    expressionRisks,
    companyQuestions,
    actionPlan,
  }
}

export const generateInterviewPack = async (payload: {
  resume: string
  jd: string
  company: string
  selfIntro: string
  projectHighlights: string[]
}): Promise<{ questionBank: InterviewQuestionCard[] }> => {
  const baseQuestions: InterviewQuestionCard[] = [
    {
      id: crypto.randomUUID(),
      category: 'self_intro',
      question: '请做一个 1 分钟自我介绍，并说明为什么适合这个岗位。',
      answerOutline: payload.selfIntro || '概括经历主线，突出 AI、平台化、交付效率与岗位匹配。',
    },
    {
      id: crypto.randomUUID(),
      category: 'project',
      question: `请详细讲一下 ${payload.projectHighlights[0] || '你最有代表性的项目'}。`,
      answerOutline: '按背景、目标、你的动作、结果、复盘来回答。',
    },
    {
      id: crypto.randomUUID(),
      category: 'technical',
      question: '如果这个岗位继续做 AI Web 应用，你会如何设计前端架构与状态管理？',
      answerOutline: '从模块划分、接口协作、流式响应、组件复用和性能优化展开。',
    },
    {
      id: crypto.randomUUID(),
      category: 'behavioral',
      question: '讲一个你推动跨团队协作并最终落地的案例。',
      answerOutline: '说明冲突、推进动作、结果和你承担的角色。',
    },
    {
      id: crypto.randomUUID(),
      category: 'business',
      question: '你如何理解这家公司当前业务阶段，对前端意味着什么？',
      answerOutline: '结合公司资料、产品节奏、交付模式和岗位期望回答。',
    },
  ]

  if (!hasConfig()) {
    return { questionBank: baseQuestions }
  }

  try {
    const ai = await chatJson<{ questionBank: InterviewQuestionCard[] }>(`请输出面试题包 JSON：
{
  "questionBank": [
    { "id": "q1", "category": "self_intro", "question": "", "answerOutline": "" }
  ]
}
要求：
- 生成 5 道题。
- category 只能是 self_intro / project / technical / behavioral / business。
- answerOutline 必须是简洁中文提纲。

输入：
${JSON.stringify(payload)}`)

    if (ai?.questionBank?.length) {
      return { questionBank: ai.questionBank }
    }
  } catch (error) {
    console.error('Interview pack fallback to mock.', error)
  }

  return { questionBank: baseQuestions }
}

export const reviewInterviewSession = async (payload: {
  askedQuestions: string
  myAnswers: string
  reflection: string
}): Promise<InterviewReviewResult> => {
  const review: InterviewReviewResult = {
    summary: '这轮面试复盘应重点关注回答是否贴题、是否有量化结果，以及是否把业务理解表达清楚。',
    strengths: [
      '已经开始记录题目与回答，具备复盘基础。',
      '如果回答中有项目动作和结果，说明主线已经存在。',
      '有反思字段，适合继续沉淀为下一轮优化动作。',
    ],
    weaknesses: [
      '回答可能仍偏技术动作，业务结果表达需要更明确。',
      '若缺少具体数字和影响范围，可信度会下降。',
      '若没有反问公司业务和岗位预期，面试深度会不足。',
    ],
    nextActions: [
      '把最卡的 3 个问题重写成回答模板。',
      '为每个核心项目补 1 个量化结果句。',
      '准备 3 个针对公司阶段和团队协作的问题。',
    ],
  }

  if (!hasConfig()) {
    return review
  }

  try {
    const ai = await chatJson<InterviewReviewResult>(`请复盘下面这轮面试，输出 JSON：
{
  "summary": "",
  "strengths": [""],
  "weaknesses": [""],
  "nextActions": [""]
}
输入：
${JSON.stringify(payload)}`)
    if (ai) {
      return ai
    }
  } catch (error) {
    console.error('Interview review fallback to mock.', error)
  }

  return review
}
