<template>
  <section class="timeline glass-panel">
    <div class="timeline__head">
      <div>
        <h3>简历版本追踪</h3>
        <p>保留优化前后版本，观察匹配度提升轨迹。</p>
      </div>
      <NButton type="primary" secondary @click="$emit('save')">
        保存当前版本
      </NButton>
    </div>

    <NTimeline class="timeline__list">
      <NTimelineItem
        v-for="snapshot in snapshots"
        :key="snapshot.id"
        type="success"
        :title="`${snapshot.title} · ${snapshot.score}分`"
        :content="snapshot.notes.join(' / ')"
        :time="snapshot.createdAt"
      >
        <div class="timeline__content">
          {{ snapshot.content }}
        </div>
      </NTimelineItem>
    </NTimeline>
  </section>
</template>

<script setup lang="ts">
import { NButton, NTimeline, NTimelineItem } from 'naive-ui'
import type { ResumeSnapshot } from '~/types/interview'

defineProps<{
  snapshots: ResumeSnapshot[]
}>()

defineEmits<{
  save: []
}>()
</script>

<style scoped>
.timeline {
  padding: 24px;
  border-radius: var(--panel-radius);
}

.timeline__head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.timeline__head h3 {
  margin: 0;
}

.timeline__head p {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.timeline__list {
  margin-top: 20px;
}

.timeline__content {
  margin-top: 10px;
  padding: 14px;
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-muted);
  background: var(--card-bg);
  border: 2px solid var(--border-strong);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
}

@media (max-width: 900px) {
  .timeline__head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
