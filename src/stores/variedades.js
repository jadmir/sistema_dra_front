import { defineStore } from 'pinia'
import { variedadService } from 'src/services/variedadService'

// Normaliza distintas formas de respuesta del backend
function normaliza(payload, fallbackPage = 1, fallbackPer = 10) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : []

  const total = payload?.total ?? payload?.meta?.total ?? list.length
  const current = payload?.current_page ?? payload?.meta?.current_page ?? fallbackPage
  const per = payload?.per_page ?? payload?.meta?.per_page ?? fallbackPer

  return { list, total, current, per }
}

export const useVariedadStore = defineStore('variedades', {
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
          ? await variedadService.search(this.search, page, perPage)
          : await variedadService.getAll(page, perPage)

        const { list, total, current, per } = normaliza(data, page, perPage)
        this.items = list
        this.pagination = { page: current, rowsPerPage: per, rowsNumber: total }
      } catch (err) {
        this.error = err?.response?.data?.message || err?.message || 'Error al cargar variedades'
      } finally {
        this.loading = false
      }
    },

    async create(item) {
      try {
        await variedadService.create(item)
        await this.fetch(this.pagination.page, this.pagination.rowsPerPage)
        return true
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al crear variedad'
        return false
      }
    },

    async update(id, item) {
      try {
        await variedadService.update(id, item)
        await this.fetch(this.pagination.page, this.pagination.rowsPerPage)
        return true
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al actualizar variedad'
        return false
      }
    },

    async delete(id) {
      try {
        await variedadService.delete(id)
        await this.fetch(this.pagination.page, this.pagination.rowsPerPage)
        return true
      } catch (error) {
        this.error = error?.response?.data?.message || 'Error al eliminar variedad'
        return false
      }
    },
  },
})
