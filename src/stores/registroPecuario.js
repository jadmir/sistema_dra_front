// src/stores/registroPecuario.js
import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useRegistroPecuarioStore = defineStore('registroPecuario', {
  state: () => ({
    registros: [],
    current: null,
    search: '',
    loading: false,
    error: null,
    pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
  }),

  actions: {
    async fetchRegistros(page = 1) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          per_page: this.pagination.rowsPerPage,
          search: this.search || undefined,
        }
        const res = await api.get('/api/v1/agri-registros-pecuarios', { params })
        this.registros = res.data.data || []
        this.pagination.page = res.data.current_page ?? page
        this.pagination.rowsNumber = res.data.total ?? (this.registros.length || 0)
      } catch (err) {
        console.error('fetchRegistros', err)
        this.error = err?.response?.data?.message || err.message || 'Error al cargar registros'
        Notify.create({ type: 'negative', message: this.error })
      } finally {
        this.loading = false
      }
    },

    async fetchRegistro(id) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get(`/api/v1/agri-registros-pecuarios/${id}`)
        this.current = {
          ...res.data.data,
          editable: res.data.editable,
        }
        return this.current
      } catch (err) {
        console.error('fetchRegistro', err)
        this.error = err?.response?.data?.message || err.message || 'Error al obtener registro'
        Notify.create({ type: 'negative', message: this.error })
        return null
      } finally {
        this.loading = false
      }
    },

    async createRegistro(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/api/v1/agri-registros-pecuarios', payload)
        Notify.create({ type: 'positive', message: 'Registro creado correctamente' })
        // backend returns registro_pecuario_id
        return res.data.registro_pecuario_id ?? true
      } catch (err) {
        console.error('createRegistro', err)
        this.error =
          err?.response?.data?.detalles ||
          err?.response?.data?.message ||
          err.message ||
          'Error creando registro'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },

    async updateRegistro(id, payload) {
      this.loading = true
      this.error = null
      try {
        await api.put(`/api/v1/agri-registros-pecuarios/${id}`, payload)
        Notify.create({ type: 'positive', message: 'Registro actualizado correctamente' })
        return true
      } catch (err) {
        console.error('updateRegistro', err)
        this.error =
          err?.response?.data?.detalles ||
          err?.response?.data?.message ||
          err.message ||
          'Error actualizando registro'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },

    async exportPdf(id) {
      this.loading = true
      this.error = null
      try {
        // route provided: /v1/reportes/registro-pecuario/pdf/{id}
        const response = await api.get(`/api/v1/reportes/registro-pecuario/pdf/${id}`, {
          responseType: 'blob',
        })
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        window.URL.revokeObjectURL(url)
        return true
      } catch (err) {
        console.error('exportPdf', err)
        this.error = err?.response?.data?.message || err.message || 'Error exportando PDF'
        Notify.create({ type: 'negative', message: this.error })
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
