<template>
  <div id="login-box" :style="background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="Loading...">
    <div class="login-shell">
      <section class="brand-panel">
        <div class="brand-badge">
          <Icon icon="mdi:email-fast-outline" width="22" height="22" />
          <span>Cloud Mail</span>
        </div>
        <h1 class="brand-title">Inbox that stays fast, private, and under your control.</h1>
        <p class="brand-copy">
          Serverless email on Cloudflare. Clean UI, zero clutter, ready for teams and personal accounts.
        </p>
        <ul class="brand-points">
          <li><span class="dot"></span>Instant accounts on your domain</li>
          <li><span class="dot"></span>Secure login with modern controls</li>
          <li><span class="dot"></span>Built for speed on the edge</li>
        </ul>
        <div class="brand-footer">your-domain.com</div>
      </section>

      <section class="form-wrapper">
        <div class="form-kicker">{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</div>
        <span class="form-title">{{ settingStore.settings.title }}</span>
        <span class="form-desc" v-if="mode === 'login'">{{ $t('loginTitle') }}</span>
        <span class="form-desc" v-else>{{ $t('regTitle') }}</span>

        <div v-show="mode === 'login'" class="form-body">
          <div class="input-group">
            <Icon class="input-icon" icon="mdi:email-outline" width="18" height="18" />
            <input v-model="form.email" class="custom-input" type="email" :placeholder="$t('emailAccount')" autocomplete="username" />
            <span class="domain-suffix" v-if="settingStore.settings.loginDomain === 0">{{ suffix }}</span>
          </div>
          <div class="input-group">
            <Icon class="input-icon" icon="mdi:lock-outline" width="18" height="18" />
            <input v-model="form.password" class="custom-input" type="password" :placeholder="$t('password')" autocomplete="current-password" />
          </div>
          <button class="btn" type="button" :disabled="loginLoading" @click="doLogin">{{ $t('loginBtn') }}</button>
          <button v-if="settingStore.settings.linuxdoSwitch" class="btn btn-secondary" type="button" @click="linuxDoLogin">
            <img src="/image/linuxdo.webp" alt="" class="linuxdo-icon" />
            LinuxDo
          </button>
        </div>

        <div v-show="mode === 'register'" class="form-body">
          <div class="input-group">
            <Icon class="input-icon" icon="mdi:email-outline" width="18" height="18" />
            <input v-model="registerForm.email" class="custom-input" type="email" :placeholder="$t('emailAccount')" autocomplete="off" />
            <span class="domain-suffix">{{ suffix }}</span>
          </div>
          <div class="input-group">
            <Icon class="input-icon" icon="mdi:lock-outline" width="18" height="18" />
            <input v-model="registerForm.password" class="custom-input" type="password" :placeholder="$t('password')" autocomplete="new-password" />
          </div>
          <div class="input-group">
            <Icon class="input-icon" icon="mdi:lock-check-outline" width="18" height="18" />
            <input v-model="registerForm.confirmPassword" class="custom-input" type="password" :placeholder="$t('confirmPwd')" autocomplete="new-password" />
          </div>
          <div class="input-group" v-if="settingStore.settings.regKey === 0 || settingStore.settings.regKey === 2">
            <Icon class="input-icon" icon="mdi:key-outline" width="18" height="18" />
            <input v-model="registerForm.code" class="custom-input" type="text" :placeholder="settingStore.settings.regKey === 0 ? $t('regKey') : $t('regKeyOptional')" autocomplete="off" />
          </div>
          <button class="btn" type="button" :disabled="registerLoading" @click="doRegister">{{ $t('regBtn') }}</button>
        </div>

        <div v-if="settingStore.settings.register === 0" class="switch">
          <template v-if="mode === 'login'">
            {{ $t('noAccount') }} <span @click="mode = 'register'">{{ $t('regSwitch') }}</span>
          </template>
          <template v-else>
            {{ $t('hasAccount') }} <span @click="mode = 'login'">{{ $t('loginSwitch') }}</span>
          </template>
        </div>

      </section>
    </div>

    <el-dialog class="bind-dialog" v-model="bindDialog" title="Bind Email" width="420px">
      <div class="bind-container">
        <div class="input-group">
          <Icon class="input-icon" icon="mdi:email-outline" width="18" height="18" />
          <input v-model="bindForm.email" class="custom-input" type="email" :placeholder="$t('emailAccount')" autocomplete="off" />
          <span class="domain-suffix">{{ suffix }}</span>
        </div>
        <div class="input-group" v-if="settingStore.settings.regKey === 0 || settingStore.settings.regKey === 2">
          <Icon class="input-icon" icon="mdi:key-outline" width="18" height="18" />
          <input v-model="bindForm.code" class="custom-input" type="text" :placeholder="settingStore.settings.regKey === 0 ? $t('regKey') : $t('regKeyOptional')" autocomplete="off" />
        </div>
        <button class="btn" type="button" :disabled="bindLoading" @click="doBind">Bind</button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import { useSettingStore } from '@/store/setting'
import { useUiStore } from '@/store/ui'
import { useUserStore } from '@/store/user'
import { useAccountStore } from '@/store/account'
import { useI18n } from 'vue-i18n'
import { login as loginApi, register as registerApi } from '@/request/login'
import { oauthLinuxDoLogin, oauthBindUser } from '@/request/ouath'
import { loginUserInfo as getLoginUserInfo } from '@/request/my'
import { permsToRouter } from '@/perm/perm'
import router from '@/router'

const { t } = useI18n()
const settingStore = useSettingStore()
const uiStore = useUiStore()
const userStore = useUserStore()
const accountStore = useAccountStore()
const mode = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const bindLoading = ref(false)
const oauthLoading = ref(false)
const bindDialog = ref(false)

const form = reactive({ email: '', password: '' })
const registerForm = reactive({ email: '', password: '', confirmPassword: '', code: '' })
const bindForm = reactive({ email: '', oauthUserId: '', code: '' })

const suffix = ref('')
const domainList = settingStore.domainList
suffix.value = domainList[0]

const background = computed(() => settingStore.settings.background ? {
  'background-image': `url(${settingStore.settings.background})`,
  'background-repeat': 'no-repeat',
  'background-size': 'cover',
  'background-position': 'center'
} : '')

function linuxDoLogin() {
  const clientId = settingStore.settings.linuxdoClientId
  const redirectUri = encodeURIComponent(settingStore.settings.linuxdoCallbackUrl)
  window.location.href = `https://connect.linux.do/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile+email`
}

onMounted(async () => { await linuxDoGetUser() })

async function linuxDoGetUser() {
  const code = new URLSearchParams(window.location.search).get('code')
  if (code) {
    oauthLoading.value = true
    oauthLinuxDoLogin(code).then(res => {
      bindForm.oauthUserId = res.userInfo.oauthUserId
      if (!res.token) {
        bindDialog.value = true
        oauthLoading.value = false
        ElMessage({ message: 'Please register to bind an email', type: 'warning', duration: 4000, plain: true })
        return
      }
      saveToken(res.token)
    }).catch(() => { oauthLoading.value = false })
    const cleanUrl = window.location.origin + window.location.pathname
    window.history.replaceState({}, '', cleanUrl)
  }
}

function doBind() {
  if (!bindForm.email) { ElMessage({ message: t('emptyEmailMsg'), type: 'error', plain: true }); return }
  if (bindForm.email.length < settingStore.settings.minEmailPrefix) {
    ElMessage({ message: t('minEmailPrefix', { msg: settingStore.settings.minEmailPrefix }), type: 'error', plain: true }); return
  }
  const fullEmail = bindForm.email + suffix.value
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail)) {
    ElMessage({ message: t('notEmailMsg'), type: 'error', plain: true }); return
  }
  if (settingStore.settings.regKey === 0 && !bindForm.code) {
    ElMessage({ message: t('emptyRegKeyMsg'), type: 'error', plain: true }); return
  }
  bindLoading.value = true
  oauthBindUser({ email: fullEmail, oauthUserId: bindForm.oauthUserId, code: bindForm.code }).then(res => {
    saveToken(res.token)
  }).catch(() => { bindLoading.value = false })
}

async function doLogin() {
  if (!form.email) { ElMessage({ message: t('emptyEmailMsg'), type: 'error', plain: true }); return }
  const fullEmail = form.email + (settingStore.settings.loginDomain === 0 ? suffix.value : '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail)) {
    ElMessage({ message: t('notEmailMsg'), type: 'error', plain: true }); return
  }
  if (!form.password) { ElMessage({ message: t('emptyPwdMsg'), type: 'error', plain: true }); return }
  loginLoading.value = true
  loginApi(fullEmail, form.password).then(async data => {
    await saveToken(data.token)
  }).finally(() => { loginLoading.value = false })
}

async function doRegister() {
  if (!registerForm.email) { ElMessage({ message: t('emptyEmailMsg'), type: 'error', plain: true }); return }
  if (registerForm.email.length < settingStore.settings.minEmailPrefix) {
    ElMessage({ message: t('minEmailPrefix', { msg: settingStore.settings.minEmailPrefix }), type: 'error', plain: true }); return
  }
  const fullEmail = registerForm.email + suffix.value
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail)) {
    ElMessage({ message: t('notEmailMsg'), type: 'error', plain: true }); return
  }
  if (!registerForm.password) { ElMessage({ message: t('emptyPwdMsg'), type: 'error', plain: true }); return }
  if (registerForm.password.length < 6) { ElMessage({ message: t('pwdLengthMsg'), type: 'error', plain: true }); return }
  if (registerForm.password !== registerForm.confirmPassword) { ElMessage({ message: t('confirmPwdFailMsg'), type: 'error', plain: true }); return }
  if (settingStore.settings.regKey === 0 && !registerForm.code) {
    ElMessage({ message: t('emptyRegKeyMsg'), type: 'error', plain: true }); return
  }
  registerLoading.value = true
  registerApi({ email: fullEmail, password: registerForm.password, token: '', code: registerForm.code }).then(() => {
    mode.value = 'login'
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.code = ''
    registerLoading.value = false
    ElMessage({ message: t('regSuccessMsg'), type: 'success', plain: true })
  }).catch(() => { registerLoading.value = false })
}

async function saveToken(token) {
  localStorage.setItem('token', token)
  const res = await getLoginUserInfo()
  accountStore.currentAccountId = res.account.accountId
  accountStore.currentAccount = res.account
  userStore.user = res
  const routers = permsToRouter(res.permKeys)
  routers.forEach(r => router.addRoute('layout', r))
  await router.replace({ name: 'layout' })
  oauthLoading.value = false
  bindLoading.value = false
}
</script>

<style scoped>
#login-box {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  color: #0F172A;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(255, 196, 2, 0.18), transparent 55%),
    radial-gradient(900px 500px at 100% 0%, rgba(30, 58, 138, 0.16), transparent 50%),
    linear-gradient(160deg, #EEF2F8 0%, #F8FAFC 45%, #FFFFFF 100%);
}
.login-shell {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.brand-panel {
  position: relative;
  padding: 42px 40px;
  color: #F8FAFC;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 196, 2, 0.18), transparent 40%),
    linear-gradient(160deg, #0B1430 0%, #172554 55%, #1e3a8a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 560px;
}
.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #FFF4C2;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 28px;
}
.brand-title {
  font-family: 'Sora', 'Inter', sans-serif;
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  text-wrap: balance;
}
.brand-copy {
  color: #CBD5E1;
  font-size: 15px;
  line-height: 1.6;
  max-width: 36ch;
  margin-bottom: 28px;
}
.brand-points { display: grid; gap: 12px; margin-bottom: 36px; }
.brand-points li {
  display: flex; align-items: center; gap: 10px;
  color: #E2E8F0; font-size: 14px; font-weight: 500;
}
.brand-points .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #FFC402; box-shadow: 0 0 0 4px rgba(255, 196, 2, 0.15); flex-shrink: 0;
}
.brand-footer {
  margin-top: auto; color: #94A3B8; font-size: 12px;
  letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600;
}
.form-wrapper {
  width: 100%; padding: 42px 40px; background: #FFFFFF;
  display: flex; flex-direction: column; justify-content: center;
}
.form-kicker {
  display: inline-flex; width: fit-content; padding: 6px 12px; border-radius: 999px;
  background: #FFF4C2; color: #172554; font-size: 12px; font-weight: 700; margin-bottom: 14px;
}
.form-title {
  font-family: 'Sora', 'Inter', sans-serif; font-weight: 800; font-size: 28px;
  letter-spacing: -0.03em; color: #0F172A; margin-bottom: 6px; line-height: 1.15;
}
.form-desc { color: #64748B; font-size: 14px; margin-bottom: 28px; line-height: 1.5; }
.form-body { width: 100%; }
.input-group { position: relative; width: 100%; margin-bottom: 12px; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94A3B8; z-index: 2; pointer-events: none; }
.custom-input {
  width: 100%; height: 48px; padding: 0 14px 0 42px; border: 1.5px solid #E2E8F0;
  border-radius: 14px; background: #F8FAFC; font-size: 15px; font-family: inherit; color: #0F172A;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; box-sizing: border-box;
}
.custom-input::placeholder { color: #94A3B8; }
.custom-input:hover { border-color: #CBD5E1; background: #FFFFFF; }
.custom-input:focus { outline: none; border-color: #172554; background: #FFFFFF; box-shadow: 0 0 0 4px rgba(23, 37, 84, 0.08); }
.domain-suffix {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: #64748B; font-size: 13px; font-weight: 600; pointer-events: none; background: transparent; padding-left: 8px;
}
.btn {
  width: 100%; height: 48px; border-radius: 9999px; font-size: 15px; font-weight: 700;
  background: #FFC402; border: none; color: #172554; cursor: pointer; margin-top: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 20px rgba(255, 196, 2, 0.28);
}
.btn:hover:not(:disabled) { background: #FFD233; transform: translateY(-1px); box-shadow: 0 14px 24px rgba(255, 196, 2, 0.34); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.btn-secondary { background: #FFFFFF; color: #172554; border: 1.5px solid #E2E8F0; margin-top: 10px; box-shadow: none; }
.btn-secondary:hover:not(:disabled) { background: #F8FAFC; border-color: #172554; box-shadow: none; }
.linuxdo-icon { width: 18px; height: 18px; margin-right: 8px; vertical-align: middle; }
.switch { margin-top: 22px; text-align: center; font-size: 14px; color: #64748B; line-height: 1.5; }
.switch span { color: #172554; cursor: pointer; font-weight: 700; }
.switch span:hover { text-decoration: underline; }
.bind-container { display: flex; flex-direction: column; gap: 12px; }
.bind-dialog { border-radius: 20px; }
@media (max-width: 900px) {
  .login-shell { grid-template-columns: 1fr; }
  .brand-panel { min-height: auto; padding: 28px 24px 24px; }
  .brand-title { font-size: 26px; }
  .brand-copy, .brand-points { display: none; }
  .form-wrapper { padding: 28px 22px 32px; }
}
@media (max-width: 540px) {
  #login-box { padding: 12px; }
  .login-shell { border-radius: 22px; }
  .form-title { font-size: 24px; }
}
</style>
