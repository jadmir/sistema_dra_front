import { defineStore } from 'pinia'
import { sacaClaseService } from 'src/services/sacaClaseService'

// Normaliza distintas formas de respuesta del backend
function normalize(payload, fallbackPage = 1, fallbackPer = 10) {
  const list =
    Array.isArray(payload) ? payload
    : Array.isArray(payload?.data) ? payload.data
    : Array.isArray(payload?.items) ? payload.items
    : []

  const total = payload?.total ?? payload?.meta?.total ?? list.length
  const current = payload?.current_page ?? payload?.meta?.current_page ?? fallbackPage
  const per = payload?.per_page ?? payload?.meta?.per_page ?? fallbackPer

  return { list, total, current, per }
}

export const useClaseSacaStore = defineStore('sacaClases', {
  state: () => ({
    items: [],
    pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
    search: '',
    loading: false,
    error: null,
  }),
  actions: {
    // Cambia el término y vuelve a página 1
    async setSearch(q) {
      this.search = (q || '').trim()
      await this.fetch(1, this.pagination.rowsPerPage)
    },

    async fetch(page = 1, perPage = this.pagination.rowsPerPage) {
      this.loading = true
      this.error = null
      try {
        // Pasa page y per_page al servicio (ajusta firma si tu service recibe params)
        const data = this.search
          ? await sacaClaseService.search(this.search, page, perPage)
          : await sacaClaseService.getAll(page, perPage)

        const { list, total, current, per } = normalize(data, page, perPage)
        this.items = list
        this.pagination = { page: current, rowsPerPage: per, rowsNumber: total }
      } catch (err) {
        this.error = err?.response?.data?.message || err?.message || 'Error al cargar clases'
      } finally {
        this.loading = false
      }
    },

    async create(item) {
      try {
        await sacaClaseService.create(item)
        await this.fetch(this.pagination.page, this.pagination.rowsPerPage)
        return true
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al crear clase'
        return false
      }
    },

    async update(id, item) {
      try {
        await sacaClaseService.update(id, item)
        await this.fetch(this.pagination.page, this.pagination.rowsPerPage)
        return true
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al actualizar clase'
        return false
      }
    },

    async delete(id) {
      try {
        await sacaClaseService.delete(id)
        await this.fetch(this.pagination.page, this.pagination.rowsPerPage)
        return true
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al eliminar clase'
        return false
      }
    },
  },
})
