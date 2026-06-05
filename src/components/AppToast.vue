<script setup>
defineProps({
  message: String,
  show: Boolean,
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="show"
        class="fixed bottom-8 left-1/2 z-[100] pointer-events-none
               bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900
               text-sm font-medium px-5 py-2.5 rounded-full shadow-xl
               whitespace-nowrap backdrop-blur-sm"
        style="transform: translateX(-50%)"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>
