<template>
  <div class="prep-page">
    <section class="prep-hero glass-panel">
      <div>
        <span class="prep-hero__eyebrow">Stage 1</span>
        <h1>准备阶段</h1>
        <p>先把目标、材料和项目证据搭好，再进入匹配和投递。这个页面只负责准备阶段，不和后续环节混在一起。</p>
      </div>
      <div class="prep-score">
        <span>准备完成度</span>
        <strong>{{ readinessScore }}%</strong>
        <p>{{ completedCount }}/{{ preparation.checklist.length }} 项已完成</p>
      </div>
    </section>

    <section class="prep-grid">
      <article class="prep-card glass-panel">
        <div class="prep-card__head">
          <h2>目标岗位画像</h2>
          <p>先定义你要去哪，不然简历和投递都会发散。</p>
        </div>
        <div class="prep-form">
          <label>
            <span>目标岗位</span>
            <NInput v-model:value="preparation.targetRole" placeholder="例如：高级前端工程师 / AI 产品前端" />
          </label>
          <label>
            <span>目标城市</span>
            <NInput v-model:value="preparation.targetCity" placeholder="例如：上海 / 杭州 / 远程" />
          </label>
          <label>
            <span>目标级别</span>
            <NInput v-model:value="preparation.targetLevel" placeholder="例如：P6 / 资深 / 专家" />
          </label>
          <label>
            <span>目标行业</span>
            <NInput v-model:value="preparation.targetIndustry" placeholder="例如：AI / SaaS / 教育科技" />
          </label>
          <label>
            <span>期望薪资</span>
            <NInput v-model:value="preparation.targetSalary" placeholder="例如：30-40K * 16" />
          </label>
        </div>
      </article>

      <article class="prep-card glass-panel">
        <div class="prep-card__head">
          <h2>材料检查清单</h2>
          <p>这部分直接决定你是否适合进入下一阶段。</p>
        </div>
        <div class="checklist">
          <label
            v-for="item in preparation.checklist"
            :key="item.id"
            class="check-item"
            :class="{ 'check-item--done': item.done }"
          >
            <input v-model="item.done" type="checkbox">
            <span>{{ item.label }}</span>
          </label>
        </div>
        <div class="prep-actions prep-actions--tight">
          <NButton data-testid="prepare-review" type="primary" :loading="reviewPending" @click="handleReview">
            AI 检查准备缺失
          </NButton>
        </div>
      </article>
    </section>

    <section class="prep-grid prep-grid--wide">
      <article class="prep-card glass-panel">
        <div class="prep-card__head">
          <h2>项目证据整理</h2>
          <p>用“背景、动作、结果”沉淀项目，后面可直接喂给简历优化和面试模块。</p>
        </div>
        <div class="project-stack">
          <div
            v-for="project in preparation.projectNotes"
            :key="project.id"
            class="project-note"
          >
            <NInput v-model:value="project.title" placeholder="项目名称" />
            <NInput v-model:value="project.situation" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="项目背景：做什么，目标是什么，为什么重要" />
            <NInput v-model:value="project.action" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="你的动作：你负责什么，怎么做，解决了什么问题" />
            <NInput v-model:value="project.result" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="结果：量化指标、效率提升、业务影响、团队价值" />
          </div>
        </div>
        <div v-if="reviewResult?.rewrittenProjects.length" class="ai-output">
          <h3>AI 改写建议</h3>
          <ul>
            <li v-for="item in reviewResult.rewrittenProjects" :key="item.title">
              <strong>{{ item.title }}：</strong>{{ item.bullet }}
            </li>
          </ul>
        </div>
      </article>

      <article class="prep-card glass-panel">
        <div class="prep-card__head">
          <h2>自我介绍底稿</h2>
          <p>先写出 1 分钟版本，后续再让 AI 帮你压缩和贴岗。</p>
        </div>
        <NInput
          v-model:value="preparation.selfIntro"
          type="textarea"
          :autosize="{ minRows: 12, maxRows: 18 }"
          placeholder="建议结构：我是谁 / 我做过什么 / 我为什么适合这个方向"
        />

        <div v-if="reviewResult" class="ai-output">
          <h3>AI 优化结果</h3>
          <p>{{ reviewResult.optimizedSelfIntro }}</p>
          <ul>
            <li v-for="item in reviewResult.resumeWarnings" :key="item">{{ item }}</li>
          </ul>
          <ul v-if="reviewResult.missingItems.length">
            <li v-for="item in reviewResult.missingItems" :key="item">缺失：{{ item }}</li>
          </ul>
        </div>

        <div class="prep-actions">
          <NButton @click="handleAddProject">新增项目证据</NButton>
          <NButton :loading="reviewPending" @click="handleApplyIntro">
            应用 AI 自我介绍
          </NButton>
          <NButton data-testid="prepare-sync" @click="handleSyncToWorkspace">
            一键同步到工作台
          </NButton>
          <NButton tag="a" href="/workspace#phase-prepare" type="primary">
            去工作台完善材料
          </NButton>
          <NButton secondary @click="handleReset">重置准备阶段</NButton>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, useMessage } from 'naive-ui'
import type { PreparationReviewResult } from '~/types/interview'

const message = useMessage()
const { state, load, persist, reset } = usePreparationPlanner()
const { state: workspaceState, updateTexts, load: loadWorkspace, persist: persistWorkspace } = useInterviewTracker()
const reviewPending = ref(false)
const reviewResult = ref<PreparationReviewResult | null>(null)

const preparation = computed({
  get: () => state.value,
  set: (value) => {
    state.value = value
  },
})

const completedCount = computed(() => preparation.value.checklist.filter((item) => item.done).length)
const readinessScore = computed(() =>
  Math.round((completedCount.value / Math.max(preparation.value.checklist.length, 1)) * 100),
)

watch(
  preparation,
  () => {
    persist()
  },
  { deep: true },
)

onMounted(() => {
  load()
  loadWorkspace()
})

const handleAddProject = () => {
  preparation.value.projectNotes.push({
    id: crypto.randomUUID(),
    title: `项目 ${preparation.value.projectNotes.length + 1}`,
    situation: '',
    action: '',
    result: '',
  })
  persist()
  message.success('已新增项目证据卡片')
}

const handleReview = async () => {
  reviewPending.value = true

  try {
    const result = await $fetch<PreparationReviewResult>('/api/prepare/review', {
      method: 'POST',
      body: {
        checklist: preparation.value.checklist,
        resumeText: workspaceState.value.resumeText,
        selfIntro: preparation.value.selfIntro,
        projectNotes: preparation.value.projectNotes,
      },
    })

    reviewResult.value = result
    message.success('准备阶段检查已生成')
  } catch (error) {
    console.error(error)
    message.error('准备阶段检查失败')
  } finally {
    reviewPending.value = false
  }
}

const handleApplyIntro = () => {
  if (!reviewResult.value?.optimizedSelfIntro) {
    message.warning('请先执行 AI 检查')
    return
  }

  preparation.value.selfIntro = reviewResult.value.optimizedSelfIntro
  persist()
  message.success('已应用 AI 优化后的自我介绍')
}

const handleSyncToWorkspace = () => {
  const projectBullets = reviewResult.value?.rewrittenProjects.length
    ? reviewResult.value.rewrittenProjects.map((item) => `- ${item.bullet}`).join('\n')
    : preparation.value.projectNotes
        .map((item) => `- ${item.title}：${item.situation}；${item.action}；${item.result}`)
        .join('\n')

  const roleSummary = [
    preparation.value.targetRole && `目标岗位：${preparation.value.targetRole}`,
    preparation.value.targetCity && `目标城市：${preparation.value.targetCity}`,
    preparation.value.targetLevel && `目标级别：${preparation.value.targetLevel}`,
    preparation.value.targetIndustry && `目标行业：${preparation.value.targetIndustry}`,
    preparation.value.targetSalary && `期望薪资：${preparation.value.targetSalary}`,
  ].filter(Boolean).join('\n')

  const syncedResume = [
    workspaceState.value.resumeText.trim(),
    roleSummary,
    preparation.value.selfIntro ? `\n自我介绍底稿\n${preparation.value.selfIntro}` : '',
    projectBullets ? `\n项目证据\n${projectBullets}` : '',
  ].filter(Boolean).join('\n\n')

  updateTexts({
    resumeText: syncedResume,
    jdText: workspaceState.value.jdText,
    companyText: workspaceState.value.companyText,
  })
  persistWorkspace()
  message.success('已同步到工作台输入区')
}

const handleReset = () => {
  reset()
  reviewResult.value = null
  message.success('准备阶段内容已重置')
}
</script>

<style scoped>
.prep-page {
  display: grid;
  gap: 24px;
}

.prep-hero,
.prep-card {
  padding: 24px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: 8px 8px 0 rgba(20, 16, 12, 0.9);
}

.prep-hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.prep-hero__eyebrow {
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

.prep-hero h1 {
  margin: 14px 0 10px;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 0.96;
  text-transform: uppercase;
}

.prep-hero p,
.prep-card__head p,
.prep-score p,
.prep-form label span,
.project-note :deep(textarea),
.check-item span {
  color: var(--text-muted);
}

.prep-score {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 18px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: 4px 4px 0 rgba(20, 16, 12, 0.9);
}

.prep-score span {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.prep-score strong {
  font-size: 48px;
  line-height: 1;
}

.prep-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.prep-grid--wide {
  align-items: start;
}

.prep-card__head h2 {
  margin: 0;
  font-size: 28px;
}

.prep-card__head p {
  margin: 10px 0 0;
  line-height: 1.7;
}

.prep-form,
.project-stack {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.prep-form label {
  display: grid;
  gap: 8px;
}

.prep-form label span {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.checklist {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.check-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 18px;
  background: var(--card-bg);
}

.check-item--done {
  background: var(--card-strong-bg);
}

.project-note {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: 4px 4px 0 rgba(20, 16, 12, 0.9);
}

.prep-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.prep-actions--tight {
  margin-top: 16px;
}

.ai-output {
  margin-top: 18px;
  padding: 16px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 18px;
  background: var(--card-bg);
}

.ai-output h3 {
  margin: 0 0 10px;
}

.ai-output p,
.ai-output ul {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.7;
}

.ai-output ul + ul,
.ai-output p + ul {
  margin-top: 12px;
}

@media (max-width: 980px) {
  .prep-hero,
  .prep-grid {
    grid-template-columns: 1fr;
  }
}
</style>
