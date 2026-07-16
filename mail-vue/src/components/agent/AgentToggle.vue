<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAgentStore } from '@/store/agent';
import { Icon } from '@iconify/vue';

const store = useAgentStore();
const { t } = useI18n();
const enabled = computed(() => store.settings.agentEnabled);

onMounted(async () => {
  if (!store.hydrated) await store.hydrate();
});

function toggle() {
  store.panelVisible = !store.panelVisible;
}
</script>

<template>
  <button
    class="agent-toggle"
    :class="{ active: store.panelVisible, disabled: !enabled }"
    :title="enabled ? t('aiAgentChatTitle') : t('aiAgentEnable')"
    @click="toggle"
  >
    <Icon icon="solar:magic-stick-3-bold" width="16" height="16" />
    <span class="agent-toggle-label">{{ $t('aiAgentChatTitle') }}</span>
  </button>
</template>

<style scoped>
.agent-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #FFF7D6, #FFE08A);
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-radius: 12px;
  padding: 0 12px;
  min-width: 0;
  height: 38px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #92400E;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}
@media (max-width: 900px) {
  .agent-toggle-label {
    display: none;
  }
  .agent-toggle {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 11px;
  }
}

@media (max-width: 640px) {
  .agent-toggle {
    width: 34px;
    height: 34px;
  }
}
.agent-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.24);
}
.agent-toggle.active {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #FFFFFF;
}
.agent-toggle.disabled {
  background: #F3F4F6;
  border-color: #D1D5DB;
  color: #6B7280;
  box-shadow: none;
}
</style>
