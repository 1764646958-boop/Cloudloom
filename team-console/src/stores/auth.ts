import { defineStore } from 'pinia'
import { api } from '../api'

export interface User {
  id: string; username: string; display_name: string
  role: 'admin' | 'member'; status: string; avatar: string | null; notify_enabled: boolean
}

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User | null, loaded: false }),
  actions: {
    async fetchMe() {
      try { this.user = (await api<{ user: User }>('/me')).user }
      catch { this.user = null }
      finally { this.loaded = true }
    },
    async login(username: string, password: string) {
      const r = await api<{ user: User }>('/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      this.user = r.user
    },
    async register(username: string, password: string, displayName: string, inviteCode = '') {
      return api<{ pending?: boolean; message: string }>('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, display_name: displayName, invite_code: inviteCode }),
      })
    },
    // 注册页公开信息：是否需要邀请码（服务端未配置则不显示输入框）
    async registerInfo() {
      try { return await api<{ invite_required: boolean; mode: string }>('/register-info') }
      catch { return { invite_required: false, mode: 'open' } }
    },
    async logout() { await api('/logout', { method: 'POST' }); this.user = null },
  },
})
