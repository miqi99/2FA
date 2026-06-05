<script setup>
import { ref, watch } from 'vue'
import { cleanSecret } from '../composables/totp.js'

const props = defineProps({
  show: Boolean,
  handleSubmit: Function,
})
const emit = defineEmits(['close'])

const name = ref('')
const secret = ref('')
const error = ref('')
const loading = ref(false)

// Reset form when opened
watch(() => props.show, (v) => {
  if (v) {
    name.value = ''
    secret.value = ''
    error.value = ''
    loading.value = false
  }
})

async function submit() {
  if (!name.value.trim() || !secret.value.trim()) {
    error.value = '请填写账号名称和密钥'
    return
  }
  loading.value = true
  error.value = ''
  const result = await props.handleSubmit({
    name: name.value.trim(),
    secret: cleanSecret(secret.value),
  })
  if (!result.ok) error.value = result.error || '保存失败'
  loading.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        @click.self="emit('close')"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        style="padding: max(16px, env(safe-area-inset-top)) 16px 16px"
      >
        <div class="modal-box bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl p-6">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 tracking-tight">添加账号</h2>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">账号名称</label>
              <input
                v-model="name"
                type="text"
                placeholder="例如：Binance"
                @keydown.enter="submit"
                class="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">密钥</label>
              <input
                v-model="secret"
                type="text"
                placeholder="支持纯密钥或 otpauth://"
                @keydown.enter="submit"
                class="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <p v-if="error" class="text-red-500 text-xs mt-3 text-center">{{ error }}</p>

          <div class="grid grid-cols-2 gap-2.5 mt-5">
            <button
              @click="emit('close')"
              class="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              @click="submit"
              :disabled="loading"
              class="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {{ loading ? '保存中…' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
