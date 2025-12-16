import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth'
import { Notify } from 'quasar'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' })

// Cargar token al iniciar
const accessToken = localStorage.getItem('access_token')
if (accessToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
}

// Variable para controlar si ya se mostró la notificación de sesión expirada
let sessionExpiredNotified = false

// Interceptor de peticiones para asegurar que siempre se envíe el token más reciente
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de respuesta para manejar 401 y refrescar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore()
    const original = error.config || {}

    // No intentar refresh en login ni en el propio refresh
    const url = original.url || ''
    if (url.includes('/login') || url.includes('/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && auth.refresh_token && !original._retry) {
      try {
        original._retry = true
        const newAccess = await auth.refreshToken()
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newAccess}` }

        // Reset la bandera si el refresh fue exitoso
        sessionExpiredNotified = false

        return api.request(original)
      } catch (refreshError) {
        // El refresh token también expiró o es inválido
        auth.logout()

        // Mostrar notificación solo una vez
        if (!sessionExpiredNotified) {
          sessionExpiredNotified = true
          Notify.create({
            type: 'warning',
            message: 'Tu sesión ha expirado',
            caption: 'Por favor, inicia sesión nuevamente',
            position: 'top',
            timeout: 3000,
          })
        }

        // Redirigir al login después de un pequeño delay
        setTimeout(() => {
          window.location.href = '/#/login'
          sessionExpiredNotified = false // Reset para la próxima sesión
        }, 500)

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
