import { defineStore } from 'pinia'
import { subsectorService } from 'src/services/subsectorService'

export const useSubsectorStore = defineStore('subsector', {
  state: () => ({
    subsectores: [],
    loading: false,
    error: null,
    search: '',
  }),

  actions: {
    async fetchSubsectores() {
      this.loading = true
      this.error = null
      try {
        if (this.search) {
          this.subsectores = await subsectorService.search(this.search)
        } else {
          this.subsectores = await subsectorService.getAll()
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar subsectores'
        // console.error('Error fetching subsectores:', error)
      } finally {
        this.loading = false
      }
    },

    async createSubsector(data) {
      try {
        await subsectorService.create(data)
        await this.fetchSubsectores()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear subsector'
        return false
      }
    },

    async updateSubsector(id, data) {
      try {
        await subsectorService.update(id, data)
        await this.fetchSubsectores()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar subsector'
        return false
      }
    },

    async deleteSubsector(id) {
      try {
        await subsectorService.delete(id)
        await this.fetchSubsectores()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar subsector'
        return false
      }
    },
  },
})
