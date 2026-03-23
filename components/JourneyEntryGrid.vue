<template>
  <section class="entry-grid glass-panel">
    <div class="entry-grid__copy">
      <span>Roadmap</span>
      <h2>4 个阶段，独立模块化扩展</h2>
      <p>阶段说明单独抽成模块页，后续每个阶段都可以继续增加专属功能，而不是继续往一个大页面里塞。</p>
    </div>

    <div class="entry-grid__cards">
      <article v-for="item in items" :key="item.title" class="entry-card">
        <strong>{{ item.title }}</strong>
        <p>{{ item.summary }}</p>
      </article>
    </div>

    <div class="entry-grid__actions">
      <NButton tag="a" href="/journey" type="primary">进入求职阶段模块</NButton>
      <NButton tag="a" href="/journey/prepare">开始准备阶段</NButton>
      <NButton tag="a" href="/workspace" secondary>直接进入工作台</NButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

const items = [
  { title: '准备', summary: '先建立底稿和版本体系。' },
  { title: '匹配', summary: '用 AI 诊断你和岗位的真实差距。' },
  { title: '投递', summary: '把分析结果转成可执行投递动作。' },
  { title: '面试与复盘', summary: '沉淀追问、复盘和下一轮优化。' },
]
</script>

<style scoped>
.entry-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 20px;
  padding: 24px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: var(--shadow-panel);
}

.entry-grid__copy span {
  color: var(--accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.entry-grid__copy h2 {
  margin: 12px 0 10px;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1;
}

.entry-grid__copy p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.8;
}

.entry-grid__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.entry-card {
  padding: 18px;
  border: 2px solid var(--border-strong);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.entry-card:hover {
  transform: var(--hover-lift);
}

.entry-card strong {
  font-size: 22px;
}

.entry-card p {
  margin: 10px 0 0;
  color: var(--text-muted);
  line-height: 1.7;
}

.entry-grid__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 1100px) {
  .entry-grid,
  .entry-grid__cards {
    grid-template-columns: 1fr;
  }
}
</style>
