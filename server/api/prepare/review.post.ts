import { reviewPreparation } from '~/server/utils/stage-copilot'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await reviewPreparation(body)
})
