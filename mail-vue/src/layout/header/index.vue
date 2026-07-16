<template>
  <div class="header" :class="!hasPerm('email:send') ? 'not-send' : ''">
    <div class="header-left">
      <hanburger @click="changeAside"></hanburger>
      <div class="page-meta">
        <span class="breadcrumb-kicker">Cloud Mail</span>
        <span class="breadcrumb-item">{{ $t(route.meta.title) }}</span>
      </div>
    </div>

    <div v-perm="'email:send'" class="compose-btn" @click="openSend" title="Compose">
      <Icon icon="solar:pen-new-square-bold" width="18" height="18" />
      <span class="compose-label">Compose</span>
    </div>

    <div class="toolbar">
      <div class="tool-cluster">
        <button
          type="button"
          class="tool-btn"
          :title="uiStore.dark ? 'Light mode' : 'Dark mode'"
          @click="openDark($event)"
        >
          <Icon v-if="uiStore.dark" icon="solar:sun-2-bold" width="18" height="18" />
          <Icon v-else icon="solar:moon-stars-bold" width="18" height="18" />
        </button>

        <button
          type="button"
          class="tool-btn lang-btn"
          :title="settingStore.lang === 'en' ? 'Ubah ke Indonesia' : 'Switch to English'"
          @click="changeLang(settingStore.lang === 'en' ? 'id' : 'en')"
        >
          <Icon icon="solar:global-bold" width="16" height="16" />
          <span>{{ settingStore.lang === 'en' ? 'ID' : 'EN' }}</span>
        </button>

        <button type="button" class="tool-btn" title="Notice" @click="openNotice">
          <Icon icon="solar:bell-bing-bold" width="18" height="18" />
        </button>
      </div>

      <AgentToggle />

      <el-dropdown ref="userinfoRef" @visible-change="e => userInfoShow = e" :teleported="false" popper-class="detail-dropdown">
        <button type="button" class="user-chip" @click="userInfoHide">
          <div class="avatar-text">{{ formatName(userStore.user.email) }}</div>
          <div class="user-chip-meta">
            <span class="user-chip-name">{{ userStore.user.name || formatName(userStore.user.email) }}</span>
            <span class="user-chip-role">{{ userStore.user.role?.name || 'user' }}</span>
          </div>
          <Icon class="chevron" icon="solar:alt-arrow-down-bold" width="16" height="16" />
        </button>
        <template #dropdown>
          <div class="user-details">
            <div class="details-avatar">
              {{ formatName(userStore.user.email) }}
            </div>
            <div class="user-name">
              {{ userStore.user.name }}
            </div>
            <div class="detail-email" @click="copyEmail(userStore.user.email)">
              {{ userStore.user.email }}
            </div>
            <div class="detail-user-type">
              <el-tag>{{ userStore.user.role.name }}</el-tag>
            </div>
            <div class="action-info">
              <div>
                <span style="margin-right: 10px">{{ $t('sendCount') }}</span>
                <span style="margin-right: 10px">{{ $t('accountCount') }}</span>
              </div>
              <div>
                <div>
                  <span v-if="sendCount" style="margin-right: 5px">{{ sendCount }}</span>
                  <el-tag v-if="!hasPerm('email:send')">{{ sendType }}</el-tag>
                  <el-tag v-else>{{ sendType }}</el-tag>
                </div>
                <div>
                  <el-tag v-if="settingStore.settings.manyEmail || settingStore.settings.addEmail">
                    {{ $t('disabled') }}
                  </el-tag>
                  <span v-else-if="accountCount && hasPerm('account:add')"
                        style="margin-right: 5px">{{ $t('totalUserAccount', {msg: accountCount}) }}</span>
                  <el-tag v-else-if="!accountCount && hasPerm('account:add')">{{ $t('unlimited') }}</el-tag>
                  <el-tag v-else-if="!hasPerm('account:add')">{{ $t('unauthorized') }}</el-tag>
                </div>
              </div>
            </div>
            <div class="logout">
              <el-button type="primary" :loading="logoutLoading" @click="clickLogout">{{ $t('logOut') }}</el-button>
            </div>
          </div>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import hanburger from '@/components/hamburger/index.vue'
import AgentToggle from '@/components/agent/AgentToggle.vue'
import {logout} from "@/request/login.js";
import {Icon} from "@iconify/vue";
import {useUiStore} from "@/store/ui.js";
import {useUserStore} from "@/store/user.js";
import {useRoute} from "vue-router";
import {computed, ref} from "vue";
import {useSettingStore} from "@/store/setting.js";
import {hasPerm} from "@/perm/perm.js"
import {useI18n} from "vue-i18n";
import {setExtend} from "@/utils/day.js"

const {t} = useI18n();
const route = useRoute();
const settingStore = useSettingStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const logoutLoading = ref(false)
const userInfoShow = ref(false)
const userinfoRef = ref({})

const accountCount = computed(() => {
  return userStore.user.role.accountCount
})

const sendType = computed(() => {

  if (settingStore.settings.send === 1) {
    return t('disabled')
  }

  if (!hasPerm('email:send')) {
    return t('unauthorized')
  }

  if (userStore.user.role.sendType === 'ban') {
    return t('sendBanned')
  }

  if (userStore.user.role.sendType === 'internal') {
    return t('sendInternal')
  }

  if (!userStore.user.role.sendCount) {
    return t('unlimited')
  }

  if (userStore.user.role.sendType === 'day') {
    return t('daily')
  }

  if (userStore.user.role.sendType === 'count') {
    return t('total')
  }
})

const sendCount = computed(() => {


  if (!hasPerm('email:send')) {
    return null
  }

  if (userStore.user.role.sendType === 'ban') {
    return null
  }

  if (userStore.user.role.sendType === 'internal') {
    return null
  }

  if (!userStore.user.role.sendCount) {
    return null
  }

  if (settingStore.settings.send === 1) {
    return null
  }

  return userStore.user.sendCount + '/' + userStore.user.role.sendCount
})

function userInfoHide(e) {
    if (userInfoShow.value) {
        userinfoRef.value.handleClose()
    } else {
        userinfoRef.value.handleOpen()
    }
}

async function copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    ElMessage({
      message: t('copySuccessMsg'),
      type: 'success',
      plain: true,
    })
  } catch (err) {
    console.error(`${t('copyFailMsg')}:`, err);
    ElMessage({
      message: t('copyFailMsg'),
      type: 'error',
      plain: true,
    })
  }
}

function changeLang(lang) {
  // Force English dayjs locale always (no Chinese)
  setExtend('en')
  settingStore.lang = (lang === 'id') ? 'id' : 'en'
}

function openNotice() {
  uiStore.showNotice()
}

function openDark(e) {

  const nextIsDark = !uiStore.dark
  const root = document.documentElement

  if (!document.startViewTransition) {
    switchDark(nextIsDark, root);
    return
  }

  const x = e.clientX
  const y = e.clientY

  const maxX = Math.max(x, window.innerWidth - x)
  const maxY = Math.max(y, window.innerHeight - y)
  const endRadius = Math.hypot(maxX, maxY)

  root.setAttribute('data-theme-to', nextIsDark ? 'dark' : 'light')
  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)
  root.style.setProperty('--vt-end-radius', `${endRadius + 10}px`)

  const transition = document.startViewTransition(() => {
    switchDark(nextIsDark, root);
  })

  transition.finished.finally(() => {
    root.removeAttribute('data-theme-to')
  })
}

function switchDark(nextIsDark, root) {
  root.setAttribute('class', nextIsDark ? 'dark' : '')
  const metaTag = document.getElementById('theme-color-meta');
  const isMobile =  !window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  metaTag.setAttribute('content', nextIsDark ? (isMobile ? '#141414' : '#000000') : (isMobile ? '#FFFFFF' : '#F1F1F1'));
  uiStore.dark = nextIsDark
}

function openSend() {
  uiStore.writerRef.open()
}

function changeAside() {
  uiStore.asideShow = !uiStore.asideShow
}

function clickLogout() {
  logoutLoading.value = true
  logout().then(() => {
    localStorage.removeItem("token")
    router.replace('/login')
  }).finally(() => {
    logoutLoading.value = false
  })
}

function formatName(email) {
  return email?.[0]?.toUpperCase() || ''
}

</script>
<style>
.detail-dropdown {
  color: var(--el-text-color-primary) !important;
}
</style>
<style lang="scss" scoped>

:deep(.el-popper.is-pure) {
  border-radius: 14px;
}

.user-details {
  width: 250px;
  font-size: 14px;
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;

  .user-name {
    font-weight: bold;
    margin-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
    width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
  }

  .detail-user-type {
    margin-top: 10px;
  }

  .action-info {
    width: 100%;
    display: grid;
    grid-template-columns: auto auto;
    margin-top: 10px;

    > div:first-child {
      display: grid;
      align-items: center;
      gap: 10px;
    }

    > div:last-child {
      display: grid;
      gap: 10px;
      text-align: center;

      > div {
        display: flex;
        align-items: center;
      }
    }
  }

  .detail-email {
    padding-left: 20px;
    padding-right: 20px;
    width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    color: var(--regular-text-color);
    cursor: pointer;
  }

  .logout {
    margin-top: 20px;
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;

    .el-button {
      border-radius: 10px;
      height: 32px;
      width: 100%;
    }
  }

  .details-avatar {
    margin-top: 20px;
    height: 42px;
    width: 42px;
    background: #172554;
    color: #FFC402;
    border: none;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }
}

.header {
  display: grid;
  height: 100%;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 0 14px;
  align-items: center;
}

.header.not-send {
  grid-template-columns: minmax(0, 1fr) auto;
}

.header-left {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
  z-index: 2;
}

.page-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
  gap: 2px;
}

.breadcrumb-kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94A3B8;
}

.breadcrumb-item {
  font-family: 'Sora', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.02em;
  color: #0F172A;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.compose-btn {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  color: #172554;
  background: #FFC402;
  box-shadow: 0 8px 18px rgba(255, 196, 2, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
}

.compose-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(255, 196, 2, 0.36);
}

.compose-label {
  display: inline;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tool-cluster {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 14px;
  background: #172554;
  border: 1px solid rgba(23, 37, 84, 0.9);
  box-shadow: 0 6px 16px rgba(23, 37, 84, 0.22);
}

.tool-btn {
  appearance: none;
  border: none;
  background: transparent;
  color: #E2E8F0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.tool-btn:hover {
  background: rgba(255, 196, 2, 0.18);
  color: #FFC402;
  transform: translateY(-1px);
}

.lang-btn {
  width: auto;
  min-width: 52px;
  gap: 4px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: #FFC402;
}

.user-chip {
  appearance: none;
  border: 1px solid rgba(23, 37, 84, 0.12);
  background: #FFFFFF;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 4px 10px 4px 4px;
  border-radius: 14px;
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  max-width: 220px;
}

.user-chip:hover {
  border-color: rgba(23, 37, 84, 0.22);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.avatar-text {
  background: #172554;
  color: #FFC402;
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-chip-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  line-height: 1.15;
}

.user-chip-name {
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  max-width: 110px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-chip-role {
  font-size: 10px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.chevron {
  color: #94A3B8;
  flex-shrink: 0;
}

.el-tooltip__trigger:first-child:focus-visible {
  outline: unset;
}

@media (max-width: 900px) {
  .header {
    gap: 8px;
    padding: 0 10px;
  }

  .header-left {
    gap: 8px;
    min-width: 0;
  }

  .toolbar {
    gap: 6px;
  }

  .compose-label {
    display: none;
  }

  .compose-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 11px;
    box-shadow: 0 4px 12px rgba(255, 196, 2, 0.24);
  }

  .tool-cluster {
    gap: 2px;
    padding: 2px;
    border-radius: 12px;
  }

  .tool-btn {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .lang-btn {
    min-width: 44px;
    padding: 0 8px;
    font-size: 11px;
  }

  .user-chip-meta {
    display: none;
  }

  .user-chip {
    width: 36px;
    height: 36px;
    padding: 2px;
    justify-content: center;
    border-radius: 11px;
  }

  .avatar-text {
    width: 30px;
    height: 30px;
    border-radius: 9px;
  }

  .chevron {
    display: none;
  }
}

@media (max-width: 640px) {
  .header {
    gap: 6px;
    padding: 0 8px;
  }

  .header-left {
    gap: 6px;
  }

  .toolbar {
    gap: 5px;
  }

  .page-meta {
    max-width: 42vw;
  }

  .breadcrumb-kicker {
    display: none;
  }

  .breadcrumb-item {
    font-size: 14px;
  }

  .tool-cluster {
    gap: 1px;
    padding: 2px;
  }

  .tool-btn {
    width: 30px;
    height: 30px;
  }

  .lang-btn {
    min-width: 40px;
    padding: 0 6px;
  }

  .compose-btn,
  .user-chip {
    width: 34px;
    height: 34px;
  }
}

@media (max-width: 420px) {
  .page-meta {
    max-width: 34vw;
  }

  .breadcrumb-item {
    font-size: 13px;
  }

  .tool-cluster {
    box-shadow: none;
  }
}
</style>

<style>
html.dark .breadcrumb-item,
.dark .breadcrumb-item {
  color: #F8FAFC !important;
}

html.dark .breadcrumb-kicker,
.dark .breadcrumb-kicker {
  color: #94A3B8 !important;
}

html.dark .tool-cluster,
.dark .tool-cluster {
  background: #0B1430 !important;
  border-color: rgba(255, 196, 2, 0.28) !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35) !important;
}

html.dark .tool-btn,
.dark .tool-btn {
  color: #E2E8F0 !important;
}

html.dark .tool-btn:hover,
.dark .tool-btn:hover {
  background: rgba(255, 196, 2, 0.16) !important;
  color: #FFC402 !important;
}

html.dark .lang-btn,
.dark .lang-btn {
  color: #FFC402 !important;
}

html.dark .user-chip,
.dark .user-chip {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

html.dark .user-chip-name,
.dark .user-chip-name {
  color: #F8FAFC !important;
}

html.dark .user-chip-role,
.dark .user-chip-role {
  color: #94A3B8 !important;
}
</style>
