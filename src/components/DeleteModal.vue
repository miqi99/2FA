<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  account: Object,
  handleSubmit: Function,
})
const emit = defineEmits(['close'])

const confirmKey = ref('')
const error = ref('')
const loading = ref(false)

watch(() => props.show, (v) => {
  if (v) {
    confirmKey.value = ''
    error.value = ''
    loading.value = false
  }
})

async function submit() {
  if (!confirmKey.value.trim()) {
    error.value = '请输入同步码'
    return
  }
  loading.value = true
  error.value = ''
  const result = await props.handleSubmit(confirmKey.value.trim())
  if (!result.ok) error.value = result.error || '删除失败'
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
          <!-- Warning icon -->
          <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>

          <h2 class="text-lg font-bold text-slate-900 dark:text-white text-center mb-1 tracking-tight">确认删除</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm text-center mb-5">
            删除「{{ account?.account_name }}」，此操作不可恢复
          </p>

          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">输入同步码确认</label>
            <input
              v-model="confirmKey"
              type="password"
              placeholder="同步码"
              @keydown.enter="submit"
              class="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-400 dark:focus:border-red-500 transition text-sm"
            />
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
              class="h-11 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {{ loading ? '删除中…' : '删除' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
