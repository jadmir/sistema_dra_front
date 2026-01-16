import { defineStore } from 'pinia'
import permisoService from 'src/services/permisoService'

export const usePermisosStore = defineStore('permisos', {
  state: () => ({
    permisos: [],
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
    setSearch(value) {
      this.search = value
    },

    async fetchPermisos(params = {}) {
      this.loading = true
      this.error = null
      try {
        let response

        // Si hay búsqueda, usar endpoint de búsqueda
        if (this.search && this.search.trim()) {
          // console.log('Buscando permisos con:', this.search)
          response = await permisoService.search(this.search, params)
          // console.log('Respuesta de búsqueda:', response)
        } else {
          response = await permisoService.getAll(params)
        }

        this.permisos = response.data || []
        this.pagination.rowsNumber = response.total || this.permisos.length
        this.pagination.page = response.current_page || 1
        this.pagination.rowsPerPage = response.per_page || 10

        // console.log('Permisos cargados:', this.permisos)
        // console.log('Total:', this.pagination.rowsNumber)
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al cargar permisos'
        // console.error('Error fetchPermisos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPermiso(data) {
      const response = await permisoService.create(data)
      await this.fetchPermisos()
      return response
    },

    async updatePermiso(id, data) {
      const response = await permisoService.update(id, data)
      await this.fetchPermisos()
      return response
    },

    async deletePermiso(id) {
      const response = await permisoService.delete(id)
      await this.fetchPermisos()
      return response
    },
  },
})
