<template>
  <div class="page-shell">
    <AppHeader />
    <main class="page-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.page-main {
  margin-top: 22px;
}
</style>
