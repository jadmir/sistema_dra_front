import { boot } from 'quasar/wrappers'
import { hasPermission, hasAnyPermission } from 'src/utils/permissions'

/**
 * Plugin de permisos para Vue
 * Agrega helpers globales para verificar permisos en componentes
 */
export default boot(({ app }) => {
  // Helper global para verificar permisos
  app.config.globalProperties.$can = function(permission) {
    const authStore = this.$pinia?.state.value.auth
    if (!authStore) return false
    return hasPermission(authStore.user, permission)
  }

  // Helper global para verificar múltiples permisos (OR)
  app.config.globalProperties.$canAny = function(permissions) {
    const authStore = this.$pinia?.state.value.auth
    if (!authStore) return false
    return hasAnyPermission(authStore.user, permissions)
  }

  // Directiva v-can para mostrar/ocultar elementos según permiso
  app.directive('can', {
    mounted(el, binding) {
      const authStore = app.config.globalProperties.$pinia?.state.value.auth
      if (!authStore) {
        el.style.display = 'none'
        return
      }

      const permission = binding.value
      if (!hasPermission(authStore.user, permission)) {
        el.style.display = 'none'
      }
    }
  })

  // Directiva v-can-any para mostrar/ocultar elementos según múltiples permisos
  app.directive('can-any', {
    mounted(el, binding) {
      const authStore = app.config.globalProperties.$pinia?.state.value.auth
      if (!authStore) {
        el.style.display = 'none'
        return
      }

      const permissions = binding.value
      if (!hasAnyPermission(authStore.user, permissions)) {
        el.style.display = 'none'
      }
    }
  })
})
