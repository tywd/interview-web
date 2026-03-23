<template>
  <section :id="id" class="phase-section glass-panel">
    <div class="phase-section__head">
      <span>{{ step }}</span>
      <h2>{{ title }}</h2>
      <p>{{ summary }}</p>
    </div>

    <div class="phase-section__grid">
      <div class="phase-section__block">
        <h3>大目标</h3>
        <ul>
          <li v-for="item in primaryPoints" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="phase-section__block">
        <h3>执行小点</h3>
        <ul>
          <li v-for="item in secondaryPoints" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div class="phase-section__footer">
      <NButton tag="a" :href="actionHref" type="primary">
        {{ actionLabel }}
      </NButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{
  id: string
  step: string
  title: string
  summary: string
  primaryPoints: readonly string[]
  secondaryPoints: readonly string[]
  actionLabel: string
  actionHref: string
}>()
</script>

<style scoped>
.phase-section {
  display: grid;
  gap: 20px;
  padding: 24px;
  border-radius: calc(var(--panel-radius) + 4px);
  box-shadow: 8px 8px 0 rgba(20, 16, 12, 0.9);
}

.phase-section__head span {
  display: inline-flex;
  color: var(--accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.phase-section__head h2 {
  margin: 12px 0 10px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1;
}

.phase-section__head p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.8;
}

.phase-section__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.phase-section__block {
  padding: 18px;
  border: 2px solid rgba(20, 16, 12, 0.9);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: 4px 4px 0 rgba(20, 16, 12, 0.9);
}

.phase-section__block h3 {
  margin: 0 0 10px;
}

.phase-section__block ul {
  margin: 0;
  padding-left: 18px;
  color: var(--text-muted);
  line-height: 1.7;
}

@media (max-width: 980px) {
  .phase-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
