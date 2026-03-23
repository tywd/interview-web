import { defaultWorkspace } from '~/data/mock'
import type {
  AnalysisReport,
  ProgressItem,
  ResumeSnapshot,
  WorkspaceState,
} from '~/types/interview'

const STORAGE_KEY = 'ai-interview-workspace'

export const useInterviewTracker = () => {
  const state = useState<WorkspaceState>('workspace-state', defaultWorkspace)

  const load = () => {
    if (!import.meta.client) {
      return
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      state.value = JSON.parse(raw) as WorkspaceState
    } catch {
      state.value = defaultWorkspace()
    }
  }

  const persist = () => {
    if (!import.meta.client) {
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  const setLatestReport = (report: AnalysisReport) => {
    state.value.latestReport = report
    state.value.lastAnalyzedAt = new Date().toLocaleString('zh-CN', {
      hour12: false,
    })
    persist()
  }

  const addSnapshot = (snapshot: ResumeSnapshot) => {
    state.value.snapshots.unshift(snapshot)
    persist()
  }

  const updateTexts = (payload: Pick<WorkspaceState, 'resumeText' | 'jdText' | 'companyText'>) => {
    state.value.resumeText = payload.resumeText
    state.value.jdText = payload.jdText
    state.value.companyText = payload.companyText
    persist()
  }

  const updateProgress = (progress: ProgressItem[]) => {
    state.value.progress = progress
    persist()
  }

  return {
    state,
    load,
    persist,
    setLatestReport,
    addSnapshot,
    updateTexts,
    updateProgress,
  }
}
