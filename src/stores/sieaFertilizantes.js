import { defineStore } from 'pinia'
import { fertilizantesService } from 'src/services/siea'

export const useSieaFertilizantesStore = defineStore('sieaFertilizantes', {
  state: () => ({
    fertilizantes: [],
    tipos: [],
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
    loading: false,
    filtros: {
      tipo: null,
      composicion: null,
      activo: null,
      search: '',
    },
  }),

  getters: {
    /**
     * Filtrar solo fertilizantes activos
     */
    fertilizantesActivos: (state) => {
      return state.fertilizantes.filter((f) => f.activo === true)
    },

    /**
     * Opciones para q-select
     */
    fertilizantesOptions: (state) => {
      return state.fertilizantes.map((f) => ({
        value: f.id,
        label: f.nombre,
        codigo: f.codigo,
        tipo: f.tipo,
        composicion: f.composicion,
      }))
    },

    /**
     * Verificar si hay más páginas
     */
    hayMasPaginas: (state) => {
      return state.currentPage < state.lastPage
    },

    /**
     * Agrupar fertilizantes por tipo
     */
    fertilizantesPorTipo: (state) => {
      return state.fertilizantes.reduce((acc, f) => {
        const tipo = f.tipo || 'Sin tipo'
        if (!acc[tipo]) {
          acc[tipo] = []
        }
        acc[tipo].push(f)
        return acc
      }, {})
    },
  },

  actions: {
    /**
     * Obtener lista de fertilizantes con paginación
     */
    async fetchFertilizantes(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filtros,
        }

        const response = await fertilizantesService.list(params)

        if (response.success) {
          this.fertilizantes = response.data
          this.currentPage = response.current_page || page
          this.perPage = response.per_page || 15
          this.total = response.total || 0
          this.lastPage = response.last_page || 1
        }
      } catch (error) {
        console.error('Error al cargar fertilizantes:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener solo fertilizantes activos
     */
    async fetchActivos() {
      this.loading = true
      try {
        const response = await fertilizantesService.listarActivos()
        if (response.success) {
          this.fertilizantes = response.data
        }
      } catch (error) {
        console.error('Error al cargar fertilizantes activos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener tipos de fertilizante desde los fertilizantes cargados
     */
    async fetchTipos() {
      try {
        // Extraer tipos únicos de los fertilizantes ya cargados
        const tiposUnicos = [
          ...new Set(this.fertilizantes.map((f) => f.tipo).filter(Boolean)),
        ].sort()
        this.tipos = tiposUnicos
        console.log('📋 [STORE FERTILIZANTES] Tipos extraídos:', tiposUnicos)
      } catch (error) {
        console.error('Error al cargar tipos:', error)
        // Fallback con tipos predefinidos
        this.tipos = ['nitrogenado', 'fosfatado', 'potasico', 'compuesto', 'organico']
      }
    },

    /**
     * Crear nuevo fertilizante
     */
    async createFertilizante(data) {
      this.loading = true
      try {
        const response = await fertilizantesService.create(data)
        if (response.success) {
          await this.fetchFertilizantes(this.currentPage)
        }
        return response
      } catch (error) {
        console.error('Error al crear fertilizante:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar fertilizante
     */
    async updateFertilizante(id, data) {
      this.loading = true
      try {
        const response = await fertilizantesService.update(id, data)
        if (response.success) {
          await this.fetchFertilizantes(this.currentPage)
        }
        return response
      } catch (error) {
        console.error('Error al actualizar fertilizante:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar fertilizante
     */
    async deleteFertilizante(id) {
      this.loading = true
      try {
        const response = await fertilizantesService.delete(id)
        if (response.success) {
          await this.fetchFertilizantes(this.currentPage)
        }
        return response
      } catch (error) {
        console.error('Error al eliminar fertilizante:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar fertilizantes
     */
    async buscar(termino) {
      this.loading = true
      try {
        const response = await fertilizantesService.buscar(termino)
        if (response.success) {
          this.fertilizantes = response.data
        }
      } catch (error) {
        console.error('Error en búsqueda:', error)
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
        tipo: null,
        composicion: null,
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
        await this.fetchFertilizantes(page)
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
