<template>
  <div class="page-banner" :class="`page-banner--${gradient}`">
    <h2 class="page-banner__title">{{ title }}</h2>
    <p v-if="subtitle" class="page-banner__subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  gradient: { type: String, default: 'green', validator: v => ['green', 'orange', 'blue', 'purple'].includes(v) }
})
</script>

<style scoped>
.page-banner {
  height: 120px;
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  position: relative;
  overflow: hidden;
  margin-bottom: var(--space-4);
}

.page-banner--green  { background: var(--gradient-green); }
.page-banner--orange { background: var(--gradient-orange); }
.page-banner--blue   { background: var(--gradient-blue); }
.page-banner--purple { background: var(--gradient-purple); }

.page-banner::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  right: -40px;
  bottom: -60px;
}

.page-banner__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  position: relative;
  z-index: 1;
}

.page-banner__subtitle {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  position: relative;
  z-index: 1;
}

@media screen and (max-width: 1023px) {
  .page-banner {
    height: 80px;
    padding: var(--space-5);
  }
  .page-banner__title { font-size: var(--text-2xl); }
}

@media screen and (max-width: 767px) {
  .page-banner {
    height: 60px;
    padding: var(--space-4);
    margin-bottom: var(--space-2);
  }
  .page-banner__title { font-size: var(--text-xl); }
  .page-banner__subtitle { font-size: var(--text-sm); }
  .page-banner::after { width: 120px; height: 120px; }
}
</style>
