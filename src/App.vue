<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import LoginPage from './components/LoginPage.vue'
import AccountCard from './components/AccountCard.vue'
import AddModal from './components/AddModal.vue'
import EditModal from './components/EditModal.vue'
import DeleteModal from './components/DeleteModal.vue'
import AppToast from './components/AppToast.vue'
import { makeCode } from './composables/totp.js'
import { apiCall } from './composables/api.js'

// ── State ──────────────────────────────────────────────
const loggedIn = ref(false)
const spaceKey = ref('')
const accounts = ref([])
const codes = reactive({})
const remain = ref(30)
const editMode = ref(false)

// ── Modal state ────────────────────────────────────────
const showAdd = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)

// ── Toast ──────────────────────────────────────────────
const toastMsg = ref('')
const toastVisible = ref(false)
let toastTimer = null

function showToast(msg) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMsg.value = msg
  toastVisible.value = true
  toastTimer = setTimeout(() => (toastVisible.value = false), 1800)
}

// ── TOTP tick ──────────────────────────────────────────
let tickTimer = null
let lastCounter = 0

function startTick() {
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = setInterval(tick, 250)
}

async function tick() {
  const now = Date.now()
  const counter = Math.floor(now / 30000)
  remain.value = 30 - (Math.floor(now / 1000) % 30)

  if (counter !== lastCounter) {
    lastCounter = counter
    await refreshCodes()
  }
}

async function refreshCodes() {
  for (const acc of accounts.value) {
    try {
      codes[acc.id] = await makeCode(acc.secret)
    } catch {
      codes[acc.id] = 'ERR'
    }
  }
}

// ── Auth ───────────────────────────────────────────────
async function handleLogin(key) {
  try {
    const data = await apiCall('/api/check', { space_key: key })
    if (data.exists) {
      spaceKey.value = key
      localStorage.setItem('space_key', key)
      await enterApp()
      return { ok: true }
    }
    return { ok: false, error: '同步码不存在', notFound: true }
  } catch {
    return { ok: false, error: '连接失败' }
  }
}

async function handleCreate(key) {
  try {
    const data = await apiCall('/api/create', { space_key: key })
    if (data.ok) return { ok: true }
    return { ok: false, error: '同步空间已存在' }
  } catch {
    return { ok: false, error: '连接失败' }
  }
}

async function enterApp() {
  loggedIn.value = true
  await loadAccounts()
  startTick()
}

async function loadAccounts() {
  try {
    accounts.value = await apiCall('/api/list', { space_key: spaceKey.value })
    lastCounter = 0
    await refreshCodes()
  } catch {
    accounts.value = []
  }
}

function logout() {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
  localStorage.removeItem('space_key')
  spaceKey.value = ''
  accounts.value = []
  loggedIn.value = false
  editMode.value = false
}

// ── Account actions ────────────────────────────────────
async function handleAdd({ name, secret }) {
  try {
    const data = await apiCall('/api/add', {
      space_key: spaceKey.value,
      account_name: name,
      secret,
    })
    if (data.ok) {
      showAdd.value = false
      await loadAccounts()
      return { ok: true }
    }
    return { ok: false, error: data.message || '保存失败' }
  } catch {
    return { ok: false, error: '连接失败' }
  }
}

async function handleEdit(name) {
  try {
    const data = await apiCall('/api/update-name', {
      space_key: spaceKey.value,
      id: editTarget.value.id,
      account_name: name,
    })
    if (data.ok) {
      showEdit.value = false
      await loadAccounts()
      return { ok: true }
    }
    return { ok: false, error: data.message || '保存失败' }
  } catch {
    return { ok: false, error: '连接失败' }
  }
}

async function handleDelete(key) {
  if (key !== spaceKey.value) return { ok: false, error: '同步码错误' }
  try {
    const data = await apiCall('/api/delete', {
      space_key: spaceKey.value,
      id: deleteTarget.value.id,
    })
    if (data.ok) {
      showDelete.value = false
      await loadAccounts()
      return { ok: true }
    }
    return { ok: false, error: data.message || '删除失败' }
  } catch {
    return { ok: false, error: '连接失败' }
  }
}

function openEdit(account) {
  editTarget.value = account
  showEdit.value = true
}

function openDelete(account) {
  deleteTarget.value = account
  showDelete.value = true
}

async function copyCode(id) {
  const code = codes[id]
  if (!code || code === 'ERR') return
  try {
    await navigator.clipboard.writeText(code)
    showToast(code.slice(0, 3) + ' ' + code.slice(3) + ' 已复制')
  } catch {
    showToast('复制失败，请手动复制')
  }
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(async () => {
  const saved = localStorage.getItem('space_key')
  if (saved) {
    const result = await handleLogin(saved)
    if (!result.ok && result.notFound) localStorage.removeItem('space_key')
  }
})

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white">

    <!-- ── Login ── -->
    <LoginPage
      v-if="!loggedIn"
      :handle-login="handleLogin"
      :handle-create="handleCreate"
    />

    <!-- ── App ── -->
    <template v-else>

      <!-- ══ HERO: sticky 大圆弧倒计时，无传统导航栏 ══ -->
      <div class="sticky top-0 z-20 bg-indigo-600 dark:bg-indigo-700 overflow-hidden">
        <!-- 背景装饰圆 -->
        <div class="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/5"/>
        <div class="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5"/>

        <!-- 顶部工具栏（极简） -->
        <div class="relative max-w-lg mx-auto px-5 pt-4 flex items-center justify-between">
          <span class="text-white/50 text-xs font-semibold tracking-widest uppercase">{{ accounts.length }} 个账号</span>
          <div class="flex items-center gap-1">
            <button
              @click="showAdd = true"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button
              @click="logout"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 大圆弧倒计时 -->
        <div class="relative max-w-lg mx-auto flex flex-col items-center pb-6 pt-2">
          <div class="relative w-32 h-32">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <!-- 轨道 -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"/>
              <!-- 进度弧 -->
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke-width="6"
                stroke-linecap="round"
                :stroke="remain <= 5 ? '#fca5a5' : remain <= 10 ? '#fdba74' : 'white'"
                :stroke-dasharray="314.16"
                :stroke-dashoffset="314.16 * (1 - remain / 30)"
                style="transition: stroke-dashoffset 0.25s linear, stroke 0.3s"
              />
            </svg>
            <!-- 中央数字 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span
                class="text-5xl font-black text-white tabular-nums leading-none transition-colors duration-300"
                :class="remain <= 5 ? 'text-red-300' : remain <= 10 ? 'text-orange-300' : 'text-white'"
              >{{ remain }}</span>
              <span class="text-white/40 text-[9px] font-semibold uppercase tracking-widest mt-0.5">sec</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ══ 账号列表 ══ -->
      <main class="max-w-lg mx-auto pb-24">

        <!-- 空状态 -->
        <div v-if="accounts.length === 0" class="text-center py-20 px-6">
          <div class="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-5">
            <svg class="w-7 h-7 text-slate-300 dark:text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-500 dark:text-white/30 mb-1">还没有账号</p>
          <p class="text-xs text-slate-400 dark:text-white/20">点击右上角 <strong>+</strong> 开始添加</p>
        </div>

        <!-- 列表 -->
        <div v-else class="divide-y divide-slate-100 dark:divide-white/5">
          <AccountCard
            v-for="acc in accounts"
            :key="acc.id"
            :account="acc"
            :code="codes[acc.id] || '------'"
            @copy="copyCode(acc.id)"
            @edit="openEdit(acc)"
            @delete="openDelete(acc)"
          />
        </div>
      </main>

    </template>

    <!-- ── Modals ── -->
    <AddModal    :show="showAdd"    :handle-submit="handleAdd"    @close="showAdd = false" />
    <EditModal   :show="showEdit"   :handle-submit="handleEdit"   :account="editTarget"   @close="showEdit = false" />
    <DeleteModal :show="showDelete" :handle-submit="handleDelete" :account="deleteTarget" @close="showDelete = false" />

    <!-- ── Toast ── -->
    <AppToast :message="toastMsg" :show="toastVisible" />
  </div>
</template>
