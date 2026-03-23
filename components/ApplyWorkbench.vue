<template>
  <div class="apply-page">
    <section class="stage-hero glass-panel">
      <div>
        <span class="stage-hero__eyebrow">Stage 3</span>
        <h1>投递阶段</h1>
        <p>把岗位分析、版本管理和跟进动作放到一张表里，避免无节奏海投。</p>
      </div>
      <div class="stage-score">
        <span>投递总览</span>
        <strong>{{ applications.length }}</strong>
        <p>高优先级 {{ highPriorityCount }} 条，面试中 {{ interviewCount }} 条</p>
      </div>
    </section>

    <section class="stage-grid">
      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>投递记录</h2>
          <p>建议优先记录公司、岗位、状态、下一步动作。</p>
        </div>
        <ClientOnly fallback-tag="div">
          <div class="application-list">
            <div v-for="item in applications" :key="item.id" class="application-row">
              <NInput v-model:value="item.company" placeholder="公司" />
              <NInput v-model:value="item.role" placeholder="岗位" />
              <NSelect v-model:value="item.status" :options="statusOptions" />
              <NSelect v-model:value="item.priority" :options="priorityOptions" />
              <NInput v-model:value="item.channel" placeholder="渠道" />
              <NInput v-model:value="item.followUpDate" placeholder="跟进日期" />
              <NInput v-model:value="item.nextAction" placeholder="下一步动作" />
              <NInput v-model:value="item.notes" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="备注" />
            </div>
          </div>
        </ClientOnly>
        <div class="stage-actions">
          <NButton data-testid="apply-add" type="primary" @click="handleAdd">新增投递记录</NButton>
          <NButton tag="a" href="/workspace#phase-apply">去工作台看匹配报告</NButton>
        </div>
      </article>

      <article class="stage-card glass-panel">
        <div class="stage-card__head">
          <h2>投递策略提醒</h2>
        </div>
        <p v-if="adviceMetaText" class="ai-meta">{{ adviceMetaText }}</p>
        <ul class="stage-list">
          <li>优先投递高匹配、高优先级岗位，避免把精力分散在低质量岗位上。</li>
          <li>每条投递都要有明确的下一步动作，例如补发作品集、查看状态、催促内推。</li>
          <li>同一岗位投递前尽量保留一版定制化简历版本，便于后续复盘查看率和邀约率。</li>
        </ul>

        <h3>当前版本资产</h3>
        <ul class="stage-list">
          <li>简历版本数：{{ workspace.snapshots.length }}</li>
          <li>最近匹配度：{{ latestScore }}</li>
          <li>进行中任务：{{ workspace.progress.filter((item) => item.status === 'doing').length }}</li>
        </ul>

        <div class="stage-actions">
          <NButton data-testid="apply-advise" type="primary" :loading="advicePending" @click="handleAdvise">
            生成投递建议
          </NButton>
        </div>

        <div v-if="apply.latestAdvice" class="advice-output">
          <p>{{ apply.latestAdvice.summary }}</p>
          <h3>优先目标</h3>
          <ul class="stage-list">
            <li v-for="item in apply.latestAdvice.prioritizedTargets" :key="item">{{ item }}</li>
          </ul>
          <h3>下一步动作</h3>
          <ul class="stage-list">
            <li v-for="item in apply.latestAdvice.followUpActions" :key="item">{{ item }}</li>
          </ul>
          <h3>当前风险</h3>
          <ul class="stage-list">
            <li v-for="item in apply.latestAdvice.risks" :key="item">{{ item }}</li>
          </ul>
        </div>
      </article>
    </section>

    <div class="mobile-action-bar glass-panel">
      <NButton data-testid="apply-mobile-add" type="primary" @click="handleAdd">新增记录</NButton>
      <NButton tag="a" href="/workspace#phase-apply">看匹配报告</NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NSelect, useMessage } from 'naive-ui'
import type { ApplyAdvicePayload } from '~/types/interview'

const message = useMessage()
const { state, load, persist, setLatestAdvice } = useApplyPlanner()
const { state: workspaceState, load: loadWorkspace } = useInterviewTracker()
const advicePending = ref(false)

const apply = computed(() => state.value)
const applications = computed(() => apply.value.applications)
const workspace = computed(() => workspaceState.value)
const highPriorityCount = computed(() => applications.value.filter((item) => item.priority === 'high').length)
const interviewCount = computed(() => applications.value.filter((item) => item.status === 'interview').length)
const latestScore = computed(() => {
  const score = workspace.value.latestReport?.match[0]?.score
  return score ? `${score} 分` : '未分析'
})
const adviceMetaText = computed(() => useAiMetaText(apply.value.latestAdvice?.meta))

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已投递', value: 'applied' },
  { label: '已查看', value: 'viewed' },
  { label: '面试中', value: 'interview' },
  { label: '已拿 Offer', value: 'offer' },
  { label: '已拒绝', value: 'rejected' },
]

const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

watch(applications, () => persist(), { deep: true })

onMounted(() => {
  load()
  loadWorkspace()
})

const handleAdd = () => {
  state.value.applications.unshift({
    id: crypto.randomUUID(),
    company: '',
    role: '',
    channel: '',
    status: 'draft',
    priority: 'medium',
    nextAction: '',
    followUpDate: '',
    notes: '',
  })
  persist()
}

const handleAdvise = async () => {
  const validApplications = applications.value.filter((item) => item.company.trim() || item.role.trim())
  if (!validApplications.length) {
    message.warning('先录入至少 1 条投递记录，再生成投递建议')
    return
  }

  advicePending.value = true
  try {
    const result = await $fetch<ApplyAdvicePayload>('/api/apply/advise', {
      method: 'POST',
      body: {
        applications: applications.value,
        resume: workspace.value.resumeText,
        jd: workspace.value.jdText,
        company: workspace.value.companyText,
      },
    })
    setLatestAdvice(result)
    message.success(result.meta?.provider === 'deepseek' ? '投递建议已生成' : '投递建议已生成，当前为本地回退结果')
  } catch (error) {
    console.error(error)
    message.error('投递建议生成失败')
  } finally {
    advicePending.value = false
  }
}
</script>

<style scoped>
.apply-page {
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
  grid-template-columns: 1.25fr 0.75fr;
  gap: 24px;
}

.application-list {
  display: grid;
  gap: 14px;
}

.application-row {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.application-row:hover {
  transform: var(--hover-lift);
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

.ai-meta {
  margin: 0 0 12px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
}

.advice-output {
  margin-top: 16px;
  padding: 16px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
}

.advice-output p {
  margin: 0 0 12px;
  color: var(--text-muted);
  line-height: 1.7;
}

.advice-output h3 {
  margin: 12px 0 8px;
}

.mobile-action-bar {
  position: sticky;
  bottom: 12px;
  z-index: 12;
  display: none;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  border-radius: calc(var(--panel-radius) - 4px);
  box-shadow: var(--shadow-nav);
}

@media (max-width: 980px) {
  .stage-hero,
  .stage-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .stage-actions {
    display: none;
  }

  .mobile-action-bar {
    display: grid;
  }
}
</style>
