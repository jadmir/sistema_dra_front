import { defineStore } from 'pinia'
import { agroquimicosService } from 'src/services/siea'

export const useSieaAgroquimicosStore = defineStore('sieaAgroquimicos', {
  state: () => ({
    agroquimicos: [],
    categorias: [],
    categoriasToxicologicas: [],
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
    loading: false,
    filtros: {
      categoria: null,
      categoria_toxicologica: null,
      activo: null,
      search: '',
    },
  }),

  getters: {
    /**
     * Filtrar solo agroquímicos activos
     */
    agroquimicosActivos: (state) => {
      return state.agroquimicos.filter((a) => a.activo === true)
    },

    /**
     * Opciones para q-select
     */
    agroquimicosOptions: (state) => {
      return state.agroquimicos.map((a) => ({
        value: a.id,
        label: a.nombre,
        codigo: a.codigo,
        categoria: a.categoria,
        categoria_toxicologica: a.categoria_toxicologica,
      }))
    },

    /**
     * Verificar si hay más páginas
     */
    hayMasPaginas: (state) => {
      return state.currentPage < state.lastPage
    },

    /**
     * Agrupar agroquímicos por categoría
     */
    agroquimicosPorCategoria: (state) => {
      return state.agroquimicos.reduce((acc, a) => {
        const categoria = a.categoria || 'Sin categoría'
        if (!acc[categoria]) {
          acc[categoria] = []
        }
        acc[categoria].push(a)
        return acc
      }, {})
    },

    /**
     * Agrupar por categoría toxicológica
     */
    agroquimicosPorToxicidad: (state) => {
      return state.agroquimicos.reduce((acc, a) => {
        const toxico = a.categoria_toxicologica || 'Sin clasificar'
        if (!acc[toxico]) {
          acc[toxico] = []
        }
        acc[toxico].push(a)
        return acc
      }, {})
    },
  },

  actions: {
    /**
     * Obtener lista de agroquímicos con paginación
     */
    async fetchAgroquimicos(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filtros,
        }

        const response = await agroquimicosService.list(params)

        if (response.success) {
          this.agroquimicos = response.data
          this.currentPage = response.current_page || page
          this.perPage = response.per_page || 15
          this.total = response.total || 0
          this.lastPage = response.last_page || 1
        }
      } catch (error) {
        // console.error('Error al cargar agroquímicos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener solo agroquímicos activos
     */
    async fetchActivos() {
      this.loading = true
      try {
        const response = await agroquimicosService.listarActivos()
        if (response.success) {
          this.agroquimicos = response.data
        }
      } catch (error) {
        // console.error('Error al cargar agroquímicos activos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener categorías de agroquímicos
     */
    async fetchCategorias() {
      try {
        // Categorías estáticas según la documentación de la API
        this.categorias = [
          'HERBICIDA',
          'INSECTICIDA',
          'FUNGICIDA',
          'ACARICIDA',
          'ADHERENTE',
          'NUTRIENTE',
          'REGULADOR',
          'OTROS',
        ]
      } catch (error) {
        // console.error('Error al cargar categorías:', error)
        throw error
      }
    },

    /**
     * Obtener categorías toxicológicas
     */
    async fetchCategoriasToxico() {
      try {
        // Categorías toxicológicas estáticas
        this.categoriasToxicologicas = [
          'IA - Extremadamente tóxico',
          'IB - Altamente tóxico',
          'II - Moderadamente tóxico',
          'III - Ligeramente tóxico',
          'IV - Normalmente no ofrece peligro',
        ]
      } catch (error) {
        // console.error('Error al cargar categorías toxicológicas:', error)
        throw error
      }
    },

    /**
     * Crear nuevo agroquímico
     */
    async createAgroquimico(data) {
      this.loading = true
      try {
        const response = await agroquimicosService.create(data)
        if (response.success) {
          await this.fetchAgroquimicos(this.currentPage)
        }
        return response
      } catch (error) {
        // console.error('Error al crear agroquímico:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar agroquímico
     */
    async updateAgroquimico(id, data) {
      this.loading = true
      try {
        const response = await agroquimicosService.update(id, data)
        if (response.success) {
          await this.fetchAgroquimicos(this.currentPage)
        }
        return response
      } catch (error) {
        // console.error('Error al actualizar agroquímico:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar agroquímico
     */
    async deleteAgroquimico(id) {
      this.loading = true
      try {
        const response = await agroquimicosService.delete(id)
        if (response.success) {
          await this.fetchAgroquimicos(this.currentPage)
        }
        return response
      } catch (error) {
        // console.error('Error al eliminar agroquímico:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar agroquímicos
     */
    async buscar(termino) {
      this.loading = true
      try {
        const response = await agroquimicosService.buscar(termino)
        if (response.success) {
          this.agroquimicos = response.data
        }
      } catch (error) {
        // console.error('Error en búsqueda:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Establecer filtros
     */
    setFiltros(filtros) {
      this.filtros = { ...this.filtros, ...filtros }
      this.currentPage = 1
    },

    /**
     * Limpiar filtros
     */
    limpiarFiltros() {
      this.filtros = {
        categoria: null,
        categoria_toxicologica: null,
        activo: null,
        search: '',
      }
      this.currentPage = 1
    },

    /**
     * Navegar a página específica
     */
    async irAPagina(page) {
      if (page >= 1 && page <= this.lastPage) {
        await this.fetchAgroquimicos(page)
      }
    },

    /**
     * Ir a página siguiente
     */
    async siguientePagina() {
      if (this.hayMasPaginas) {
        await this.irAPagina(this.currentPage + 1)
      }
    },

    /**
     * Ir a página anterior
     */
    async paginaAnterior() {
      if (this.currentPage > 1) {
        await this.irAPagina(this.currentPage - 1)
      }
    },
  },
})
