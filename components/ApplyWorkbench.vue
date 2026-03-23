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
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NSelect } from 'naive-ui'

const { state, load, persist } = useApplyPlanner()
const { state: workspaceState, load: loadWorkspace } = useInterviewTracker()

const applications = computed(() => state.value.applications)
const workspace = computed(() => workspaceState.value)
const highPriorityCount = computed(() => applications.value.filter((item) => item.priority === 'high').length)
const interviewCount = computed(() => applications.value.filter((item) => item.status === 'interview').length)
const latestScore = computed(() => {
  const score = workspace.value.latestReport?.match[0]?.score
  return score ? `${score} 分` : '未分析'
})

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
.stage-score p,
.stage-card__head p,
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
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 18px;
  background: var(--card-bg);
  box-shadow: 4px 4px 0 rgba(20, 16, 12, 0.9);
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

@media (max-width: 980px) {
  .stage-hero,
  .stage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
