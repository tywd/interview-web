<template>
  <div class="stat-card glass-panel">
    <div class="stat-card__header">
      <span>{{ title }}</span>
      <strong>{{ value }}</strong>
    </div>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string
  description: string
}>()
</script>

<style scoped>
.stat-card {
  padding: 20px;
  border-radius: calc(var(--panel-radius) - 4px);
}

.stat-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card__header span {
  color: var(--text-muted);
  font-size: 14px;
}

.stat-card__header strong {
  font-size: 28px;
  font-weight: 700;
}

p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
