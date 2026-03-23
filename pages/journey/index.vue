<template>
  <div class="journey-page">
    <JourneySidebar :items="sidebarItems" :active-id="activeSectionId" />

    <div class="journey-page__content">
      <section class="journey-intro glass-panel">
        <span>Journey Module</span>
        <h1>求职阶段模块</h1>
        <p>
          这里不直接承载所有功能，而是作为求职方法论和模块入口。后续每个阶段都可以继续扩展成独立页面、
          独立表单和独立 AI 流程。
        </p>
      </section>

      <JourneyPhaseSection
        v-for="item in journeyItems"
        :key="item.id"
        v-bind="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const journeyItems = [
  {
    id: 'prepare',
    step: '阶段一',
    title: '准备',
    summary: '先把投递底稿搭好。材料不完整，再强的模型也只能给出模糊建议。',
    primaryPoints: [
      '明确目标岗位、城市、职级和行业范围。',
      '准备一份可投递的基础简历和项目清单。',
      '收集目标岗位 JD 与公司资料，形成分析输入。',
    ],
    secondaryPoints: [
      '把项目经历改成“目标、动作、结果”结构。',
      '优先补充量化指标、协作角色和业务影响。',
      '建立一份能持续迭代的基础求职档案。',
    ],
    actionLabel: '进入准备功能',
    actionHref: '/journey/prepare',
  },
  {
    id: 'match',
    step: '阶段二',
    title: '匹配',
    summary: '判断你和岗位到底差在哪，别把大量时间花在错误方向上。',
    primaryPoints: [
      '识别岗位关键词、核心职责和加分项。',
      '判断你的技术、业务和协作经验匹配度。',
      '找到影响被查看率和邀约率的表达短板。',
    ],
    secondaryPoints: [
      '区分“能力不足”和“表达不足”这两类问题。',
      '把 JD 语言映射到项目经历和技能标签里。',
      '优先修复高频风险：不量化、不贴岗、不懂业务。',
    ],
    actionLabel: '进入匹配功能',
    actionHref: '/journey/match',
  },
  {
    id: 'apply',
    step: '阶段三',
    title: '投递',
    summary: '目标是提高简历被查看和被邀约的概率，不是机械海投。',
    primaryPoints: [
      '基于分析结果生成岗位定制版简历。',
      '围绕岗位、公司和业务场景做投递版本管理。',
      '记录每次投递状态，持续优化命中率。',
    ],
    secondaryPoints: [
      '为不同公司保留多份简历与版本快照。',
      '优先投高匹配岗位，降低无效投递消耗。',
      '把 AI 结论转化为更具体的简历修改动作。',
    ],
    actionLabel: '进入投递功能',
    actionHref: '/journey/apply',
  },
  {
    id: 'interview',
    step: '阶段四',
    title: '面试与复盘',
    summary: '面试不是临场发挥，核心是让你的表达和岗位需求高度对齐。',
    primaryPoints: [
      '准备自我介绍、项目讲解和常见追问。',
      '围绕岗位要求生成更贴题的回答框架。',
      '每轮面试后复盘并沉淀下轮优化动作。',
    ],
    secondaryPoints: [
      '针对技术面、业务面、HR 面分别准备素材。',
      '记录被追问点、卡壳点和 offer 风险项。',
      '持续提升最终入职率，而不是只追求面试次数。',
    ],
    actionLabel: '进入面试功能',
    actionHref: '/journey/interview',
  },
] as const

type JourneySectionId = (typeof journeyItems)[number]['id']

const sidebarItems = journeyItems.map(({ id, step, title }) => ({ id, step, title }))
const activeSectionId = ref<JourneySectionId>(sidebarItems[0]?.id ?? 'prepare')
let sectionObserver: IntersectionObserver | null = null

const updateFromHash = () => {
  const hashedId = route.hash.replace('#', '') as JourneySectionId
  if (hashedId && sidebarItems.some((item) => item.id === hashedId)) {
    activeSectionId.value = hashedId
  }
}

watch(() => route.hash, updateFromHash, { immediate: true })

onMounted(() => {
  updateFromHash()

  const sections = sidebarItems
    .map((item) => document.getElementById(item.id))
    .filter((section): section is HTMLElement => Boolean(section))

  if (!sections.length) {
    return
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

      const topEntry = visibleEntries[0]
      if (topEntry?.target.id) {
        activeSectionId.value = topEntry.target.id as JourneySectionId
      }
    },
    {
      rootMargin: '-15% 0px -55% 0px',
      threshold: [0.2, 0.4, 0.6],
    },
  )

  sections.forEach((section) => sectionObserver?.observe(section))
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
})
</script>

<style scoped>
.journey-page {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
}

.journey-page__content {
  display: grid;
  gap: 20px;
}

.journey-intro {
  padding: 24px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: var(--shadow-panel);
}

.journey-intro span {
  color: var(--accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.journey-intro h1 {
  margin: 14px 0 10px;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 0.96;
  text-transform: uppercase;
}

.journey-intro p {
  margin: 0;
  max-width: 64ch;
  color: var(--text-muted);
  line-height: 1.8;
}

@media (max-width: 980px) {
  .journey-page {
    grid-template-columns: 1fr;
  }
}
</style>
