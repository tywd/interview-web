<template>
  <div class="dashboard">
    <section class="hero glass-panel">
      <div class="hero__content">
        <span class="hero__eyebrow">AI Interview Copilot</span>
        <h1>把简历、岗位和公司信息放进同一套分析系统里。</h1>
        <p>
          这是求职执行工作台。你可以在这里完成材料输入、AI 分析、版本保存和面试推进，
          然后回到求职阶段模块继续扩展每一步的功能。
        </p>
        <div class="hero__actions">
          <NButton type="primary" size="large" :loading="pending" @click="runAnalysis">
            立即分析
          </NButton>
          <NButton size="large" secondary @click="saveSnapshot">
            保存当前简历版本
          </NButton>
        </div>
      </div>
      <div class="hero__stats">
        <StatCard title="最新匹配度" :value="matchScoreText" description="综合简历、JD 和公司信息的最新评估结果。" />
        <StatCard title="简历版本数" :value="`${workspace.snapshots.length}`" description="保留每轮迭代结果，便于比较优化前后变化。" />
        <StatCard title="进行中任务" :value="`${doingCount}`" description="跟踪当前需推进的简历优化、公司研究和模拟面试任务。" />
      </div>
    </section>

    <section id="phase-prepare" class="editor-grid">
      <div class="editor-panel glass-panel">
        <div class="section-head">
          <h2>准备阶段：输入基础材料</h2>
          <p>先补齐简历、岗位 JD 和公司信息，建立一份可被 AI 持续分析与迭代的求职底稿。</p>
        </div>
        <div class="editor-stack">
          <div>
            <div class="label-row">
              <strong>简历</strong>
              <span>建议粘贴完整项目经历与量化成果</span>
            </div>
            <NInput v-model:value="workspace.resumeText" type="textarea" :autosize="{ minRows: 9, maxRows: 16 }" placeholder="输入简历内容" />
          </div>
          <div>
            <div class="label-row">
              <strong>岗位 JD</strong>
              <span>优先包含职责、要求、加分项</span>
            </div>
            <NInput v-model:value="workspace.jdText" type="textarea" :autosize="{ minRows: 7, maxRows: 14 }" placeholder="输入岗位 JD" />
          </div>
          <div>
            <div class="label-row">
              <strong>公司分析材料</strong>
              <span>可粘贴官网、新闻、业务介绍或面经信息</span>
            </div>
            <NInput v-model:value="workspace.companyText" type="textarea" :autosize="{ minRows: 7, maxRows: 14 }" placeholder="输入公司信息" />
          </div>
        </div>
      </div>

      <div id="phase-match" class="highlights glass-panel">
        <div class="section-head">
          <h2>匹配阶段：关键提醒</h2>
          <p>围绕这次投递，先看哪些优势值得放大，哪些风险会拖低被查看率和邀约率。</p>
        </div>
        <template v-if="report">
          <article>
            <h3>亮点</h3>
            <ul>
              <li v-for="item in report.highlights" :key="item">{{ item }}</li>
            </ul>
          </article>
          <article>
            <h3>风险</h3>
            <ul>
              <li v-for="item in report.risks" :key="item">{{ item }}</li>
            </ul>
          </article>
          <p class="time">最近分析时间：{{ workspace.lastAnalyzedAt }}</p>
        </template>
        <NEmpty v-else description="点击“立即分析”生成报告" />
      </div>
    </section>

    <div v-if="report" id="phase-apply" class="report-grid">
      <ScoreSection title="简历分析" subtitle="看内容组织、成果力度和关键词覆盖。" :items="report.resume" />
      <ScoreSection title="岗位 JD 分析" subtitle="拆解用人要求、加分项与切题风险。" :items="report.jd" />
      <ScoreSection title="公司分析" subtitle="理解业务节奏、文化预期和适配风险。" :items="report.company" />
      <ScoreSection title="综合匹配度" subtitle="把简历、岗位与公司三侧信息合并判断。" :items="report.match" />
    </div>

    <div v-if="report" id="phase-interview" class="report-grid report-grid--wide">
      <AdvicePanel title="简历优化建议" subtitle="下一版简历该怎么改，才能拉高通过率。" :items="report.optimizationAdvice" />
      <AdvicePanel title="面试建议" subtitle="围绕技术面、业务面和自我介绍做针对性准备。" :items="report.interviewAdvice" />
    </div>

    <div class="report-grid report-grid--wide">
      <VersionTimeline :snapshots="workspace.snapshots" @save="saveSnapshot" />
      <ClientOnly fallback-tag="div">
        <ProgressBoard v-model="workspace.progress" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NEmpty, NInput, useMessage } from 'naive-ui'
import type { AnalysisReport } from '~/types/interview'

const message = useMessage()
const { state, load, persist, setLatestReport, addSnapshot, updateTexts, updateProgress } = useInterviewTracker()
const pending = ref(false)

const workspace = computed({
  get: () => state.value,
  set: (value) => {
    state.value = value
  },
})

const report = computed<AnalysisReport | null>(() => workspace.value.latestReport)
const matchScoreText = computed(() => {
  const block = report.value?.match[0]
  return block ? `${block.score}分` : '未生成'
})
const doingCount = computed(() => workspace.value.progress.filter((item) => item.status === 'doing').length)

watch(
  () => [workspace.value.resumeText, workspace.value.jdText, workspace.value.companyText],
  ([resumeText, jdText, companyText]) => {
    updateTexts({ resumeText, jdText, companyText })
  },
  { deep: true },
)

watch(
  () => workspace.value.progress,
  (value) => {
    updateProgress(value)
  },
  { deep: true },
)

onMounted(() => {
  load()
})

const runAnalysis = async () => {
  pending.value = true
  try {
    const result = await $fetch<AnalysisReport>('/api/analyze', {
      method: 'POST',
      body: {
        resume: workspace.value.resumeText,
        jd: workspace.value.jdText,
        company: workspace.value.companyText,
      },
    })

    setLatestReport(result)
    message.success('分析报告已更新')
  } catch (error) {
    console.error(error)
    message.error('分析失败，请稍后重试')
  } finally {
    pending.value = false
  }
}

const saveSnapshot = () => {
  const latestScore = report.value?.match[0]?.score ?? 0
  addSnapshot({
    id: crypto.randomUUID(),
    title: `版本 ${workspace.value.snapshots.length + 1}`,
    content: workspace.value.resumeText,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    score: latestScore,
    notes: report.value ? [report.value.highlights[0], report.value.risks[0]] : ['尚未生成分析报告'],
  })

  persist()
  message.success('已保存简历版本')
}
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 24px;
  padding: 28px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: var(--shadow-panel);
}

.hero__content h1 {
  margin: 12px 0 14px;
  max-width: 12ch;
  font-size: clamp(34px, 4vw, 58px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.hero__content p,
.section-head p,
.highlights p,
.label-row span {
  color: var(--text-muted);
}

.hero__content p {
  max-width: 760px;
  font-size: 16px;
  line-height: 1.8;
}

.hero__eyebrow {
  display: inline-flex;
  padding: 8px 12px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-pill);
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero__actions {
  display: flex;
  gap: 14px;
  margin-top: 24px;
}

.hero__stats {
  display: grid;
  gap: 18px;
}

.editor-grid,
.report-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 24px;
}

.report-grid--wide {
  grid-template-columns: 1fr 1fr;
}

.editor-panel,
.highlights {
  padding: 24px;
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.section-head h2,
.highlights h3 {
  margin: 0;
}

.editor-stack {
  display: grid;
  gap: 20px;
  margin-top: 20px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
  font-size: 14px;
}

.highlights article + article {
  margin-top: 18px;
}

.highlights ul {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--text-muted);
  line-height: 1.7;
}

.time {
  margin-top: 18px;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .hero,
  .editor-grid,
  .report-grid,
  .report-grid--wide {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero,
  .editor-panel,
  .highlights {
    padding: 20px;
  }

  .hero__actions,
  .label-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
