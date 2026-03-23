import type { AdviceBlock, AnalysisReport, ScoreBlock } from '~/types/interview'
import { analyzeWithDeepSeek, hasDeepSeekConfig } from '~/server/utils/deepseek'

interface AnalyzePayload {
  resume: string
  jd: string
  company: string
}

const scoreByKeywords = (source: string, keywords: string[]) => {
  const hitCount = keywords.filter((keyword) =>
    source.toLowerCase().includes(keyword.toLowerCase()),
  ).length

  return Math.min(100, Math.round((hitCount / keywords.length) * 100))
}

const buildBlock = (label: string, score: number, summary: string): ScoreBlock => ({
  label,
  score,
  summary,
})

const sentenceCount = (text: string) =>
  text
    .split(/\n|。|；|;|\./)
    .map((item) => item.trim())
    .filter(Boolean).length

const analyzeWorkspaceWithMock = ({ resume, jd, company }: AnalyzePayload): AnalysisReport => {
  const resumeKeywords = ['Vue', 'TypeScript', 'Nuxt', '性能', 'AI', '协作', '平台']
  const jdKeywords = ['Vue 3', 'TypeScript', 'AI', 'SaaS', 'Nuxt', '性能', '抽象']
  const companyKeywords = ['交付', '迭代', '协同', '平台', '数据', '业务']

  const resumeScore = scoreByKeywords(resume, resumeKeywords)
  const jdScore = scoreByKeywords(jd, jdKeywords)
  const companyScore = scoreByKeywords(company, companyKeywords)

  const quantified = /\d+[%个项年月人次万]/.test(resume)
  const structureScore = Math.min(100, 55 + sentenceCount(resume) * 4 + (quantified ? 12 : 0))
  const matchScore = Math.round((resumeScore * 0.45 + jdScore * 0.35 + companyScore * 0.2))

  const resumeBlocks: ScoreBlock[] = [
    buildBlock('简历结构清晰度', structureScore, quantified ? '项目结果有量化表达，结构具备说服力。' : '结构基本完整，但缺少量化结果支撑。'),
    buildBlock('技能关键词覆盖', resumeScore, `已覆盖 ${resumeKeywords.length} 个核心关键词中的 ${Math.round((resumeScore / 100) * resumeKeywords.length)} 个。`),
    buildBlock('成果表达力度', quantified ? 84 : 63, quantified ? '成果表达较强，适合面试追问展开。' : '建议补充指标、影响范围与业务结果。'),
  ]

  const jdBlocks: ScoreBlock[] = [
    buildBlock('岗位要求拆解度', jdScore, '已提炼岗位的技术、业务与协作诉求。'),
    buildBlock('优先项识别', jd.toLowerCase().includes('优先') ? 87 : 66, jd.toLowerCase().includes('优先') ? '已识别加分项，可定向补强。' : 'JD 中优先项信息较弱，建议进一步确认。'),
    buildBlock('面试切题风险', matchScore > 75 ? 80 : 62, matchScore > 75 ? '已有较高对齐度，回答容易贴题。' : '需要按 JD 语言重写项目经历，避免泛化描述。'),
  ]

  const companyBlocks: ScoreBlock[] = [
    buildBlock('公司业务理解度', companyScore, '已抽取业务节奏、协同方式与产品形态。'),
    buildBlock('文化适配度', company.includes('独立推进') ? 85 : 70, company.includes('独立推进') ? '你的项目 owner 经验可与公司节奏形成呼应。' : '建议补充独立推进和跨团队协作案例。'),
    buildBlock('风险提醒', company.includes('节奏快') ? 74 : 68, company.includes('节奏快') ? '需准备高压节奏、快速试错场景的案例。' : '建议确认团队成熟度与项目预期。'),
  ]

  const matchBlocks: ScoreBlock[] = [
    buildBlock('综合匹配度', matchScore, matchScore > 80 ? '整体高度匹配，可进入针对性打磨阶段。' : '具备基础匹配，但还需要强化关键优势表达。'),
    buildBlock('技能匹配', Math.round((resumeScore + jdScore) / 2), '技术栈贴合度较高，重点在表达精度。'),
    buildBlock('业务匹配', Math.round((companyScore + structureScore) / 2), '业务理解与项目叙事的衔接仍有提升空间。'),
  ]

  const optimizationAdvice: AdviceBlock[] = [
    {
      title: '简历优化建议',
      details: [
        '将每段项目经历改写为“业务目标 + 方案动作 + 可量化结果”的格式。',
        '把 JD 中的 AI、SaaS、平台化、性能优化等关键词显式映射到项目描述中。',
        '新增一段“为什么适合这家公司”的短摘要，强化岗位与公司双重匹配。',
      ],
    },
    {
      title: '材料补强建议',
      details: [
        '补充 1 个能够体现独立推进能力的复杂项目案例。',
        '准备一版面向 HR 的简洁简历摘要，一版面向技术面的深度项目版。',
        '把关键成果中的指标统一口径，例如效率提升、性能优化、转化提升。'],
    },
  ]

  const interviewAdvice: AdviceBlock[] = [
    {
      title: '技术面建议',
      details: [
        '重点准备 Nuxt SSR、前端工程化、组件设计和性能优化的实战案例。',
        '针对 AI 产品，说明你如何与算法和后端约定接口、处理流式响应与状态管理。',
        '每个项目准备一段“权衡取舍”说明，体现高级工程师判断力。',
      ],
    },
    {
      title: '业务面建议',
      details: [
        '说明你如何理解该公司的业务阶段，以及你能为交付速度带来的具体提升。',
        '准备 3 个关于产品迭代、实验数据和跨团队协作的问题，体现投入度。',
        '把“为什么跳槽”和“为什么是这家公司”统一成一条稳定叙事主线。',
      ],
    },
  ]

  const highlights = [
    '技术栈与岗位核心要求高度贴近，Vue 3、TypeScript、Nuxt 与 AI 产品经验是明显优势。',
    '公司强调交付与迭代速度，你的项目推进和平台化经历可以作为主打卖点。',
    '当前最大增益点不是补技能，而是把已有经验翻译成更贴近 JD 的表达方式。',
  ]

  const risks = [
    quantified ? '量化表达已具备基础，但仍应统一指标口径，避免面试中前后不一致。' : '缺少足够量化指标，面试官可能难以判断你的真实影响范围。',
    matchScore > 75 ? '匹配度较高，下一步重点是准备深挖问题与场景追问。' : '如果不按 JD 关键词重写简历，可能被误判为偏通用型前端。',
    company.includes('节奏快') ? '公司节奏偏快，需准备高优先级冲突处理和快速交付案例。' : '公司信息还不够完整，建议补充组织规模、产品阶段与团队分工。',
  ]

  return {
    resume: resumeBlocks,
    jd: jdBlocks,
    company: companyBlocks,
    match: matchBlocks,
    optimizationAdvice,
    interviewAdvice,
    highlights,
    risks,
  }
}

export const analyzeWorkspace = async (payload: AnalyzePayload): Promise<AnalysisReport> => {
  if (hasDeepSeekConfig()) {
    try {
      const report = await analyzeWithDeepSeek(payload)
      if (report) {
        return report
      }
    } catch (error) {
      console.error('DeepSeek analyze failed, fallback to mock analyzer.', error)
    }
  }

  return analyzeWorkspaceWithMock(payload)
}
