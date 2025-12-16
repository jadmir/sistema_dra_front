import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    access_token: localStorage.getItem('access_token') || null,
    refresh_token: localStorage.getItem('refresh_token') || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.access_token,
    fullName: (state) =>
      state.user
        ? `${state.user.nombre || state.user.firstName || ''} ${state.user.apellido || state.user.lastName || ''}`.trim()
        : '',
    roleName: (state) => {
      // Si tiene el objeto rol con nombre, usarlo
      if (state.user?.rol?.nombre) return state.user.rol.nombre

      // Si solo tiene rol_id, mapear a nombre (temporal mientras backend no envía rol completo)
      if (state.user?.rol_id === 1) return 'Administrador'
      if (state.user?.rol_id === 2) return 'Técnico Editor'
      if (state.user?.rol_id === 3) return 'Supervisor'
      if (state.user?.rol_id === 4) return 'Consulta Pública'

      return ''
    },
  },
  actions: {
    async login(email, password) {
      try {
        this.loading = true
        this.error = null

        const res = await api.post('/login', { email, password })
        const data = res.data

        this.access_token = data.access_token
        this.refresh_token = data.refresh_token
        this.user = data.usuario

        localStorage.setItem('access_token', this.access_token)
        localStorage.setItem('refresh_token', this.refresh_token)
        localStorage.setItem('user', JSON.stringify(this.user))

        api.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
        return true
      } catch (error) {
        // Mapea el mensaje { error: "Credenciales inválidas" }
        this.error =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          'Credenciales inválidas'
        return false
      } finally {
        this.loading = false
      }
    },

    async refreshToken() {
      if (!this.refresh_token) throw new Error('No hay refresh_token')
      try {
        // usa el api del boot (baseURL + interceptores)
        const { data } = await api.post('/refresh', { refresh: this.refresh_token })
        const newAccess = data?.access || data?.access_token
        if (!newAccess) throw new Error('Respuesta inválida al refrescar token')

        this.access_token = newAccess
        localStorage.setItem('access_token', newAccess)
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
        return newAccess
      } catch (e) {
        // intento alterno si el backend usa 'refresh_token'
        if (e?.response?.status === 400 || e?.response?.status === 401) {
          try {
            const { data } = await api.post('/refresh', { refresh_token: this.refresh_token })
            const newAccess = data?.access || data?.access_token
            if (!newAccess) throw new Error('Respuesta inválida al refrescar token')
            this.access_token = newAccess
            localStorage.setItem('access_token', newAccess)
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
            return newAccess
          } catch {
            this.logout()
            throw new Error('Refresh inválido')
          }
        }
        this.logout()
        throw new Error('Refresh inválido')
      }
    },

    logout() {
      this.user = null
      this.access_token = null
      this.refresh_token = null
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      delete api.defaults.headers.common['Authorization']
    },
  },
})
