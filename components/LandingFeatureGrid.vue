<template>
  <section class="feature-grid">
    <article
      v-for="feature in features"
      :key="feature.title"
      class="feature-card glass-panel"
    >
      <span>{{ feature.kicker }}</span>
      <h2>{{ feature.title }}</h2>
      <p>{{ feature.description }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    kicker: 'Why It Exists',
    title: '不是单点打分，而是求职操作系统',
    description:
      '把简历、岗位、公司、投递记录和面试准备放在一条路径里，避免用户每个阶段都切工具。',
  },
  {
    kicker: 'What AI Does',
    title: '让 AI 负责诊断、重写、提醒和复盘',
    description:
      '优先解决求职里真正影响结果的环节：贴岗表达、关键词映射、亮点提炼、追问准备。',
  },
  {
    kicker: 'How It Converts',
    title: '围绕被查看率、邀约率、入职率设计功能',
    description:
      '每一步都围绕实际转化指标，而不是生成一堆好看但无行动价值的分析内容。',
  },
]
</script>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.feature-card {
  padding: 22px;
  border-radius: calc(var(--panel-radius) + 2px);
  box-shadow: var(--shadow-nav);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.feature-card:hover {
  transform: var(--hover-lift);
}

.feature-card span {
  display: inline-flex;
  margin-bottom: 10px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feature-card h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
}

.feature-card p {
  margin: 14px 0 0;
  color: var(--text-muted);
  line-height: 1.8;
}

@media (max-width: 1100px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
