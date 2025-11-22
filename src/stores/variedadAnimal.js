// src/stores/variedadAnimal.js
import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useVariedadAnimalStore = defineStore('variedadAnimal', {
  state: () => ({
    variedades: [],
    loading: false,
    error: null,
    estado: null,
    search: '',
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    },
  }),

  actions: {
    // obtener listado
    async fetchVariedades(page = 1) {
      this.loading = true
      this.error = null

      try {
        const params = {
          page,
          per_page: this.pagination.rowsPerPage,
        }

        if (this.search && this.search.trim() !== '') params.search = this.search.trim()
        if (this.estado !== null) params.estado = this.estado

        const response = await api.get('/api/v1/agri-variedad-animales', { params })

        this.variedades = response.data.data || []
        this.pagination.page = response.data.meta?.current_page ?? page
        this.pagination.rowsNumber = response.data.meta?.total ?? (this.variedades.length || 0)
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al cargar las variedades'
      } finally {
        this.loading = false
      }
    },

    async createVariedad(payload) {
      this.loading = true
      this.error = null
      try {
        await api.post('/api/v1/agri-variedad-animales', payload)
        await this.fetchVariedades(this.pagination.page)
        return true
      } catch (err) {
        console.error('createVariedad error', err)
        this.error = err?.response?.data?.message || err.message || 'Error creando variedad'
        return false
      } finally {
        this.loading = false
      }
    },

    async updateVariedad(id, payload) {
      this.loading = true
      this.error = null
      try {
        await api.put(`/api/v1/agri-variedad-animales/${id}`, payload)
        await this.fetchVariedades(this.pagination.page)
        return true
      } catch (err) {
        console.error('updateVariedad error', err)
        this.error = err?.response?.data?.message || err.message || 'Error actualizando variedad'
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteVariedad(id, payload = { estado: false }) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/v1/agri-variedad-animales/${id}`, { data: payload })
        if (this.variedades.length === 1 && this.pagination.page > 1) {
          this.pagination.page--
        }
        await this.fetchVariedades(this.pagination.page)
        return true
      } catch (err) {
        console.error('deleteVariedad error', err)
        this.error = err?.response?.data?.message || err.message || 'Error al actualizar variedad'
        return false
      } finally {
        this.loading = false
      }
    },

    async exportExcel() {
      this.loading = true
      this.error = null
      try {
        const params = {}
        if (this.search?.trim()) params.search = this.search.trim()
        if (this.estado !== null && this.estado !== undefined) params.estado = this.estado

        const response = await api.get('/api/v1/exportar-variedad-animal', {
          params,
          responseType: 'blob',
        })

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Variedades_Animales_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return true
      } catch (err) {
        console.error('exportExcel error', err)
        this.error = err.response?.data?.message || err.message || 'Error exportando Excel'
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
