import { defineStore } from 'pinia'
import { cultivoService } from 'src/services/cultivoService'

export const useCultivoStore = defineStore('cultivo', {
  state: () => ({
    cultivos: [],
    loading: false,
    error: null,
    search: '',
  }),

  actions: {
    async fetchCultivos() {
      this.loading = true
      this.error = null
      try {
        if (this.search) {
          this.cultivos = await cultivoService.search(this.search)
        } else {
          this.cultivos = await cultivoService.getAll()
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar cultivos'
        // console.error('Error fetching cultivos:', error)
      } finally {
        this.loading = false
      }
    },

    async createCultivo(data) {
      try {
        await cultivoService.create(data)
        await this.fetchCultivos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear cultivo'
        return false
      }
    },

    async updateCultivo(id, data) {
      try {
        await cultivoService.update(id, data)
        await this.fetchCultivos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar cultivo'
        return false
      }
    },

    async deleteCultivo(id) {
      try {
        await cultivoService.delete(id)
        await this.fetchCultivos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar cultivo'
        return false
      }
    },

    async downloadPDF(filters) {
      try {
        const blob = await cultivoService.getPDF(filters)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_cultivos_${new Date().getTime()}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al generar PDF'
        return false
      }
    },

    async downloadExcel(filters) {
      try {
        const blob = await cultivoService.getExcel(filters)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_cultivos_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al generar Excel'
        return false
      }
    },
  },
})
