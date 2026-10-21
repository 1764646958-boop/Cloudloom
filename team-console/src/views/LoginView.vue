<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const displayName = ref('')
const inviteCode = ref('')
const inviteRequired = ref(false)
const error = ref('')
const notice = ref('')
const busy = ref(false)

// 切到注册页时问一次：服务端是否配置了邀请码
watch(mode, async (m) => {
  if (m !== 'register') return
  const info = await auth.registerInfo()
  inviteRequired.value = info.invite_required
})

async function submit() {
  error.value = ''; notice.value = ''; busy.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(username.value, password.value)
      router.push({ name: 'chat' })
    } else {
      const r = await auth.register(username.value, password.value, displayName.value || username.value, inviteCode.value)
      if (r.pending) { notice.value = r.message; mode.value = 'login' }
      else { notice.value = r.message; await auth.login(username.value, password.value); router.push({ name: 'chat' }) }
    }
  } catch (e: any) { error.value = e.message }
  finally { busy.value = false }
}
</script>

<template>
  <div class="min-h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow p-8">
      <div class="text-center mb-6">
        <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">CloudLoom</div>
        <div class="text-sm text-gray-500 mt-1">楚华成章 · 团队协作工作台</div>
      </div>
      <div class="flex mb-5 rounded-lg bg-gray-100 dark:bg-gray-700 p-1 text-sm">
        <button class="flex-1 py-1.5 rounded-md" :class="mode==='login' ? 'bg-white dark:bg-gray-600 shadow font-medium' : 'text-gray-500'" @click="mode='login'">登录</button>
        <button class="flex-1 py-1.5 rounded-md" :class="mode==='register' ? 'bg-white dark:bg-gray-600 shadow font-medium' : 'text-gray-500'" @click="mode='register'">注册</button>
      </div>
      <form class="space-y-3" @submit.prevent="submit">
        <input v-model.trim="username" required placeholder="用户名" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        <input v-if="mode==='register'" v-model.trim="displayName" placeholder="显示名（可选）" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        <input v-if="mode==='register' && inviteRequired" v-model.trim="inviteCode" :required="inviteRequired" placeholder="邀请码" autocomplete="off" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        <input v-model="password" required type="password" placeholder="密码" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600" />
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <p v-if="notice" class="text-sm text-green-600">{{ notice }}</p>
        <button :disabled="busy" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-50">
          {{ busy ? '处理中…' : (mode==='login' ? '登录' : '注册') }}
        </button>
      </form>
      <p class="text-xs text-gray-400 mt-4 text-center">公开注册：注册后直接登录；首个账号自动成为管理员</p>
    </div>
  </div>
</template>
