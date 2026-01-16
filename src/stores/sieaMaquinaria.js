import { defineStore } from 'pinia'
import { maquinariaService } from 'src/services/siea'

export const useSieaMaquinariaStore = defineStore('sieaMaquinaria', {
  state: () => ({
    maquinaria: [],
    tipos: [],
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
    loading: false,
    filtros: {
      tipo: null,
      activo: null,
      search: '',
    },
  }),

  getters: {
    /**
     * Filtrar solo maquinaria activa
     */
    maquinariaActiva: (state) => {
      return state.maquinaria.filter((m) => m.activo === true)
    },

    /**
     * Opciones para q-select
     */
    maquinariaOptions: (state) => {
      return state.maquinaria.map((m) => ({
        value: m.id,
        label: m.nombre,
        codigo: m.codigo,
        tipo: m.tipo,
        descripcion: m.descripcion,
      }))
    },

    /**
     * Verificar si hay más páginas
     */
    hayMasPaginas: (state) => {
      return state.currentPage < state.lastPage
    },

    /**
     * Agrupar maquinaria por tipo
     */
    maquinariaPorTipo: (state) => {
      return state.maquinaria.reduce((acc, m) => {
        const tipo = m.tipo || 'Sin tipo'
        if (!acc[tipo]) {
          acc[tipo] = []
        }
        acc[tipo].push(m)
        return acc
      }, {})
    },
  },

  actions: {
    /**
     * Obtener lista de maquinaria con paginación
     */
    async fetchMaquinaria(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filtros,
        }

        const response = await maquinariaService.list(params)

        if (response.success) {
          this.maquinaria = response.data
          this.currentPage = response.current_page || page
          this.perPage = response.per_page || 15
          this.total = response.total || 0
          this.lastPage = response.last_page || 1
        }
      } catch (error) {
        // console.error('Error al cargar maquinaria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener solo maquinaria activa
     */
    async fetchActivos() {
      this.loading = true
      try {
        const response = await maquinariaService.listarActivos()
        if (response.success) {
          this.maquinaria = response.data
        }
      } catch (error) {
        // console.error('Error al cargar maquinaria activa:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener tipos de maquinaria
     */
    async fetchTipos() {
      try {
        const response = await maquinariaService.listarTipos()
        if (response.success) {
          this.tipos = response.data
        }
      } catch (error) {
        // console.error('Error al cargar tipos:', error)
        throw error
      }
    },

    /**
     * Crear nueva maquinaria
     */
    async createMaquinaria(data) {
      this.loading = true
      try {
        const response = await maquinariaService.create(data)
        if (response.success) {
          await this.fetchMaquinaria(this.currentPage)
        }
        return response
      } catch (error) {
        // console.error('Error al crear maquinaria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar maquinaria
     */
    async updateMaquinaria(id, data) {
      this.loading = true
      try {
        const response = await maquinariaService.update(id, data)
        if (response.success) {
          await this.fetchMaquinaria(this.currentPage)
        }
        return response
      } catch (error) {
        // console.error('Error al actualizar maquinaria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar maquinaria
     */
    async deleteMaquinaria(id) {
      this.loading = true
      try {
        const response = await maquinariaService.delete(id)
        if (response.success) {
          await this.fetchMaquinaria(this.currentPage)
        }
        return response
      } catch (error) {
        // console.error('Error al eliminar maquinaria:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar maquinaria
     */
    async buscar(termino) {
      this.loading = true
      try {
        const response = await maquinariaService.buscar(termino)
        if (response.success) {
          this.maquinaria = response.data
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
        tipo: null,
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
        await this.fetchMaquinaria(page)
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
