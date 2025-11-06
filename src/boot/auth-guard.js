import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from '../stores/auth'

export default defineBoot(({ router }) => {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
      next('/login')
    } else if (to.meta?.guest && auth.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  })
})
