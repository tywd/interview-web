<template>
  <div class="match-page">
    <section class="stage-hero glass-panel">
      <div>
        <span class="stage-hero__eyebrow">Stage 2</span>
        <h1>匹配阶段</h1>
        <p>这个阶段解决“为什么没有更多查看和邀约”，核心是找出岗位差距、表达风险和下一步动作。</p>
      </div>
      <div class="stage-score">
        <span>当前匹配诊断</span>
        <strong>{{ diagnosis?.overallScore ?? '--' }}</strong>
        <p>{{ state.lastDiagnosedAt ? `最近诊断：${state.lastDiagnosedAt}` : '尚未生成诊断' }}</p>
      </div>
    </section>

    <section class="stage-grid">
      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>诊断输入</h2>
          <p>默认复用工作台中的简历、JD 和公司资料。</p>
        </div>
        <div class="input-preview">
          <p><strong>简历：</strong>{{ workspace.resumeText.slice(0, 100) }}...</p>
          <p><strong>JD：</strong>{{ workspace.jdText.slice(0, 100) }}...</p>
          <p><strong>公司：</strong>{{ workspace.companyText.slice(0, 100) }}...</p>
        </div>
        <div class="stage-actions">
          <NButton data-testid="match-diagnose" type="primary" :loading="pending" @click="handleDiagnose">生成匹配诊断</NButton>
          <NButton tag="a" href="/workspace#phase-match">回工作台查看原始分析</NButton>
        </div>
      </article>

      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>关键词差距</h2>
          <p>把缺失词显式补进简历和项目描述里。</p>
        </div>
        <ul class="stage-list">
          <li v-for="item in diagnosis?.keywordGaps || fallbackKeywordGaps" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <section class="stage-grid stage-grid--wide">
      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>优势与差距</h2>
        </div>
        <div class="dual-list">
          <div>
            <h3>优势</h3>
            <ul class="stage-list">
              <li v-for="item in diagnosis?.strengths || []" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <h3>差距</h3>
            <ul class="stage-list">
              <li v-for="item in diagnosis?.gaps || []" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </article>

      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>表达风险与下一步</h2>
        </div>
        <h3>表达风险</h3>
        <ul class="stage-list">
          <li v-for="item in diagnosis?.expressionRisks || []" :key="item">{{ item }}</li>
        </ul>
        <h3>下一步动作</h3>
        <ul class="stage-list">
          <li v-for="item in diagnosis?.actionPlan || []" :key="item">{{ item }}</li>
        </ul>
        <h3>建议反问</h3>
        <ul class="stage-list">
          <li v-for="item in diagnosis?.companyQuestions || []" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { NButton, useMessage } from 'naive-ui'
import type { MatchDiagnosisResult } from '~/types/interview'

const message = useMessage()
const { state, load, setDiagnosis } = useMatchPlanner()
const { state: workspaceState, load: loadWorkspace } = useInterviewTracker()
const pending = ref(false)

const workspace = computed(() => workspaceState.value)
const diagnosis = computed(() => state.value.diagnosis)
const fallbackKeywordGaps = computed(() => ['Vue 3', 'Nuxt', 'AI', '性能优化'].filter((item) => !workspace.value.resumeText.includes(item)))

onMounted(() => {
  load()
  loadWorkspace()
})

const handleDiagnose = async () => {
  pending.value = true
  try {
    const result = await $fetch<MatchDiagnosisResult>('/api/match/diagnose', {
      method: 'POST',
      body: {
        resume: workspace.value.resumeText,
        jd: workspace.value.jdText,
        company: workspace.value.companyText,
      },
    })
    setDiagnosis(result)
    message.success('匹配诊断已更新')
  } catch (error) {
    console.error(error)
    message.error('匹配诊断失败')
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.match-page {
  display: grid;
  gap: 24px;
}

.stage-hero,
.stage-card {
  padding: 24px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: 8px 8px 0 rgba(20, 16, 12, 0.9);
}

.stage-hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.stage-hero__eyebrow {
  display: inline-flex;
  padding: 8px 12px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 999px;
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
.stage-card__head p,
.input-preview p,
.stage-score p,
.stage-list {
  color: var(--text-muted);
}

.stage-score {
  padding: 18px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: 4px 4px 0 rgba(20, 16, 12, 0.9);
}

.stage-score strong {
  display: block;
  margin: 8px 0;
  font-size: 48px;
}

.stage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.stage-grid--wide {
  align-items: start;
}

.stage-card__head h2,
.dual-list h3,
.stage-card h3 {
  margin: 0 0 10px;
}

.input-preview {
  display: grid;
  gap: 10px;
}

.input-preview p {
  margin: 0;
  line-height: 1.7;
}

.stage-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.stage-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
}

.dual-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 980px) {
  .stage-hero,
  .stage-grid,
  .dual-list {
    grid-template-columns: 1fr;
  }
}
</style>
