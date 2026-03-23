<template>
  <div class="interview-page">
    <section class="stage-hero glass-panel">
      <div>
        <span class="stage-hero__eyebrow">Stage 4</span>
        <h1>面试与复盘</h1>
        <p>把题库、回答提纲、面后复盘和下一轮动作集中管理，让面试迭代真正形成闭环。</p>
      </div>
      <div class="stage-score">
        <span>题库数量</span>
        <strong>{{ interview.questionBank.length }}</strong>
        <p>{{ interview.lastGeneratedAt ? `最近生成：${interview.lastGeneratedAt}` : '尚未生成题库' }}</p>
      </div>
    </section>

    <section class="stage-grid">
      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>AI 面试题包</h2>
          <p>基于当前简历、JD、公司资料与准备阶段自我介绍生成。</p>
        </div>
        <div class="stage-actions">
          <NButton data-testid="interview-generate" type="primary" :loading="generatePending" @click="handleGenerate">
            生成题库
          </NButton>
          <NButton tag="a" href="/workspace#phase-interview">回工作台看建议</NButton>
        </div>
        <div class="question-bank">
          <article v-for="item in interview.questionBank" :key="item.id" class="question-card">
            <span>{{ categoryMap[item.category] }}</span>
            <h3>{{ item.question }}</h3>
            <p>{{ item.answerOutline }}</p>
          </article>
        </div>
      </article>

      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>面试复盘</h2>
          <p>记录一轮面试的题目、回答和复盘，再交给 AI 输出下一轮动作。</p>
        </div>
        <div class="review-form">
          <NInput v-model:value="draft.company" placeholder="公司名称" />
          <NInput v-model:value="draft.round" placeholder="面试轮次，例如：一面 / HR 面" />
          <NInput v-model:value="draft.askedQuestions" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="记录被问到的问题" />
          <NInput v-model:value="draft.myAnswers" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="记录你的回答摘要" />
          <NInput v-model:value="draft.reflection" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="你自己的反思" />
        </div>
        <div class="stage-actions">
          <NButton data-testid="interview-review" type="primary" :loading="reviewPending" @click="handleReview">
            生成复盘建议
          </NButton>
        </div>

        <div v-if="interview.latestReview" class="review-output">
          <p>{{ interview.latestReview.summary }}</p>
          <h3>优势</h3>
          <ul class="stage-list">
            <li v-for="item in interview.latestReview.strengths" :key="item">{{ item }}</li>
          </ul>
          <h3>薄弱点</h3>
          <ul class="stage-list">
            <li v-for="item in interview.latestReview.weaknesses" :key="item">{{ item }}</li>
          </ul>
          <h3>下一步动作</h3>
          <ul class="stage-list">
            <li v-for="item in interview.latestReview.nextActions" :key="item">{{ item }}</li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, useMessage } from 'naive-ui'
import type { InterviewQuestionCard, InterviewReviewResult, InterviewSessionRecord } from '~/types/interview'

const message = useMessage()
const { state, load, setQuestionBank, addSession, setLatestReview } = useInterviewCoach()
const { state: workspaceState, load: loadWorkspace } = useInterviewTracker()
const { state: preparationState, load: loadPreparation } = usePreparationPlanner()
const generatePending = ref(false)
const reviewPending = ref(false)

const interview = computed(() => state.value)
const workspace = computed(() => workspaceState.value)
const preparation = computed(() => preparationState.value)
const draft = reactive({
  company: '',
  round: '',
  askedQuestions: '',
  myAnswers: '',
  reflection: '',
})

const categoryMap = {
  self_intro: '自我介绍',
  project: '项目追问',
  technical: '技术题',
  behavioral: '行为题',
  business: '业务题',
} as const

onMounted(() => {
  load()
  loadWorkspace()
  loadPreparation()
})

const handleGenerate = async () => {
  generatePending.value = true
  try {
    const result = await $fetch<{ questionBank: InterviewQuestionCard[] }>('/api/interview/generate', {
      method: 'POST',
      body: {
        resume: workspace.value.resumeText,
        jd: workspace.value.jdText,
        company: workspace.value.companyText,
        selfIntro: preparation.value.selfIntro,
        projectHighlights: preparation.value.projectNotes.map((item) => item.title).filter(Boolean),
      },
    })
    setQuestionBank(result.questionBank)
    message.success('面试题库已生成')
  } catch (error) {
    console.error(error)
    message.error('面试题库生成失败')
  } finally {
    generatePending.value = false
  }
}

const handleReview = async () => {
  reviewPending.value = true
  try {
    const review = await $fetch<InterviewReviewResult>('/api/interview/review', {
      method: 'POST',
      body: {
        askedQuestions: draft.askedQuestions,
        myAnswers: draft.myAnswers,
        reflection: draft.reflection,
      },
    })
    const session: InterviewSessionRecord = {
      id: crypto.randomUUID(),
      company: draft.company,
      round: draft.round,
      askedQuestions: draft.askedQuestions,
      myAnswers: draft.myAnswers,
      reflection: draft.reflection,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
    addSession(session)
    setLatestReview(review)
    message.success('面试复盘已生成')
  } catch (error) {
    console.error(error)
    message.error('面试复盘失败')
  } finally {
    reviewPending.value = false
  }
}
</script>

<style scoped>
.interview-page {
  display: grid;
  gap: 24px;
}

.stage-hero,
.stage-card {
  padding: 24px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: var(--shadow-panel);
}

.stage-hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.stage-hero__eyebrow {
  display: inline-flex;
  padding: 8px 12px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-pill);
  background: var(--card-strong-bg);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stage-hero h1 {
  margin: 14px 0 10px;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 0.96;
  text-transform: uppercase;
}

.stage-hero p,
.stage-score p,
.stage-card__head p,
.question-card p,
.review-output p,
.stage-list {
  color: var(--text-muted);
}

.stage-score {
  padding: 18px;
  border: 2px solid var(--border-strong);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
}

.stage-score strong {
  display: block;
  margin: 8px 0;
  font-size: 48px;
}

.stage-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.stage-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.question-bank,
.review-form {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.question-card,
.review-output {
  padding: 14px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.question-card:hover,
.review-output:hover {
  transform: var(--hover-lift);
}

.question-card span {
  color: var(--accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.question-card h3,
.review-output h3 {
  margin: 8px 0 8px;
}

.stage-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
}

@media (max-width: 980px) {
  .stage-hero,
  .stage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
