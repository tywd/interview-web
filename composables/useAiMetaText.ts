import type { AiResultMeta } from '~/types/interview'

const fallbackReasonMap: Record<string, string> = {
  missing_api_key: '未配置 DeepSeek API Key，已使用本地回退结果',
  ai_unavailable: 'DeepSeek 当前不可用，已使用本地回退结果',
}

export const useAiMetaText = (meta: AiResultMeta | null | undefined) => {
  if (!meta) {
    return ''
  }

  if (meta.provider === 'deepseek') {
    return '结果来源：DeepSeek'
  }

  const fallbackText = meta.fallbackReason ? fallbackReasonMap[meta.fallbackReason] || 'AI 不可用，已使用本地回退结果' : '已使用本地回退结果'
  return `结果来源：本地回退 · ${fallbackText}`
}
