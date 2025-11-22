import { defineStore } from 'pinia'
import { roleService } from 'src/services/roleService'

export const useRoleStore = defineStore('roles', {
  state: () => ({
    roles: [],
    loading: false,
    error: null,
    search: '',
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    },
  }),

  actions: {
    setSearch(query) {
      this.search = query
      this.pagination.page = 1
    },

    async fetchRoles(params = {}) {
      this.loading = true
      this.error = null

      try {
        const { page = 1, rowsPerPage = 10 } = params

        let response

        // Si hay búsqueda, usar el endpoint de search
        if (this.search && this.search.trim()) {
          response = await roleService.search(this.search, {
            page,
            per_page: rowsPerPage,
          })
        } else {
          // Si no hay búsqueda, usar el endpoint normal
          response = await roleService.getAll({
            page,
            per_page: rowsPerPage,
          })
        }

        // El servicio ya normaliza la respuesta
        this.roles = response.data || []
        this.pagination.rowsNumber = response.total || 0
        this.pagination.page = response.current_page || page
        this.pagination.rowsPerPage = response.per_page || rowsPerPage
      } catch (err) {
        console.error('Error en fetchRoles:', err)
        this.error = err.response?.data?.message || err.message || 'Error al cargar roles'
        this.roles = []
        this.pagination.rowsNumber = 0
      } finally {
        this.loading = false
      }
    },

    async createRole(roleData) {
      try {
        await roleService.create(roleData)
        await this.fetchRoles({
          page: this.pagination.page,
          rowsPerPage: this.pagination.rowsPerPage,
        })
        return true
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al crear rol'
        return false
      }
    },

    async updateRole(id, data) {
      try {
        await roleService.update(id, data)
        await this.fetchRoles({
          page: this.pagination.page,
          rowsPerPage: this.pagination.rowsPerPage,
        })
        return true
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al actualizar rol'
        return false
      }
    },

    async deleteRole(id) {
      try {
        await roleService.delete(id)
        await this.fetchRoles({
          page: this.pagination.page,
          rowsPerPage: this.pagination.rowsPerPage,
        })
        return true
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al eliminar rol'
        return false
      }
    },
  },
})
