<template>
  <el-scrollbar class="scroll">
    <div class="sidebar-inner">
      <div class="title">
        <div class="title-mark">
          <Icon icon="solar:letter-bold" width="18" height="18" />
        </div>
        <div class="title-text">{{settingStore.settings.title}}</div>
      </div>
      <el-menu :collapse="false" text-color="#CBD5E1" active-text-color="#ff5b2e" background-color="transparent" style="margin-top: 10px; border-right: none;">
        <el-menu-item @click="router.push({name: 'email'})" index="email" :class="route.meta.name === 'email' ? 'choose-item' : ''">
          <Icon icon="solar:inbox-bold" width="20" height="20" />
          <span class="menu-name">{{$t('inbox')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'send'})" index="send" v-perm="'email:send'" :class="route.meta.name === 'send' ? 'choose-item' : ''">
          <Icon icon="solar:plain-2-bold" width="20" height="20" />
          <span class="menu-name">{{$t('sent')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'draft'})" index="draft" v-perm="'email:send'" :class="route.meta.name === 'draft' ? 'choose-item' : ''">
          <Icon icon="solar:document-text-bold" width="20" height="20" />
          <span class="menu-name">{{$t('drafts')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'star'})" index="star" :class="route.meta.name === 'star' ? 'choose-item' : ''">
          <Icon icon="solar:star-bold" width="20" height="20" />
          <span class="menu-name">{{$t('starred')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'setting'})" index="setting" :class="route.meta.name === 'setting' ? 'choose-item' : ''">
          <Icon icon="solar:settings-bold" width="20" height="20" />
          <span class="menu-name">{{$t('settings')}}</span>
        </el-menu-item>
        <div class="manage-title" v-perm="['all-email:query','user:query','role:query','setting:query','analysis:query','reg-key:query']">
          <div>{{$t('manage')}}</div>
        </div>
        <el-menu-item @click="router.push({name: 'analysis'})" index="analysis" v-perm="'analysis:query'" :class="route.meta.name === 'analysis' ? 'choose-item' : ''">
          <Icon icon="solar:chart-2-bold" width="20" height="20" />
          <span class="menu-name">{{$t('analytics')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'user'})" index="user" v-perm="'user:query'" :class="route.meta.name === 'user' ? 'choose-item' : ''">
          <Icon icon="solar:users-group-rounded-bold" width="20" height="20" />
          <span class="menu-name">{{$t('allUsers')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'all-email'})" index="all-email" v-perm="'all-email:query'" :class="route.meta.name === 'all-email' ? 'choose-item' : ''">
          <Icon icon="solar:mailbox-bold" width="20" height="20" />
          <span class="menu-name">{{$t('allMail')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'role'})" index="role" v-perm="'role:query'" :class="route.meta.name === 'role' ? 'choose-item' : ''">
          <Icon icon="solar:shield-keyhole-bold" width="20" height="20" />
          <span class="menu-name">{{$t('permissions')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'reg-key'})" index="reg-key" v-perm="'reg-key:query'" :class="route.meta.name === 'reg-key' ? 'choose-item' : ''">
          <Icon icon="solar:key-bold" width="20" height="20" />
          <span class="menu-name">{{$t('inviteCode')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'sys-setting'})" index="sys-setting" v-perm="'setting:query'" :class="route.meta.name === 'sys-setting' ? 'choose-item' : ''">
          <Icon icon="solar:server-bold" width="20" height="20" />
          <span class="menu-name">{{$t('SystemSettings')}}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";

const settingStore = useSettingStore();
const route = useRoute();
</script>

<style lang="scss" scoped>
.sidebar-inner { background: transparent; padding: 12px 10px 20px; min-height: 100%; }
.title {
  margin: 8px 6px 18px; min-height: 52px; border-radius: 16px; display: flex; position: relative;
  font-family: 'Sora', 'Inter', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: -0.02em;
  align-items: center; gap: 10px; color: #F8FAFC;
  background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  border: 1px solid rgba(255, 255, 255, 0.08); padding: 10px 12px;
}
.title-mark {
  width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  background: #ff5b2e; color: #0a0a0a; flex-shrink: 0;
}
.title-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
:deep(.el-menu) { background: transparent !important; border-right: none !important; }
:deep(.el-menu-item) {
  height: 44px; line-height: 44px; margin: 3px 0; padding: 0 14px !important; border-radius: 12px;
  color: #CBD5E1 !important; font-size: 14px; font-weight: 500; background: transparent !important;
  transition: background 0.15s ease, color 0.15s ease;
  display: flex; align-items: center; gap: 12px;
}
:deep(.el-menu-item:hover) { background: rgba(255, 255, 255, 0.06) !important; color: #F8FAFC !important; }
:deep(.el-menu-item.is-active) { background: rgba(255, 91, 46, 0.14) !important; color: #ff5b2e !important; }
:deep(.el-menu-item .menu-name) { color: inherit !important; margin-left: 0 !important; }
:deep(.el-menu-item .iconify) { color: #94A3B8; transition: color 0.15s ease; flex-shrink: 0; }
:deep(.el-menu-item:hover .iconify),
:deep(.el-menu-item.is-active .iconify) { color: #ff5b2e; }
.choose-item { background: rgba(255, 91, 46, 0.14) !important; color: #ff5b2e !important; font-weight: 600; }
.choose-item :deep(.iconify) { color: #ff5b2e !important; }
.manage-title {
  margin: 18px 8px 8px; padding: 0 12px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; color: #64748B;
}
.scroll {
  background: #0a0a0a !important;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  height: 100%;
  min-height: 100%;
  width: 100%;
}
:deep(.el-scrollbar__wrap),
:deep(.el-scrollbar__view) {
  background: #0a0a0a !important;
  min-height: 100%;
}
:deep(.el-menu-item.is-active),
:deep(.el-menu-item.choose-item) {
  background: rgba(255, 91, 46, 0.14) !important;
  color: #ff5b2e !important;
}
</style>
