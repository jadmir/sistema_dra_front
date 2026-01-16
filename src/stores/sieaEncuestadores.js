import { defineStore } from 'pinia'
import { encuestadoresService } from 'src/services/siea'

export const useSieaEncuestadoresStore = defineStore('sieaEncuestadores', {
  state: () => ({
    // Lista de encuestadores
    encuestadores: [],
    encuestadorActual: null,

    // Paginación
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,

    // Estados de carga
    loading: false,

    // Filtros activos
    filtros: {
      estado: null,
      provincia: null,
      especializacion: null,
      search: '',
    },
  }),

  getters: {
    /**
     * Encuestadores activos
     */
    encuestadoresActivos: (state) => {
      return state.encuestadores.filter((e) => e.estado === 'activo')
    },

    /**
     * Encuestadores para select/dropdown
     */
    encuestadoresOptions: (state) => {
      return state.encuestadores.map((e) => ({
        value: e.id,
        label: `${e.nombres} ${e.apellidos}`,
        dni: e.dni,
        provincia: e.provincia,
      }))
    },
  },

  actions: {
    /**
     * Listar encuestadores
     */
    async fetchEncuestadores(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filtros,
        }

        // console.log('🔍 [SIEA ENCUESTADORES] Consultando:', params)
        const response = await encuestadoresService.list(params)

        if (response.success) {
          // response ya es response.data del servicio
          // Transformar especializacion de string a array para la UI
          this.encuestadores = (response.data || []).map((enc) => ({
            ...enc,
            especializacion:
              typeof enc.especializacion === 'string'
                ? enc.especializacion.split(',').filter((e) => e.trim())
                : enc.especializacion || [],
          }))

          // Manejar paginación (puede venir en response.pagination o en el primer nivel)
          const pagination = response.pagination || response
          this.currentPage = pagination.current_page || 1
          this.perPage = pagination.per_page || 15
          this.total = pagination.total || 0
          this.lastPage = pagination.last_page || 1

          // console.log('✅ [SIEA ENCUESTADORES] Cargados:', this.encuestadores.length)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTADORES] Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Listar solo activos (sin paginación)
     */
    async fetchActivos() {
      this.loading = true
      try {
        const response = await encuestadoresService.listarActivos()

        if (response.success) {
          this.encuestadores = response.data || []
          // console.log('✅ [SIEA ENCUESTADORES] Activos cargados:', this.encuestadores.length)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTADORES] Error al cargar activos:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener encuestador por ID
     */
    async fetchEncuestador(id) {
      this.loading = true
      try {
        const response = await encuestadoresService.get(id)

        if (response.success) {
          // Transformar especializacion de string a array para el formulario
          this.encuestadorActual = {
            ...response.data,
            especializacion:
              typeof response.data.especializacion === 'string'
                ? response.data.especializacion.split(',').filter((e) => e.trim())
                : response.data.especializacion || [],
          }
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTADORES] Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear encuestador
     */
    async createEncuestador(datos) {
      this.loading = true
      try {
        // Filtrar valores vacíos del array de especializaciones
        const datosParaEnviar = {
          ...datos,
          especializacion: Array.isArray(datos.especializacion)
            ? datos.especializacion.filter((e) => e && e.trim())
            : datos.especializacion,
        }

        // console.log('📤 [CREATE] Datos a enviar:', datosParaEnviar)
        // console.log('📤 [CREATE] Tipo de especializacion:', typeof datosParaEnviar.especializacion)
        // console.log('📤 [CREATE] Es array?:', Array.isArray(datosParaEnviar.especializacion))
        // console.log('📤 [CREATE] Valor:', datosParaEnviar.especializacion)

        const response = await encuestadoresService.create(datosParaEnviar)

        if (response.success) {
          await this.fetchEncuestadores(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTADORES] Error al crear:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar encuestador
     */
    async updateEncuestador(id, datos) {
      this.loading = true
      try {
        // Filtrar valores vacíos del array de especializaciones
        const datosParaEnviar = {
          ...datos,
          especializacion: Array.isArray(datos.especializacion)
            ? datos.especializacion.filter((e) => e && e.trim())
            : datos.especializacion,
        }

        // console.log('📤 [UPDATE] Datos a enviar:', datosParaEnviar)
        // console.log('📤 [UPDATE] Tipo de especializacion:', typeof datosParaEnviar.especializacion)
        // console.log('📤 [UPDATE] Es array?:', Array.isArray(datosParaEnviar.especializacion))
        // console.log('📤 [UPDATE] Valor:', datosParaEnviar.especializacion)

        const response = await encuestadoresService.update(id, datosParaEnviar)

        if (response.success) {
          await this.fetchEncuestadores(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTADORES] Error al actualizar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar encuestador
     */
    async deleteEncuestador(id) {
      this.loading = true
      try {
        const response = await encuestadoresService.delete(id)

        if (response.success) {
          await this.fetchEncuestadores(this.currentPage)
        }

        return response
      } catch (error) {
        // console.error('❌ [SIEA ENCUESTADORES] Error al eliminar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar encuestadores
     */
    async buscar(termino) {
      this.filtros.search = termino
      await this.fetchEncuestadores(1)
    },

    /**
     * Actualizar filtros
     */
    setFiltros(nuevosFiltros) {
      this.filtros = {
        ...this.filtros,
        ...nuevosFiltros,
      }
    },

    /**
     * Limpiar filtros
     */
    limpiarFiltros() {
      this.filtros = {
        estado: null,
        provincia: null,
        especializacion: null,
        search: '',
      }
    },
  },
})
