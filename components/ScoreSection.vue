<template>
  <section class="score-section glass-panel">
    <div class="score-section__head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
    </div>
    <div class="score-section__list">
      <div v-for="item in items" :key="item.label" class="score-item">
        <div class="score-item__meta">
          <strong>{{ item.label }}</strong>
          <span>{{ item.score }} 分</span>
        </div>
        <NProgress
          type="line"
          :percentage="item.score"
          :show-indicator="false"
          :height="10"
          status="success"
          border-radius="999"
        />
        <p>{{ item.summary }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NProgress } from 'naive-ui'
import type { ScoreBlock } from '~/types/interview'

defineProps<{
  title: string
  subtitle: string
  items: ScoreBlock[]
}>()
</script>

<style scoped>
.score-section {
  padding: 24px;
  border-radius: var(--panel-radius);
}

.score-section__head h3 {
  margin: 0;
  font-size: 20px;
}

.score-section__head p {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.score-section__list {
  display: grid;
  gap: 18px;
  margin-top: 22px;
}

.score-item {
  padding: 18px;
  background: var(--card-bg);
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.score-item:hover {
  transform: var(--hover-lift);
}

.score-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.score-item__meta span,
.score-item p {
  color: var(--text-muted);
}

.score-item p {
  margin: 10px 0 0;
  line-height: 1.6;
}
</style>
