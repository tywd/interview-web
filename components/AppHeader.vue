<template>
  <header class="site-header glass-panel">
    <NuxtLink to="/" class="site-brand">
      <span class="site-brand__mark">AI</span>
      <div>
        <strong>Offer Copilot</strong>
        <p>求职闭环工作台</p>
      </div>
    </NuxtLink>

    <nav class="site-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="site-nav__link"
        :class="{ 'site-nav__link--active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: '首页', to: '/' },
  { label: '求职阶段', to: '/journey' },
  { label: '分析工作台', to: '/workspace' },
]

const isActive = (to: string) => {
  if (to === '/') {
    return route.path === '/'
  }

  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 18px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 18px;
  border-radius: calc(var(--panel-radius) + 2px);
}

.site-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.site-brand__mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 2px solid var(--border-strong);
  border-radius: 14px;
  background: var(--card-strong-bg);
  font-weight: 900;
}

.site-brand strong,
.site-brand p {
  display: block;
}

.site-brand strong {
  font-size: 16px;
}

.site-brand p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.site-nav__link {
  padding: 10px 14px;
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-weight: 700;
  transition:
    border-color var(--transition-fast),
    transform var(--transition-fast),
    color var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast);
}

.site-nav__link:hover,
.site-nav__link:focus-visible,
.site-nav__link--active {
  color: var(--text-main);
  border-color: var(--border-strong);
  background: var(--card-bg);
  transform: var(--hover-lift);
  box-shadow: var(--focus-ring);
}

@media (max-width: 720px) {
  .site-header {
    top: 12px;
    align-items: flex-start;
    flex-direction: column;
  }

  .site-nav {
    width: 100%;
  }

  .site-nav__link {
    flex: 1;
    text-align: center;
  }
}
</style>
