<template>
  <section class="advice-panel glass-panel">
    <div class="advice-panel__head">
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
    </div>
    <div class="advice-panel__grid">
      <article v-for="block in items" :key="block.title" class="advice-card">
        <h4>{{ block.title }}</h4>
        <ul>
          <li v-for="detail in block.details" :key="detail">{{ detail }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AdviceBlock } from '~/types/interview'

defineProps<{
  title: string
  subtitle: string
  items: AdviceBlock[]
}>()
</script>

<style scoped>
.advice-panel {
  padding: 24px;
  border-radius: var(--panel-radius);
}

.advice-panel__head h3,
.advice-card h4 {
  margin: 0;
}

.advice-panel__head p {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.advice-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.advice-card {
  padding: 20px;
  border-radius: 20px;
  background: var(--card-bg);
  border: 1px solid var(--line-soft);
}

ul {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--text-muted);
  line-height: 1.7;
}

@media (max-width: 900px) {
  .advice-panel__grid {
    grid-template-columns: 1fr;
  }
}
</style>
