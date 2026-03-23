import type { InterviewQuestionCard, InterviewReviewPayload, InterviewSessionRecord, InterviewState } from '~/types/interview'

const STORAGE_KEY = 'ai-interview-coach'

const defaultQuestions = (): InterviewQuestionCard[] => [
  {
    id: crypto.randomUUID(),
    category: 'self_intro',
    question: '请你做一个 1 分钟自我介绍。',
    answerOutline: '概括经历主线，突出 AI / 平台 / 交付速度，最后落到目标岗位匹配。',
  },
]

const defaultInterviewState = (): InterviewState => ({
  questionBank: defaultQuestions(),
  lastGeneratedAt: null,
  sessions: [],
  latestReview: null,
})

export const useInterviewCoach = () => {
  const state = useState<InterviewState>('interview-state', defaultInterviewState)

  const load = () => {
    if (!import.meta.client) {
      return
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      state.value = JSON.parse(raw) as InterviewState
    } catch {
      state.value = defaultInterviewState()
    }
  }

  const persist = () => {
    if (!import.meta.client) {
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  const setQuestionBank = (questionBank: InterviewQuestionCard[]) => {
    state.value.questionBank = questionBank
    state.value.lastGeneratedAt = new Date().toLocaleString('zh-CN', { hour12: false })
    persist()
  }

  const addSession = (session: InterviewSessionRecord) => {
    state.value.sessions.unshift(session)
    persist()
  }

  const setLatestReview = (review: InterviewReviewPayload) => {
    state.value.latestReview = review
    persist()
  }

  return {
    state,
    load,
    persist,
    setQuestionBank,
    addSession,
    setLatestReview,
  }
}
