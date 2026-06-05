<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  account: Object,
  code: String,
})
const emit = defineEmits(['copy', 'edit', 'delete'])

const copied = ref(false)

function handleCopy() {
  emit('copy')
  copied.value = true
  setTimeout(() => (copied.value = false), 900)
}

const formattedCode = computed(() => {
  const c = props.code || '------'
  return c.length === 6 ? c.slice(0, 3) + ' ' + c.slice(3) : c
})

function nameToHsl(name, l) {
  let h = 0
  for (let i = 0; i < (name || '').length; i++) {
    h = ((h << 5) - h) + name.charCodeAt(i)
    h |= 0
  }
  return `hsl(${Math.abs(h) % 360}, 65%, ${l}%)`
}

const avatarBg  = computed(() => nameToHsl(props.account?.account_name || '', 50))
const codeColor = computed(() => copied.value ? '#10b981' : nameToHsl(props.account?.account_name || '', 34))
const initials  = computed(() => (props.account?.account_name || '?').slice(0, 2).toUpperCase())
</script>

<template>
  <div
    @click="handleCopy"
    class="flex items-center gap-4 px-5 py-3.5 transition-colors select-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/8"
  >
    <!-- Avatar -->
    <div
      class="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
      :style="{ background: avatarBg }"
    >
      {{ initials }}
    </div>

    <!-- Name + Code -->
    <div class="flex-1 min-w-0">
      <p class="text-[11px] font-semibold uppercase tracking-widest mb-0.5 truncate text-slate-400 dark:text-slate-500">
        {{ account.account_name }}
      </p>
      <p
        class="text-[1.375rem] font-bold font-mono tracking-[0.12em] leading-none transition-colors duration-300"
        :style="{ color: codeColor }"
      >
        {{ formattedCode }}
      </p>
    </div>

    <!-- 常驻按钮 -->
    <div class="flex-shrink-0 flex items-center gap-1.5" @click.stop>
      <button
        @click="emit('edit')"
        class="h-7 px-2.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
      >
        改名
      </button>
      <button
        @click="emit('delete')"
        class="h-7 px-2.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
      >
        删除
      </button>
    </div>
  </div>
</template>
