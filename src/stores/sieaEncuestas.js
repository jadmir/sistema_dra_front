import { defineStore } from 'pinia'
import { encuestasService } from 'src/services/siea'

export const useSieaEncuestasStore = defineStore('sieaEncuestas', {
  state: () => ({
    // Lista de encuestas
    encuestas: [],
    encuestaActual: null,

    // Paginación
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,

    // Estadísticas
    estadisticas: null,

    // Estados de carga
    loading: false,
    loadingEstadisticas: false,

    // Filtros activos
    filtros: {
      tipo_formulario: null,
      estado: null,
      encuestador_id: null,
      supervisor_id: null,
      provincia: null,
      anio: new Date().getFullYear(),
      mes: null,
      orden_campo: 'created_at',
      orden_direccion: 'desc',
    },
  }),

  getters: {
    /**
     * Encuestas pendientes
     */
    encuestasPendientes: (state) => {
      return state.encuestas.filter((e) => e.estado === 'pendiente')
    },

    /**
     * Encuestas validadas
     */
    encuestasValidadas: (state) => {
      return state.encuestas.filter((e) => e.estado === 'validado')
    },

    /**
     * Encuestas rechazadas
     */
    encuestasRechazadas: (state) => {
      return state.encuestas.filter((e) => e.estado === 'rechazado')
    },

    /**
     * Total de páginas
     */
    totalPaginas: (state) => {
      return state.lastPage
    },

    /**
     * Hay más páginas
     */
    hayMasPaginas: (state) => {
      return state.currentPage < state.lastPage
    },
  },

  actions: {
    /**
     * Listar encuestas con filtros
     */
    async fetchEncuestas(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filtros,
        }

        // console.log('🔍 [SIEA ENCUESTAS] Consultando página', page, 'con filtros:', params)

        const response = await encuestasService.listarConFiltros(params)

        // console.log('📊 [SIEA ENCUESTAS] Respuesta completa:', response)

        if (response.success) {
          // La respuesta ya viene como response.data desde el servicio
          this.encuestas = response.data || []
          this.currentPage = response.current_page || page
          this.perPage = response.per_page || 15
          this.total = response.total || 0
          this.lastPage = response.last_page || 1

          // console.log('✅ [SIEA ENCUESTAS] Cargadas:', this.encuestas.length, 'de', this.total)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al cargar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener una encuesta por ID
     */
    async fetchEncuesta(id) {
      this.loading = true
      try {
        // console.log('🔍 [SIEA ENCUESTAS] Consultando encuesta #', id)
        const response = await encuestasService.get(id)

        if (response.success) {
          this.encuestaActual = response.data
          // console.log('✅ [SIEA ENCUESTAS] Encuesta cargada:', response.data)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al cargar encuesta:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear nueva encuesta
     */
    async createEncuesta(datos) {
      this.loading = true
      try {
        // console.log('📝 [SIEA ENCUESTAS] Creando encuesta:', datos)
        const response = await encuestasService.create(datos)

        if (response.success) {
          // console.log('✅ [SIEA ENCUESTAS] Encuesta creada:', response.data)
          // Recargar lista
          await this.fetchEncuestas(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al crear:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar encuesta
     */
    async updateEncuesta(id, datos) {
      this.loading = true
      try {
        // console.log('📝 [SIEA ENCUESTAS] Actualizando encuesta #', id)
        const response = await encuestasService.update(id, datos)

        if (response.success) {
          // console.log('✅ [SIEA ENCUESTAS] Encuesta actualizada')
          // Recargar lista
          await this.fetchEncuestas(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al actualizar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar encuesta
     */
    async deleteEncuesta(id) {
      this.loading = true
      try {
        // console.log('🗑️ [SIEA ENCUESTAS] Eliminando encuesta #', id)
        const response = await encuestasService.delete(id)

        if (response.success) {
          // console.log('✅ [SIEA ENCUESTAS] Encuesta eliminada')
          // Recargar lista
          await this.fetchEncuestas(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al eliminar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Validar encuesta
     */
    async validarEncuesta(id, observaciones = '') {
      this.loading = true
      try {
        // console.log('✅ [SIEA ENCUESTAS] Validando encuesta #', id)
        const response = await encuestasService.validar(id, observaciones)

        if (response.success) {
          // console.log('✅ [SIEA ENCUESTAS] Encuesta validada')
          // Recargar lista
          await this.fetchEncuestas(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al validar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Rechazar encuesta
     */
    async rechazarEncuesta(id, observaciones) {
      this.loading = true
      try {
        // console.log('❌ [SIEA ENCUESTAS] Rechazando encuesta #', id)
        const response = await encuestasService.rechazar(id, observaciones)

        if (response.success) {
          // console.log('✅ [SIEA ENCUESTAS] Encuesta rechazada')
          // Recargar lista
          await this.fetchEncuestas(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al rechazar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener estadísticas
     */
    async fetchEstadisticas() {
      this.loadingEstadisticas = true
      try {
        // console.log('📊 [SIEA ENCUESTAS] Consultando estadísticas')
        const response = await encuestasService.getEstadisticas()

        if (response.success) {
          this.estadisticas = response.data
          // console.log('✅ [SIEA ENCUESTAS] Estadísticas cargadas:', this.estadisticas)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTAS] Error al cargar estadísticas:', error)
        throw error
      } finally {
        this.loadingEstadisticas = false
      }
    },

    /**
     * Actualizar filtros
     */
    setFiltros(nuevosFiltros) {
      this.filtros = {
        ...this.filtros,
        ...nuevosFiltros,
      }
      // console.log('🔧 [SIEA ENCUESTAS] Filtros actualizados:', this.filtros)
    },

    /**
     * Limpiar filtros
     */
    limpiarFiltros() {
      this.filtros = {
        tipo_formulario: null,
        estado: null,
        encuestador_id: null,
        supervisor_id: null,
        provincia: null,
        anio: new Date().getFullYear(),
        mes: null,
        orden_campo: 'created_at',
        orden_direccion: 'desc',
      }
      // console.log('🧹 [SIEA ENCUESTAS] Filtros limpiados')
    },

    /**
     * Ir a página específica
     */
    async irAPagina(page) {
      await this.fetchEncuestas(page)
    },

    /**
     * Página siguiente
     */
    async siguientePagina() {
      if (this.hayMasPaginas) {
        await this.fetchEncuestas(this.currentPage + 1)
      }
    },

    /**
     * Página anterior
     */
    async paginaAnterior() {
      if (this.currentPage > 1) {
        await this.fetchEncuestas(this.currentPage - 1)
      }
    },
  },
})
