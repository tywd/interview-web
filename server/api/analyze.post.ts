import { analyzeWorkspace } from '~/server/utils/analyzer'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    resume: string
    jd: string
    company: string
  }>(event)

  return await analyzeWorkspace(body)
})
