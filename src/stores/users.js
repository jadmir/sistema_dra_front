import { defineStore } from 'pinia'
import { userService } from 'src/services/userService'
import { roleService } from 'src/services/roleService'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    roles: [],
    pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
    search: '',
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers(page = 1) {
      if (this.loading) return
      this.loading = true
      this.error = null
      try {
        const data = this.search
          ? await userService.search(this.search, page, this.pagination.rowsPerPage)
          : await userService.getAll(page, this.pagination.rowsPerPage)

        // Normaliza respuesta (Laravel paginator o array simple)
        if (Array.isArray(data)) {
          this.users = data
          this.pagination.rowsNumber = data.length
          this.pagination.page = page
        } else {
          this.users = data.data || []
          this.pagination.rowsNumber = data.total ?? data.meta?.total ?? this.users.length
          this.pagination.page = data.current_page ?? data.meta?.current_page ?? page
          this.pagination.rowsPerPage =
            data.per_page ?? data.meta?.per_page ?? this.pagination.rowsPerPage
        }
      } catch (err) {
        this.error =
          err.response?.data?.error || err.response?.data?.message || 'Error al cargar usuarios'
      } finally {
        this.loading = false
      }
    },

    async fetchRoles() {
      try {
        const response = await roleService.getAll()
        // roleService.getAll() ahora retorna { data: [...], total: ... }
        this.roles = response.data || response || []
      } catch (error) {
        // console.error('Error al cargar roles:', error)
        this.roles = []
      }
    },

    async createUser(user) {
      try {
        await userService.create(user)
        await this.fetchUsers(this.pagination.page)
        return true
      } catch (err) {
        this.error =
          err.response?.data?.error || err.response?.data?.message || 'Error al crear usuario'
        return false
      }
    },

    async updateUser(id, user) {
      try {
        const data = await userService.update(id, user)
        // Si la API devuelve el usuario, actualiza la lista local
        const updated = data?.usuario || data?.user || data
        if (updated && typeof updated === 'object') {
          const idx = this.users.findIndex((u) => u.id === id)
          if (idx !== -1) this.users[idx] = { ...this.users[idx], ...updated }
        } else {
          // Si no devuelve el objeto, recarga la página actual
          await this.fetchUsers(this.pagination.page)
        }
        return true
      } catch (err) {
        this.error =
          (err.response?.data?.errors &&
            Object.values(err.response.data.errors).flat().join(' ')) ||
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error al actualizar usuario'
        return false
      }
    },

    async deleteUser(id) {
      try {
        await userService.delete(id)
        // si eliminaste el último de la página, retrocede una página
        const nextPage =
          this.users.length === 1 && this.pagination.page > 1
            ? this.pagination.page - 1
            : this.pagination.page
        await this.fetchUsers(nextPage)
        return true
      } catch (err) {
        this.error =
          err.response?.data?.error || err.response?.data?.message || 'Error al eliminar usuario'
        return false
      }
    },
  },
})
