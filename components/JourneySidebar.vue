<template>
  <aside class="journey-sidebar glass-panel">
    <p>求职阶段</p>
    <NuxtLink
      v-for="item in items"
      :key="item.id"
      :to="`/journey#${item.id}`"
      class="journey-sidebar__link"
      :class="{ 'journey-sidebar__link--active': isActive(item.id) }"
      :aria-current="isActive(item.id) ? 'location' : undefined"
    >
      <span>{{ item.step }}</span>
      <strong>{{ item.title }}</strong>
    </NuxtLink>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const props = defineProps<{
  items: Array<{ id: string; step: string; title: string }>
}>()

const isActive = (id: string) => {
  if (route.path !== '/journey') {
    return false
  }

  if (route.hash) {
    return route.hash === `#${id}`
  }

  return props.items[0]?.id === id
}
</script>

<style scoped>
.journey-sidebar {
  position: sticky;
  top: 104px;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px;
  border-radius: calc(var(--panel-radius) + 2px);
  box-shadow: 6px 6px 0 var(--border-strong);
}

.journey-sidebar p {
  margin: 0 0 6px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.journey-sidebar__link {
  display: grid;
  gap: 5px;
  padding: 14px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background var(--transition-fast),
    color var(--transition-fast);
}

.journey-sidebar__link:hover {
  transform: var(--hover-lift);
}

.journey-sidebar__link:focus-visible,
.journey-sidebar__link--active {
  background: #fff3c6;
  transform: var(--hover-lift);
  box-shadow: 6px 6px 0 var(--border-strong), var(--focus-ring);
}

.journey-sidebar__link--active span,
.journey-sidebar__link--active strong {
  color: var(--text-main);
}

.journey-sidebar__link span {
  color: var(--accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.journey-sidebar__link strong {
  font-size: 18px;
}

@media (max-width: 980px) {
  .journey-sidebar {
    position: static;
  }
}
</style>
