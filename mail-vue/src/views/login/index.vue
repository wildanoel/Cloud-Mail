<template>
  <div id="login-box" v-loading="oauthLoading" element-loading-text="Loading...">
    <!-- playful floating 3D shapes, matching wildanoel.dev -->
    <div class="shapes" aria-hidden="true">
      <img class="shape shape-1" src="/shapes/orange-pyramid.png" alt="" />
      <img class="shape shape-2" src="/shapes/purple-sphere.png" alt="" />
      <img class="shape shape-3" src="/shapes/turquoise-star.png" alt="" />
      <img class="shape shape-4" src="/shapes/lime-object.png" alt="" />
      <img class="shape shape-5" src="/shapes/blue-cylinder.png" alt="" />
      <img class="shape shape-6" src="/shapes/yellow-cube.png" alt="" />
    </div>

    <div class="auth-stage">
      <div class="auth-card">
        <a class="brand-word" href="https://wildanoel.dev">
          <span class="brand-dot"></span>Wildanoel
        </a>

        <div class="form-kicker">{{ mode === 'login' ? 'Welcome back' : 'Create your account' }}</div>
        <span class="form-title">{{ mode === 'login' ? 'Sign in to your mailbox.' : 'Create your mailbox.' }}</span>
        <span class="form-desc" v-if="mode === 'login'">{{ $t('loginTitle') }}</span>
        <span class="form-desc" v-else>{{ $t('regTitle') }}</span>

        <div v-show="mode === 'login'" class="form-body">
          <div class="input-group">
            <Icon class="input-icon" icon="mdi:email-outline" width="18" height="18" />
            <input v-model="form.email" class="custom-input" type="email" :placeholder="$t('emailAccount')" autocomplete="username" />
            <span class="domain-suffix" v-if="settingStore.settings.loginDomain === 0">{{ displaySuffix }}</span>
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
            <span class="domain-suffix">{{ displaySuffix }}</span>
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

        <div class="card-footer">Secured mailbox on wildanoel.dev</div>

      </div>
    </div>

    <el-dialog class="bind-dialog" v-model="bindDialog" title="Bind Email" width="420px">
      <div class="bind-container">
        <div class="input-group">
          <Icon class="input-icon" icon="mdi:email-outline" width="18" height="18" />
          <input v-model="bindForm.email" class="custom-input" type="email" :placeholder="$t('emailAccount')" autocomplete="off" />
          <span class="domain-suffix">{{ displaySuffix }}</span>
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
const bindForm = reactive({ email: '', oauthUserId: '', code: '', bindTicket: '' })

const suffix = ref('')
const domainList = settingStore.domainList
suffix.value = domainList[0]
const displaySuffix = computed(() => suffix.value)

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
      bindForm.bindTicket = res.bindTicket || ''
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
  oauthBindUser({ email: fullEmail, oauthUserId: bindForm.oauthUserId, code: bindForm.code, bindTicket: bindForm.bindTicket }).then(res => {
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
/* ===== Wildanoel Mail login — matches wildanoel.dev: light paper, ink type, orange accent, floating 3D shapes ===== */
#login-box {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
  color: #0a0a0a;
  font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #ffffff;
}

/* floating 3D shapes (same assets as the main site) */
.shapes { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.shape { position: absolute; width: clamp(56px, 9vw, 132px); will-change: transform; filter: drop-shadow(0 18px 32px rgba(0,0,0,0.12)); }
.shape-1 { top: 12%;  left: 10%;  animation: float 6s ease-in-out infinite; }
.shape-2 { top: 20%;  right: 12%; animation: float 7s ease-in-out infinite 0.6s; }
.shape-3 { bottom: 16%; left: 14%; animation: float 6.5s ease-in-out infinite 1.2s; }
.shape-4 { bottom: 12%; right: 15%; animation: float 7.5s ease-in-out infinite 0.3s; }
.shape-5 { top: 48%;  left: 4%;   animation: float 8s ease-in-out infinite 0.9s; }
.shape-6 { top: 52%;  right: 5%;  animation: float 6.8s ease-in-out infinite 1.5s; }
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-18px) rotate(6deg); }
}
@media (max-width: 640px) {
  .shape-5, .shape-6 { display: none; }
  .shape { width: clamp(46px, 14vw, 80px); }
}

/* single centered auth card — light, rounded, soft shadow */
.auth-stage { position: relative; z-index: 1; width: 100%; display: flex; justify-content: center; }
.auth-card {
  width: min(440px, 100%);
  padding: 40px 40px 30px;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid #ededed;
  box-shadow: 0 30px 80px rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.brand-word {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Public Sans', 'Inter', sans-serif;
  font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
  color: #0a0a0a; text-decoration: none; margin-bottom: 28px;
}
.brand-dot { width: 10px; height: 10px; border-radius: 50%; background: #ff5b2e; display: inline-block; }
.form-kicker {
  display: inline-flex; width: fit-content; padding: 5px 12px; border-radius: 999px;
  background: rgba(255,91,46,0.10); border: 1px solid rgba(255,91,46,0.22);
  color: #ff5b2e; font-size: 12px; font-weight: 700; margin-bottom: 14px;
}
.form-title {
  font-family: 'Public Sans', 'Inter', sans-serif; font-weight: 800; font-size: 32px;
  letter-spacing: -0.03em; color: #0a0a0a; margin-bottom: 8px; line-height: 1.08;
}
.form-desc { color: #6b6b6b; font-size: 14px; margin-bottom: 26px; line-height: 1.5; }
.form-body { width: 100%; }
.input-group { position: relative; width: 100%; margin-bottom: 12px; display: flex; align-items: center; }
.input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #9a9a9a; z-index: 2; pointer-events: none; }
.custom-input {
  width: 100%; height: 52px; padding: 0 16px 0 46px; border: 1.5px solid #ededed;
  border-radius: 14px; background: #fafafa; font-size: 15px; font-family: inherit; color: #0a0a0a;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; box-sizing: border-box;
}
.custom-input::placeholder { color: #9a9a9a; }
.custom-input:hover { border-color: #d8d8d8; background: #fff; }
.custom-input:focus { outline: none; border-color: #ff5b2e; background: #fff; box-shadow: 0 0 0 4px rgba(255,91,46,0.14); }
.domain-suffix {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  color: #6b6b6b; font-size: 13px; font-weight: 600; pointer-events: none; background: transparent; padding-left: 8px;
}
.btn {
  width: 100%; height: 52px; border-radius: 999px; font-size: 15px; font-weight: 700;
  background: #0a0a0a; border: none; color: #ffffff; cursor: pointer; margin-top: 14px;
  transition: transform 0.15s ease, filter 0.15s ease; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn:hover:not(:disabled) { transform: scale(0.985); filter: brightness(1.12); }
.btn:active:not(:disabled) { transform: scale(0.97); }
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-secondary { background: #fff; color: #0a0a0a; border: 1.5px solid #ededed; margin-top: 10px; }
.btn-secondary:hover:not(:disabled) { background: #fafafa; border-color: #d8d8d8; filter: none; }
.linuxdo-icon { width: 18px; height: 18px; margin-right: 8px; vertical-align: middle; }
.switch { margin-top: 22px; text-align: center; font-size: 14px; color: #6b6b6b; line-height: 1.5; }
.switch span { color: #ff5b2e; cursor: pointer; font-weight: 700; }
.switch span:hover { text-decoration: underline; }
.card-footer {
  margin-top: 26px; padding-top: 20px; border-top: 1px solid #ededed;
  text-align: center; color: #9a9a9a; font-size: 12px; letter-spacing: 0.02em;
}
.bind-container { display: flex; flex-direction: column; gap: 12px; }
.bind-dialog { border-radius: 20px; }
@media (max-width: 540px) {
  #login-box { padding: 16px; }
  .auth-card { padding: 32px 24px 26px; border-radius: 26px; }
  .form-title { font-size: 27px; }
}
</style>
