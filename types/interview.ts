export interface ResumeSnapshot {
  id: string
  title: string
  content: string
  createdAt: string
  score: number
  notes: string[]
}

export interface ProgressItem {
  id: string
  label: string
  status: 'todo' | 'doing' | 'done'
  owner: string
  dueDate: string
}

export interface ScoreBlock {
  label: string
  score: number
  summary: string
}

export interface AdviceBlock {
  title: string
  details: string[]
}

export interface AnalysisReport {
  resume: ScoreBlock[]
  jd: ScoreBlock[]
  company: ScoreBlock[]
  match: ScoreBlock[]
  optimizationAdvice: AdviceBlock[]
  interviewAdvice: AdviceBlock[]
  highlights: string[]
  risks: string[]
}

export interface WorkspaceState {
  resumeText: string
  jdText: string
  companyText: string
  snapshots: ResumeSnapshot[]
  progress: ProgressItem[]
  latestReport: AnalysisReport | null
  lastAnalyzedAt: string | null
}

export interface PreparationChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface PreparationProjectNote {
  id: string
  title: string
  situation: string
  action: string
  result: string
}

export interface PreparationState {
  targetRole: string
  targetCity: string
  targetLevel: string
  targetIndustry: string
  targetSalary: string
  selfIntro: string
  checklist: PreparationChecklistItem[]
  projectNotes: PreparationProjectNote[]
}

export interface PreparationReviewResult {
  completionScore: number
  missingItems: string[]
  resumeWarnings: string[]
  rewrittenProjects: Array<{
    title: string
    bullet: string
  }>
  optimizedSelfIntro: string
}

export interface MatchInsight {
  title: string
  items: string[]
}

export interface MatchDiagnosisResult {
  overallScore: number
  strengths: string[]
  gaps: string[]
  keywordGaps: string[]
  expressionRisks: string[]
  companyQuestions: string[]
  actionPlan: string[]
}

export interface MatchState {
  diagnosis: MatchDiagnosisResult | null
  lastDiagnosedAt: string | null
}

export interface ApplicationRecord {
  id: string
  company: string
  role: string
  channel: string
  status: 'draft' | 'applied' | 'viewed' | 'interview' | 'offer' | 'rejected'
  priority: 'high' | 'medium' | 'low'
  nextAction: string
  followUpDate: string
  notes: string
}

export interface ApplyState {
  applications: ApplicationRecord[]
}

export interface InterviewQuestionCard {
  id: string
  category: 'self_intro' | 'project' | 'technical' | 'behavioral' | 'business'
  question: string
  answerOutline: string
}

export interface InterviewReviewResult {
  summary: string
  strengths: string[]
  weaknesses: string[]
  nextActions: string[]
}

export interface InterviewSessionRecord {
  id: string
  company: string
  round: string
  askedQuestions: string
  myAnswers: string
  reflection: string
  createdAt: string
}

export interface InterviewState {
  questionBank: InterviewQuestionCard[]
  lastGeneratedAt: string | null
  sessions: InterviewSessionRecord[]
  latestReview: InterviewReviewResult | null
}
