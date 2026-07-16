<template>
  <button type="button" class="hamburger-btn" aria-label="Toggle menu" @click="toggleClick">
    <svg
      :class="{'is-active': isActive}"
      class="hamburger"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="currentColor"
    >
      <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z" />
    </svg>
  </button>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits()
const toggleClick = () => {
  emit('toggleClick')
}
</script>

<style scoped>
.hamburger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  background: #FFFFFF;
  color: #172554;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .hamburger-btn {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }
}

@media (max-width: 640px) {
  .hamburger-btn {
    width: 34px;
    height: 34px;
  }
}

.hamburger {
  display: block;
  width: 20px;
  height: 20px;
  color: inherit;
}

.hamburger.is-active {
  transform: rotate(180deg);
}
</style>

<style>
/* unscoped so html.dark parent selector works */
html.dark .hamburger-btn,
.dark .hamburger-btn {
  background: #1E293B !important;
  border-color: #334155 !important;
  color: #F8FAFC !important;
  box-shadow: none !important;
}
</style>
