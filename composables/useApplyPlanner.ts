import type { ApplicationRecord, ApplyAdvicePayload, ApplyState } from '~/types/interview'

const STORAGE_KEY = 'ai-interview-apply'

const defaultApplications = (): ApplicationRecord[] => [
  {
    id: crypto.randomUUID(),
    company: '星桥智能',
    role: '高级前端工程师',
    channel: 'Boss',
    status: 'applied',
    priority: 'high',
    nextAction: '2 天后跟进查看状态',
    followUpDate: '2026-03-24',
    notes: 'AI 应用方向，高匹配，优先追踪。',
  },
]

const defaultApplyState = (): ApplyState => ({
  applications: defaultApplications(),
  latestAdvice: null,
  lastAdvisedAt: null,
})

export const useApplyPlanner = () => {
  const state = useState<ApplyState>('apply-state', defaultApplyState)

  const load = () => {
    if (!import.meta.client) {
      return
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as ApplyState
      state.value = {
        ...defaultApplyState(),
        ...parsed,
      }
    } catch {
      state.value = defaultApplyState()
    }
  }

  const persist = () => {
    if (!import.meta.client) {
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  const setLatestAdvice = (advice: ApplyAdvicePayload) => {
    state.value.latestAdvice = advice
    state.value.lastAdvisedAt = new Date().toLocaleString('zh-CN', { hour12: false })
    persist()
  }

  return {
    state,
    load,
    persist,
    setLatestAdvice,
  }
}
