import type {
  ApplicationRecord,
  AiResultMeta,
  ApplyAdvicePayload,
  ApplyAdviceResult,
  InterviewQuestionCard,
  InterviewQuestionPackResult,
  InterviewReviewPayload,
  InterviewReviewResult,
  MatchDiagnosisPayload,
  MatchDiagnosisResult,
  PreparationProjectNote,
  PreparationReviewPayload,
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

const safeParseJson = <T>(raw: string): T | null => {
  const trimmed = raw.trim()
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  const start = Math.min(
    ...['{', '[']
      .map((token) => fenced.indexOf(token))
      .filter((index) => index >= 0),
  )

  if (!Number.isFinite(start)) {
    return null
  }

  const objectEnd = fenced.lastIndexOf('}')
  const arrayEnd = fenced.lastIndexOf(']')
  const end = Math.max(objectEnd, arrayEnd)

  if (end <= start) {
    return null
  }

  try {
    return JSON.parse(fenced.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

const normalizeText = (value: unknown, fallback = '') => String(value || fallback).trim()
const normalizeList = (value: unknown, min = 0, max = 6) =>
  (Array.isArray(value) ? value : [])
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .slice(0, max)
    .filter((_, index, list) => index < list.length)
    .slice(0, Math.max(min, 0))

const normalizeBoundedList = (value: unknown, max = 6) =>
  (Array.isArray(value) ? value : [])
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .slice(0, max)

const chatJson = async <T>(prompt: string, systemPrompt = '你是资深求职顾问。只输出合法 JSON。'): Promise<T | null> => {
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
          { role: 'system', content: systemPrompt },
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
  return safeParseJson<T>(content)
}

const countDone = (labels: Array<{ done: boolean }>) => labels.filter((item) => item.done).length
const INTERVIEW_CATEGORIES: InterviewQuestionCard['category'][] = ['self_intro', 'project', 'technical', 'behavioral', 'business']

const normalizePreparationReview = (value: unknown): PreparationReviewResult | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>
  const completionScore = Number.parseInt(String(raw.completionScore ?? ''), 10)
  const rewrittenProjects = (Array.isArray(raw.rewrittenProjects) ? raw.rewrittenProjects : [])
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const title = normalizeText(record.title, '未命名项目')
      const bullet = normalizeText(record.bullet)
      return bullet ? { title, bullet } : null
    })
    .filter(Boolean) as PreparationReviewResult['rewrittenProjects']

  if (Number.isNaN(completionScore)) {
    return null
  }

  return {
    completionScore: Math.max(0, Math.min(100, completionScore)),
    missingItems: normalizeBoundedList(raw.missingItems, 6),
    resumeWarnings: normalizeBoundedList(raw.resumeWarnings, 6),
    rewrittenProjects,
    optimizedSelfIntro: normalizeText(raw.optimizedSelfIntro),
  }
}

const withMeta = <T extends object>(value: T, meta: AiResultMeta): T & { meta: AiResultMeta } => ({
  ...value,
  meta,
})

const normalizeMatchDiagnosis = (value: unknown): MatchDiagnosisResult | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>
  const overallScore = Number.parseInt(String(raw.overallScore ?? ''), 10)

  if (Number.isNaN(overallScore)) {
    return null
  }

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    strengths: normalizeBoundedList(raw.strengths, 4),
    gaps: normalizeBoundedList(raw.gaps, 4),
    keywordGaps: normalizeBoundedList(raw.keywordGaps, 8),
    expressionRisks: normalizeBoundedList(raw.expressionRisks, 4),
    companyQuestions: normalizeBoundedList(raw.companyQuestions, 4),
    actionPlan: normalizeBoundedList(raw.actionPlan, 4),
  }
}

const normalizeQuestionBank = (value: unknown): { questionBank: InterviewQuestionCard[] } | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>
  const questionBank = (Array.isArray(raw.questionBank) ? raw.questionBank : [])
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const category = normalizeText(record.category) as InterviewQuestionCard['category']
      const question = normalizeText(record.question)
      const answerOutline = normalizeText(record.answerOutline)

      if (!INTERVIEW_CATEGORIES.includes(category) || !question || !answerOutline) {
        return null
      }

      return {
        id: normalizeText(record.id) || crypto.randomUUID(),
        category,
        question,
        answerOutline,
      }
    })
    .filter(Boolean) as InterviewQuestionCard[]

  return questionBank.length ? { questionBank: questionBank.slice(0, 5) } : null
}

const normalizeInterviewReview = (value: unknown): InterviewReviewResult | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>
  const summary = normalizeText(raw.summary)
  if (!summary) {
    return null
  }

  return {
    summary,
    strengths: normalizeBoundedList(raw.strengths, 4),
    weaknesses: normalizeBoundedList(raw.weaknesses, 4),
    nextActions: normalizeBoundedList(raw.nextActions, 4),
  }
}

const normalizeApplyAdvice = (value: unknown): ApplyAdviceResult | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>
  const summary = normalizeText(raw.summary)
  if (!summary) {
    return null
  }

  return {
    summary,
    prioritizedTargets: normalizeBoundedList(raw.prioritizedTargets, 4),
    followUpActions: normalizeBoundedList(raw.followUpActions, 4),
    risks: normalizeBoundedList(raw.risks, 4),
  }
}

export const reviewPreparation = async (payload: {
  checklist: Array<{ label: string; done: boolean }>
  resumeText: string
  selfIntro: string
  projectNotes: PreparationProjectNote[]
}): Promise<PreparationReviewPayload> => {
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
    return withMeta({
      completionScore,
      missingItems,
      resumeWarnings,
      rewrittenProjects,
      optimizedSelfIntro,
    }, { provider: 'mock', fallbackReason: 'missing_api_key' })
  }

  try {
    const ai = await chatJson<Record<string, unknown>>(`你要扮演求职准备阶段顾问，输出给前端直接渲染的严格 JSON。

JSON 结构：
{
  "completionScore": 0,
  "missingItems": [""],
  "resumeWarnings": [""],
  "rewrittenProjects": [{ "title": "", "bullet": "" }],
  "optimizedSelfIntro": ""
}

要求：
- completionScore 是 0-100 整数，按材料完整度打分。
- missingItems 最多 5 条，只写当前最影响投递的缺失项。
- resumeWarnings 最多 4 条，只写高价值提醒，避免空话。
- rewrittenProjects 对每个项目生成 1 条中文 bullet，强调业务目标、动作、结果。
- optimizedSelfIntro 输出 100-180 字，语气克制，突出岗位匹配、项目结果、协作价值。
- 只输出 JSON，不要解释，不要 markdown。

输入数据：
${JSON.stringify(payload, null, 2)}`, '你是资深求职准备顾问和招聘经理。你的任务是生成可执行、可直接渲染的求职建议。只输出合法 JSON。')

    const normalized = normalizePreparationReview(ai)
    if (normalized) {
      return withMeta(normalized, { provider: 'deepseek' })
    }
  } catch (error) {
    console.error('Preparation review fallback to mock.', error)
  }

  return withMeta({
    completionScore,
    missingItems,
    resumeWarnings,
    rewrittenProjects,
    optimizedSelfIntro,
  }, { provider: 'mock', fallbackReason: 'ai_unavailable' })
}

export const diagnoseMatch = async (payload: {
  resume: string
  jd: string
  company: string
}): Promise<MatchDiagnosisPayload> => {
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
    return withMeta({
      overallScore,
      strengths,
      gaps,
      keywordGaps,
      expressionRisks,
      companyQuestions,
      actionPlan,
    }, { provider: 'mock', fallbackReason: 'missing_api_key' })
  }

  try {
    const ai = await chatJson<Record<string, unknown>>(`你要扮演岗位匹配顾问，输出给前端直接渲染的严格 JSON。

JSON 结构：
{
  "overallScore": 0,
  "strengths": [""],
  "gaps": [""],
  "keywordGaps": [""],
  "expressionRisks": [""],
  "companyQuestions": [""],
  "actionPlan": [""]
}

要求：
- overallScore 是 0-100 整数。
- strengths / gaps / expressionRisks / companyQuestions / actionPlan 各输出 3-4 条。
- keywordGaps 只保留需要显式补进简历或项目表述的关键词。
- actionPlan 要可执行，按优先级从高到低写。
- 只输出 JSON，不要解释，不要 markdown。

输入：
${JSON.stringify(payload, null, 2)}`, '你是资深求职匹配顾问，擅长判断简历、岗位、公司三者之间的真实差距。只输出合法 JSON。')

    const normalized = normalizeMatchDiagnosis(ai)
    if (normalized) {
      return withMeta(normalized, { provider: 'deepseek' })
    }
  } catch (error) {
    console.error('Match diagnosis fallback to mock.', error)
  }

  return withMeta({
    overallScore,
    strengths,
    gaps,
    keywordGaps,
    expressionRisks,
    companyQuestions,
    actionPlan,
  }, { provider: 'mock', fallbackReason: 'ai_unavailable' })
}

export const generateInterviewPack = async (payload: {
  resume: string
  jd: string
  company: string
  selfIntro: string
  projectHighlights: string[]
}): Promise<InterviewQuestionPackResult> => {
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
    return withMeta({ questionBank: baseQuestions }, { provider: 'mock', fallbackReason: 'missing_api_key' })
  }

  try {
    const ai = await chatJson<Record<string, unknown>>(`你要扮演技术面试教练，输出严格 JSON 题包。

JSON 结构：
{
  "questionBank": [
    { "id": "q1", "category": "self_intro", "question": "", "answerOutline": "" }
  ]
}

要求：
- 生成 5 道题。
- category 只能是 self_intro / project / technical / behavioral / business。
- 5 个 category 尽量各覆盖 1 道，不重复堆在同一类。
- question 要像真实面试官会问的问题。
- answerOutline 必须是简洁中文提纲，突出结构和回答重点。
- 只输出 JSON，不要解释，不要 markdown。

输入：
${JSON.stringify(payload, null, 2)}`, '你是资深技术面试官和求职教练。只输出合法 JSON。')

    const normalized = normalizeQuestionBank(ai)
    if (normalized) {
      return withMeta(normalized, { provider: 'deepseek' })
    }
  } catch (error) {
    console.error('Interview pack fallback to mock.', error)
  }

  return withMeta({ questionBank: baseQuestions }, { provider: 'mock', fallbackReason: 'ai_unavailable' })
}

export const reviewInterviewSession = async (payload: {
  askedQuestions: string
  myAnswers: string
  reflection: string
}): Promise<InterviewReviewPayload> => {
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
    return withMeta(review, { provider: 'mock', fallbackReason: 'missing_api_key' })
  }

  try {
    const ai = await chatJson<Record<string, unknown>>(`你要扮演面试复盘教练，输出严格 JSON。

JSON 结构：
{
  "summary": "",
  "strengths": [""],
  "weaknesses": [""],
  "nextActions": [""]
}

要求：
- summary 用 1 段话总结最关键的问题和判断。
- strengths / weaknesses / nextActions 各输出 3-4 条。
- nextActions 必须可执行，能直接转成下一轮准备动作。
- 只输出 JSON，不要解释，不要 markdown。

输入：
${JSON.stringify(payload, null, 2)}`, '你是资深面试复盘教练，善于把面试记录转成下一轮可执行动作。只输出合法 JSON。')
    const normalized = normalizeInterviewReview(ai)
    if (normalized) {
      return withMeta(normalized, { provider: 'deepseek' })
    }
  } catch (error) {
    console.error('Interview review fallback to mock.', error)
  }

  return withMeta(review, { provider: 'mock', fallbackReason: 'ai_unavailable' })
}

export const adviseApplications = async (payload: {
  applications: ApplicationRecord[]
  resume: string
  jd: string
  company: string
}): Promise<ApplyAdvicePayload> => {
  const activeApplications = payload.applications.filter((item) => item.company.trim() || item.role.trim())
  const advice: ApplyAdviceResult = {
    summary: activeApplications.length
      ? '当前投递阶段应优先聚焦高优先级且已有反馈信号的岗位，同时及时安排下一步跟进动作。'
      : '先录入 1-2 条真实投递记录，再用 AI 生成更有针对性的投递建议。',
    prioritizedTargets: activeApplications
      .slice(0, 3)
      .map((item) => `${item.company || '未填写公司'} - ${item.role || '未填写岗位'}：优先跟进 ${item.nextAction || '补充下一步动作'}`),
    followUpActions: [
      '优先整理高优先级岗位的定制化简历版本和跟进节奏。',
      '对已投递超过 2-3 天且无反馈的岗位安排一次主动跟进。',
      '把匹配诊断里的关键词差距补回到下一版简历和项目描述。',
    ],
    risks: [
      activeApplications.some((item) => !item.nextAction.trim()) ? '部分投递记录没有明确下一步动作，容易造成节奏中断。' : '投递动作记录相对完整，可继续强化节奏管理。',
      !/\d+[%个项年月人次万]/.test(payload.resume) ? '简历量化结果不足，可能继续影响查看率。' : '简历已有一定量化表达，可继续做岗位定制化优化。',
      payload.company.trim().length < 40 ? '公司资料输入偏少，投递建议对业务语境的贴合度会受影响。' : '公司资料基础已具备，适合继续做更细的定制化投递。',
    ],
  }

  if (!hasConfig()) {
    return withMeta(advice, { provider: 'mock', fallbackReason: 'missing_api_key' })
  }

  try {
    const ai = await chatJson<Record<string, unknown>>(`你要扮演投递策略顾问，输出严格 JSON。

JSON 结构：
{
  "summary": "",
  "prioritizedTargets": [""],
  "followUpActions": [""],
  "risks": [""]
}

要求：
- summary 用 1 段话概括当前投递策略重点。
- prioritizedTargets 输出 2-4 条，明确哪个公司/岗位应优先推进以及原因。
- followUpActions 输出 3-4 条可执行动作。
- risks 输出 3-4 条最可能拖低查看率或邀约率的风险。
- 只输出 JSON，不要解释，不要 markdown。

输入：
${JSON.stringify(payload, null, 2)}`, '你是资深投递策略顾问，擅长从投递记录、简历与岗位信息中提炼可执行动作。只输出合法 JSON。')

    const normalized = normalizeApplyAdvice(ai)
    if (normalized) {
      return withMeta(normalized, { provider: 'deepseek' })
    }
  } catch (error) {
    console.error('Apply advice fallback to mock.', error)
  }

  return withMeta(advice, { provider: 'mock', fallbackReason: 'ai_unavailable' })
}
