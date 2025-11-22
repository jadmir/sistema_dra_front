import { defineStore } from 'pinia'
import { subgrupoService } from 'src/services/subgrupoService'

export const useSubgrupoStore = defineStore('subgrupo', {
  state: () => ({
    subgrupos: [],
    loading: false,
    error: null,
    search: '',
  }),

  actions: {
    async fetchSubgrupos() {
      this.loading = true
      this.error = null
      try {
        if (this.search) {
          this.subgrupos = await subgrupoService.search(this.search)
        } else {
          this.subgrupos = await subgrupoService.getAll()
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar subgrupos'
        console.error('Error fetching subgrupos:', error)
      } finally {
        this.loading = false
      }
    },

    async createSubgrupo(data) {
      try {
        await subgrupoService.create(data)
        await this.fetchSubgrupos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear subgrupo'
        return false
      }
    },

    async updateSubgrupo(id, data) {
      try {
        await subgrupoService.update(id, data)
        await this.fetchSubgrupos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar subgrupo'
        return false
      }
    },

    async deleteSubgrupo(id) {
      try {
        await subgrupoService.delete(id)
        await this.fetchSubgrupos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar subgrupo'
        return false
      }
    },
  },
})
