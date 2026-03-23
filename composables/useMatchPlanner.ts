import type { MatchDiagnosisResult, MatchState } from '~/types/interview'

const STORAGE_KEY = 'ai-interview-match'

const defaultMatchState = (): MatchState => ({
  diagnosis: null,
  lastDiagnosedAt: null,
})

export const useMatchPlanner = () => {
  const state = useState<MatchState>('match-state', defaultMatchState)

  const load = () => {
    if (!import.meta.client) {
      return
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      state.value = JSON.parse(raw) as MatchState
    } catch {
      state.value = defaultMatchState()
    }
  }

  const persist = () => {
    if (!import.meta.client) {
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  const setDiagnosis = (diagnosis: MatchDiagnosisResult) => {
    state.value.diagnosis = diagnosis
    state.value.lastDiagnosedAt = new Date().toLocaleString('zh-CN', { hour12: false })
    persist()
  }

  return {
    state,
    load,
    persist,
    setDiagnosis,
  }
}
