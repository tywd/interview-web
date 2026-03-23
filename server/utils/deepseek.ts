import type { AdviceBlock, AnalysisReport, ScoreBlock } from '~/types/interview'

interface AnalyzePayload {
  resume: string
  jd: string
  company: string
}

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

const DEFAULT_MODEL = 'deepseek-chat'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

const getDeepSeekConfig = () => ({
  apiKey: env.DEEPSEEK_API_KEY?.trim(),
  model: env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL,
})

export const hasDeepSeekConfig = () => Boolean(getDeepSeekConfig().apiKey)

const safeParseJson = <T>(raw: string): T | null => {
  const trimmed = raw.trim()
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    return null
  }

  try {
    return JSON.parse(fenced.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

const normalizeScoreBlock = (value: unknown): ScoreBlock | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const block = value as Record<string, unknown>
  const label = String(block.label || '').trim()
  const summary = String(block.summary || '').trim()
  const numericScore = typeof block.score === 'number'
    ? block.score
    : Number.parseInt(String(block.score || ''), 10)

  if (!label || Number.isNaN(numericScore)) {
    return null
  }

  return {
    label,
    score: Math.max(0, Math.min(100, numericScore)),
    summary,
  }
}

const normalizeAdviceBlock = (value: unknown): AdviceBlock | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const block = value as Record<string, unknown>
  const title = String(block.title || '').trim()
  const details = Array.isArray(block.details)
    ? block.details.map((item) => String(item).trim()).filter(Boolean)
    : []

  if (!title || details.length === 0) {
    return null
  }

  return {
    title,
    details,
  }
}

const normalizeStringList = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []

export const analyzeWithDeepSeek = async ({
  resume,
  jd,
  company,
}: AnalyzePayload): Promise<AnalysisReport | null> => {
  const { apiKey, model } = getDeepSeekConfig()

  if (!apiKey) {
    return null
  }

  const prompt = `你是一位资深求职顾问、招聘经理和面试教练。请基于候选人的简历、岗位 JD 和公司资料，输出一个合法 JSON 对象，用于求职工作台直接渲染。

要求：
1. 只输出 JSON，不要输出 markdown，不要解释。
2. 所有分数范围为 0-100 的整数。
3. 语言使用简体中文，语气务实、具体。
4. 结果要同时服务于四阶段求职流程：准备、匹配、投递、面试与复盘。

JSON 结构必须严格如下：
{
  "resume": [{ "label": "", "score": 0, "summary": "" }],
  "jd": [{ "label": "", "score": 0, "summary": "" }],
  "company": [{ "label": "", "score": 0, "summary": "" }],
  "match": [{ "label": "", "score": 0, "summary": "" }],
  "optimizationAdvice": [{ "title": "", "details": ["", ""] }],
  "interviewAdvice": [{ "title": "", "details": ["", ""] }],
  "highlights": ["", "", ""],
  "risks": ["", "", ""]
}

额外要求：
- resume、jd、company、match 每个数组输出 3 项。
- optimizationAdvice 输出 2 项，每项 3 条 details。
- interviewAdvice 输出 2 项，每项 3 条 details。
- highlights 输出 3 条。
- risks 输出 3 条。
- 内容尽量和“提升被查看率、邀约率、入职率”直接相关。

【简历】
"""
${resume.trim()}
"""

【岗位 JD】
"""
${jd.trim()}
"""

【公司资料】
"""
${company.trim()}
""" `

  const response = await fetch(API_URL, {
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
        {
          role: 'system',
          content: '你输出严格 JSON，且结果适用于求职场景分析。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`DeepSeek 请求失败: ${response.status} ${detail}`)
  }

  const data = await response.json()
  const content = String(data.choices?.[0]?.message?.content || '').trim()
  const parsed = safeParseJson<Record<string, unknown>>(content)

  if (!parsed) {
    return null
  }

  const report: AnalysisReport = {
    resume: Array.isArray(parsed.resume)
      ? parsed.resume.map(normalizeScoreBlock).filter(Boolean) as ScoreBlock[]
      : [],
    jd: Array.isArray(parsed.jd)
      ? parsed.jd.map(normalizeScoreBlock).filter(Boolean) as ScoreBlock[]
      : [],
    company: Array.isArray(parsed.company)
      ? parsed.company.map(normalizeScoreBlock).filter(Boolean) as ScoreBlock[]
      : [],
    match: Array.isArray(parsed.match)
      ? parsed.match.map(normalizeScoreBlock).filter(Boolean) as ScoreBlock[]
      : [],
    optimizationAdvice: Array.isArray(parsed.optimizationAdvice)
      ? parsed.optimizationAdvice.map(normalizeAdviceBlock).filter(Boolean) as AdviceBlock[]
      : [],
    interviewAdvice: Array.isArray(parsed.interviewAdvice)
      ? parsed.interviewAdvice.map(normalizeAdviceBlock).filter(Boolean) as AdviceBlock[]
      : [],
    highlights: normalizeStringList(parsed.highlights),
    risks: normalizeStringList(parsed.risks),
  }

  if (
    report.resume.length !== 3 ||
    report.jd.length !== 3 ||
    report.company.length !== 3 ||
    report.match.length !== 3 ||
    report.optimizationAdvice.length !== 2 ||
    report.interviewAdvice.length !== 2 ||
    report.highlights.length !== 3 ||
    report.risks.length !== 3
  ) {
    return null
  }

  return report
}
