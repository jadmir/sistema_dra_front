// src/stores/destino.js
import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useDestinoStore = defineStore('destino', {
  state: () => ({
    destinos: [],
    search: '',
    estado: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    },
  }),

  actions: {
    async fetchDestinos(page = 1) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          per_page: this.pagination.rowsPerPage,
          search: this.search || undefined,
          estado: this.estado,
        }

        const res = await api.get('/api/v1/destinos', { params })
        this.destinos = res.data.data || []
        this.pagination.page = res.data.meta?.current_page ?? page
        this.pagination.rowsNumber = res.data.meta?.total ?? (this.destinos.length || 0)
      } catch (err) {
        console.error('fetchDestinos', err)
        this.error = err.response?.data?.message || err.message || 'Error al cargar destinos'
        Notify.create({ type: 'negative', message: this.error })
      } finally {
        this.loading = false
      }
    },

    async createDestino(payload) {
      this.loading = true
      this.error = null
      try {
        await api.post('/api/v1/destinos', payload)
        Notify.create({ type: 'positive', message: 'Destino creado correctamente' })
        await this.fetchDestinos(this.pagination.page)
        return true
      } catch (err) {
        console.error('createDestino', err)
        this.error = err.response?.data?.message || err.message || 'Error al crear destino'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },

    async updateDestino(id, payload) {
      this.loading = true
      this.error = null
      try {
        await api.put(`/api/v1/destinos/${id}`, payload)
        Notify.create({ type: 'positive', message: 'Destino actualizado correctamente' })
        await this.fetchDestinos(this.pagination.page)
        return true
      } catch (err) {
        console.error('updateDestino', err)
        this.error = err.response?.data?.message || err.message || 'Error al actualizar destino'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },

    // Cambiar estado (activar/desactivar)
    async deleteDestino(id, payload = { estado: false }) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/v1/destinos/${id}`, { data: payload })
        // Si es la última fila de la página y no es la primera, retrocede una página
        if (this.destinos.length === 1 && this.pagination.page > 1) {
          this.pagination.page--
        }
        await this.fetchDestinos(this.pagination.page)
        return true
      } catch (err) {
        console.error('deleteDestino error', err)
        this.error = err?.response?.data?.message || err.message || 'Error al actualizar destino'
        return false
      } finally {
        this.loading = false
      }
    },

    async exportExcel() {
      this.loading = true
      this.error = null
      try {
        const params = {
          search: this.search || undefined,
          estado: this.estado,
        }

        const response = await api.get('/api/v1/exportar-destinos', {
          params,
          responseType: 'blob',
        })

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `destinos_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`,
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        Notify.create({ type: 'positive', message: 'Exportación lista' })
        return true
      } catch (err) {
        console.error('exportExcel', err)
        this.error = err.response?.data?.message || err.message || 'Error exportando Excel'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
