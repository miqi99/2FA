<script setup>
import { ref } from 'vue'

const props = defineProps({
  handleLogin: Function,
  handleCreate: Function,
})

const key = ref('')
const loading = ref(false)
const creating = ref(false)
const error = ref('')
const success = ref('')

const isAdmin = new URLSearchParams(location.search).get('admin') === '1'

async function submitLogin() {
  if (!key.value.trim() || loading.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  const result = await props.handleLogin(key.value.trim())
  if (!result.ok) error.value = result.error
  loading.value = false
}

async function submitCreate() {
  if (!key.value.trim() || creating.value) return
  creating.value = true
  error.value = ''
  success.value = ''
  const result = await props.handleCreate(key.value.trim())
  if (result.ok) success.value = '创建成功，请点击「进入」'
  else error.value = result.error
  creating.value = false
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
    <!-- Background glow -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
      <div class="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl"></div>
    </div>

    <!-- Card -->
    <div class="relative w-full max-w-sm">
      <div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <!-- Icon -->
        <div class="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
          <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <!-- Heading -->
        <h1 class="text-2xl font-bold text-white text-center mb-1.5 tracking-tight">两步验证</h1>
        <p class="text-slate-400 text-sm text-center mb-8">输入同步码进入账号空间</p>

        <!-- Input -->
        <input
          v-model="key"
          type="password"
          placeholder="同步码"
          autocomplete="off"
          @keydown.enter="submitLogin"
          class="w-full h-12 px-4 rounded-2xl bg-white/8 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/80 focus:bg-white/12 transition-all text-base"
        />

        <!-- Login button -->
        <button
          @click="submitLogin"
          :disabled="loading"
          class="w-full h-12 mt-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-base transition-all"
        >
          {{ loading ? '验证中…' : '进入' }}
        </button>

        <!-- Messages -->
        <p v-if="error" class="text-red-400 text-sm text-center mt-3">{{ error }}</p>
        <p v-if="success" class="text-emerald-400 text-sm text-center mt-3">{{ success }}</p>

        <!-- Admin: create space -->
        <button
          v-if="isAdmin"
          @click="submitCreate"
          :disabled="creating"
          class="w-full h-11 mt-3 rounded-2xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 font-medium text-sm transition-all disabled:opacity-40"
        >
          {{ creating ? '创建中…' : '创建同步空间' }}
        </button>
      </div>
    </div>
  </div>
</template>
