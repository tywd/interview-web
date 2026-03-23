import type { PreparationProjectNote, PreparationState } from '~/types/interview'

const STORAGE_KEY = 'ai-interview-preparation'

const defaultChecklist = () => [
  { id: 'resume', label: '有一版完整可投递简历', done: false },
  { id: 'metrics', label: '项目经历包含量化结果', done: false },
  { id: 'intro', label: '有 1 分钟自我介绍底稿', done: false },
  { id: 'jd', label: '已收集 3 个目标岗位 JD', done: false },
  { id: 'company', label: '已整理目标公司资料', done: false },
  { id: 'proof', label: '有能证明能力的项目证据', done: false },
]

const defaultProjects = (): PreparationProjectNote[] => [
  {
    id: crypto.randomUUID(),
    title: '项目 1',
    situation: '',
    action: '',
    result: '',
  },
  {
    id: crypto.randomUUID(),
    title: '项目 2',
    situation: '',
    action: '',
    result: '',
  },
]

const defaultPreparationState = (): PreparationState => ({
  targetRole: '',
  targetCity: '',
  targetLevel: '',
  targetIndustry: '',
  targetSalary: '',
  selfIntro: '',
  checklist: defaultChecklist(),
  projectNotes: defaultProjects(),
})

export const usePreparationPlanner = () => {
  const state = useState<PreparationState>('preparation-state', defaultPreparationState)

  const load = () => {
    if (!import.meta.client) {
      return
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as PreparationState
      state.value = {
        ...defaultPreparationState(),
        ...parsed,
      }
    } catch {
      state.value = defaultPreparationState()
    }
  }

  const persist = () => {
    if (!import.meta.client) {
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  const reset = () => {
    state.value = defaultPreparationState()
    persist()
  }

  return {
    state,
    load,
    persist,
    reset,
  }
}
