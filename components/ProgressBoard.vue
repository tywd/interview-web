<template>
  <section class="progress-board glass-panel">
    <div class="progress-board__head">
      <div>
        <h3>面试推进看板</h3>
        <p>追踪简历修改、公司研究、模拟面试与复盘节奏。</p>
      </div>
      <NButton secondary type="primary" @click="handleAdd">
        新增任务
      </NButton>
    </div>

    <div class="progress-board__list">
      <div v-for="item in modelValue" :key="item.id" class="task-row">
        <div class="task-row__main">
          <NInput v-model:value="item.label" placeholder="任务名称" />
          <div class="task-row__meta">
            <NSelect
              v-model:value="item.status"
              :options="statusOptions"
              size="small"
            />
            <NInput v-model:value="item.owner" placeholder="负责人" size="small" />
            <NDatePicker
              v-model:formatted-value="item.dueDate"
              value-format="yyyy-MM-dd"
              type="date"
              clearable
              size="small"
            />
          </div>
        </div>
        <NButton text type="error" @click="handleRemove(item.id)">删除</NButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NButton, NDatePicker, NInput, NSelect } from 'naive-ui'
import type { ProgressItem } from '~/types/interview'

const props = defineProps<{
  modelValue: ProgressItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ProgressItem[]]
}>()

const statusOptions = [
  { label: '待处理', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '已完成', value: 'done' },
]

const update = (list: ProgressItem[]) => {
  emit('update:modelValue', [...list])
}

const handleAdd = () => {
  update([
    ...props.modelValue,
    {
      id: crypto.randomUUID(),
      label: '',
      status: 'todo',
      owner: '候选人',
      dueDate: '',
    },
  ])
}

const handleRemove = (id: string) => {
  update(props.modelValue.filter((item) => item.id !== id))
}
</script>

<style scoped>
.progress-board {
  padding: 24px;
  border-radius: var(--panel-radius);
}

.progress-board__head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.progress-board__head h3 {
  margin: 0;
}

.progress-board__head p {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.progress-board__list {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.task-row {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-radius: var(--radius-card);
  background: var(--card-bg);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.task-row:hover {
  transform: var(--hover-lift);
}

.task-row__main {
  flex: 1;
}

.task-row__meta {
  display: grid;
  grid-template-columns: 140px 140px 180px;
  gap: 12px;
  margin-top: 12px;
}

@media (max-width: 900px) {
  .progress-board__head,
  .task-row {
    flex-direction: column;
    align-items: stretch;
  }

  .task-row__meta {
    grid-template-columns: 1fr;
  }
}
</style>
