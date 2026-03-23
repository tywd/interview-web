<template>
  <section class="landing-hero">
    <div class="landing-hero__copy glass-panel">
      <span class="landing-hero__eyebrow">AI Job Search System</span>
      <h1>把求职拆成可执行的系统，而不是一轮轮碰运气。</h1>
      <p>
        Offer Copilot 用 AI 帮用户完成材料准备、岗位匹配、投递优化和面试复盘，
        目标不是生成漂亮报告，而是稳定提升被查看率、邀约率和入职率。
      </p>
      <div class="landing-hero__actions">
        <NButton tag="a" href="/workspace" type="primary" size="large">进入分析工作台</NButton>
        <NButton tag="a" href="/journey" size="large" secondary>查看求职阶段</NButton>
      </div>
    </div>

    <div class="landing-hero__panel glass-panel">
      <div class="landing-metric">
        <span>01</span>
        <strong>准备</strong>
        <p>补齐简历、JD、公司资料与版本底稿。</p>
      </div>
      <div class="landing-metric">
        <span>02</span>
        <strong>匹配</strong>
        <p>找出差距、亮点和最影响邀约率的问题。</p>
      </div>
      <div class="landing-metric">
        <span>03</span>
        <strong>投递与面试</strong>
        <p>围绕岗位重写表达，并把追问准备成模板。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
</script>

<style scoped>
.landing-hero {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 24px;
}

.landing-hero__copy,
.landing-hero__panel {
  padding: 28px;
  border-radius: calc(var(--panel-radius) + 6px);
  box-shadow: var(--shadow-panel);
}

.landing-hero__eyebrow {
  display: inline-flex;
  padding: 8px 12px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-pill);
  background: var(--card-strong-bg);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.landing-hero h1 {
  margin: 16px 0 14px;
  max-width: 12ch;
  font-size: clamp(42px, 6vw, 74px);
  line-height: 0.96;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.landing-hero p {
  margin: 0;
  max-width: 64ch;
  color: var(--text-muted);
  font-size: 17px;
  line-height: 1.8;
}

.landing-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.landing-hero__panel {
  display: grid;
  gap: 14px;
  align-content: start;
}

.landing-metric {
  padding: 18px;
  border: 2px solid var(--border-strong);
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: var(--shadow-card);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.landing-metric:hover {
  transform: var(--hover-lift);
}

.landing-metric span,
.landing-metric strong {
  display: block;
}

.landing-metric span {
  color: var(--accent);
  font-weight: 900;
  letter-spacing: 0.08em;
}

.landing-metric strong {
  margin-top: 8px;
  font-size: 24px;
}

.landing-metric p {
  margin-top: 10px;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .landing-hero {
    grid-template-columns: 1fr;
  }
}
</style>
