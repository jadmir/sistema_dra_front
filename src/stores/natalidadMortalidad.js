// src/stores/natalidad.js
import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useNatalidadStore = defineStore('natalidad', {
  state: () => ({
    registros: [],
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
    // ------------------ OBTENER REGISTROS ------------------
    async fetchRegistros(page = 1) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          per_page: this.pagination.rowsPerPage,
          search: this.search || undefined,
          estado: this.estado,
        }

        const res = await api.get('/api/v1/agri-natalidad-mortalidad', { params })
        this.registros = res.data.data || []
        this.pagination.page = res.data.meta?.current_page ?? page
        this.pagination.rowsNumber = res.data.meta?.total ?? (this.registros.length || 0)
      } catch (err) {
        console.error('fetchRegistros', err)
        this.error = err.response?.data?.message || err.message || 'Error al cargar registros'
        Notify.create({ type: 'negative', message: this.error })
      } finally {
        this.loading = false
      }
    },

    // ------------------ CREAR REGISTRO ------------------
    async createRegistro(payload) {
      this.loading = true
      this.error = null
      try {
        await api.post('/api/v1/agri-natalidad-mortalidad', payload)
        Notify.create({ type: 'positive', message: 'Registro creado correctamente' })
        await this.fetchRegistros(this.pagination.page)
        return true
      } catch (err) {
        console.error('createRegistro', err)
        this.error = err.response?.data?.message || err.message || 'Error al crear registro'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },

    // ------------------ ACTUALIZAR REGISTRO ------------------
    async updateRegistro(id, payload) {
      this.loading = true
      this.error = null
      try {
        await api.put(`/api/v1/agri-natalidad-mortalidad/${id}`, payload)
        Notify.create({ type: 'positive', message: 'Registro actualizado correctamente' })
        await this.fetchRegistros(this.pagination.page)
        return true
      } catch (err) {
        console.error('updateRegistro', err)
        this.error = err.response?.data?.message || err.message || 'Error al actualizar registro'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },

    // ------------------ CAMBIAR ESTADO ------------------
    async deleteRegistro(id, payload = { estado: false }) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/v1/agri-natalidad-mortalidad/${id}`, { data: payload })
        // Si es la última fila de la página y no es la primera, retrocede una página
        if (this.registros.length === 1 && this.pagination.page > 1) {
          this.pagination.page--
        }
        await this.fetchRegistros(this.pagination.page)
        return true
      } catch (err) {
        console.error('deleteRegistro', err)
        this.error = err?.response?.data?.message || err.message || 'Error al actualizar estado'
        return false
      } finally {
        this.loading = false
      }
    },

    // ------------------ EXPORTAR A EXCEL ------------------
    async exportExcel() {
      this.loading = true
      this.error = null
      try {
        const params = {
          search: this.search || undefined,
          estado: this.estado,
        }

        const response = await api.get('/api/v1/exportar-natalidad-mortalidad', {
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
          `natalidad_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`,
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
