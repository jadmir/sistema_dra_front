import { defineStore } from 'pinia'
import { grupoService } from 'src/services/grupoService'

export const useGrupoStore = defineStore('grupo', {
  state: () => ({
    grupos: [],
    loading: false,
    error: null,
    search: '',
  }),

  actions: {
    async fetchGrupos() {
      this.loading = true
      this.error = null
      try {
        if (this.search) {
          this.grupos = await grupoService.search(this.search)
        } else {
          this.grupos = await grupoService.getAll()
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar grupos'
        // console.error('Error fetching grupos:', error)
      } finally {
        this.loading = false
      }
    },

    async createGrupo(data) {
      try {
        await grupoService.create(data)
        await this.fetchGrupos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear grupo'
        return false
      }
    },

    async updateGrupo(id, data) {
      try {
        await grupoService.update(id, data)
        await this.fetchGrupos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar grupo'
        return false
      }
    },

    async deleteGrupo(id) {
      try {
        await grupoService.delete(id)
        await this.fetchGrupos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar grupo'
        return false
      }
    },
  },
})
