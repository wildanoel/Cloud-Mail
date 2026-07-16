<template>
  <el-config-provider :locale="settingStore.lang === 'id' ? idLocale : enLocale">
    <router-view />
  </el-config-provider>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { watch } from "vue";
import {useSettingStore} from "@/store/setting.js";
const settingStore = useSettingStore()
import idLocale from 'element-plus/es/locale/lang/id';
import enLocale from 'element-plus/es/locale/lang/en';
import('@/icons/index.js')
const { locale } = useI18n()
locale.value = settingStore.lang === 'id' ? 'id' : 'en'
watch(() => settingStore.lang, () => locale.value = settingStore.lang === 'id' ? 'id' : 'en')
</script>
