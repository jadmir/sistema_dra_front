import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from '../stores/auth'
import { hasPermission } from '../utils/permissions'
import { Notify } from 'quasar'

// Helper para verificar si el token está expirado
function isTokenExpired(token) {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convertir a milisegundos
    return Date.now() >= exp
  } catch {
    return true // Si no se puede decodificar, considerar expirado
  }
}

export default defineBoot(({ router }) => {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    // Verificar si el access token está expirado
    if (auth.access_token && isTokenExpired(auth.access_token)) {
      // Si el refresh token también está expirado, cerrar sesión
      if (!auth.refresh_token || isTokenExpired(auth.refresh_token)) {
        auth.logout()

        if (to.meta?.requiresAuth) {
          Notify.create({
            type: 'warning',
            message: 'Tu sesión ha expirado',
            caption: 'Por favor, inicia sesión nuevamente',
            position: 'top',
            timeout: 3000,
          })
          next('/login')
          return
        }
      }
      // Si el refresh token es válido, el interceptor de axios se encargará
    }

    // Si la ruta requiere autenticación y el usuario no está autenticado
    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
      next('/login')
      return
    }

    // Si es ruta de invitado y el usuario está autenticado
    if (to.meta?.guest && auth.isAuthenticated) {
      next('/')
      return
    }

    // Verificar permisos si la ruta lo requiere
    if (to.meta?.requiresPermission && auth.isAuthenticated) {
      const permission = to.meta.requiresPermission

      if (!hasPermission(auth.user, permission)) {
        Notify.create({
          type: 'negative',
          message: 'No tienes permiso para acceder a esta página',
          position: 'top',
        })
        next(from.path || '/')
        return
      }
    }

    next()
  })
})
