import { defineStore } from 'pinia'
import { supervisoresService } from 'src/services/siea'

export const useSieaSupervisoresStore = defineStore('sieaSupervisores', {
  state: () => ({
    // Lista de supervisores
    supervisores: [],
    supervisorActual: null,

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
      region: null,
      search: '',
    },
  }),

  getters: {
    /**
     * Supervisores activos
     */
    supervisoresActivos: (state) => {
      return state.supervisores.filter((s) => s.estado === 'activo')
    },

    /**
     * Supervisores para select/dropdown
     */
    supervisoresOptions: (state) => {
      return state.supervisores.map((s) => ({
        value: s.id,
        label: s.nombre_completo || `${s.nombres} ${s.apellido_paterno} ${s.apellido_materno}`,
        dni: s.dni,
        region: s.region_supervisada,
      }))
    },
  },

  actions: {
    /**
     * Listar supervisores
     */
    async fetchSupervisores(page = 1) {
      this.loading = true
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filtros,
        }

        console.log('🔍 [SIEA SUPERVISORES] Consultando:', params)
        const response = await supervisoresService.list(params)

        if (response.success) {
          // Flexible: manejar paginación anidada o plana
          const pagination = response.pagination || response

          this.supervisores = (response.data || []).map((sup) => ({
            ...sup,
            // Asegurar que provincias_asignadas sea array
            provincias_asignadas:
              typeof sup.provincias_asignadas === 'string'
                ? sup.provincias_asignadas.split(',').filter((p) => p.trim())
                : sup.provincias_asignadas || [],
          }))

          this.currentPage = pagination.current_page || 1
          this.perPage = pagination.per_page || 15
          this.total = pagination.total || 0
          this.lastPage = pagination.last_page || 1

          console.log('✅ [SIEA SUPERVISORES] Cargados:', this.supervisores.length)
        }

        return response
      } catch (error) {
        console.error('❌ [SIEA SUPERVISORES] Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Listar solo activos
     */
    async fetchActivos() {
      this.loading = true
      try {
        const response = await supervisoresService.listarActivos()

        if (response.success) {
          this.supervisores = response.data || []
          console.log('✅ [SIEA SUPERVISORES] Activos cargados:', this.supervisores.length)
        }

        return response
      } catch (error) {
        console.error('❌ [SIEA SUPERVISORES] Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener supervisor por ID
     */
    async fetchSupervisor(id) {
      this.loading = true
      try {
        const response = await supervisoresService.get(id)

        if (response.success) {
          this.supervisorActual = response.data
        }

        return response
      } catch (error) {
        console.error('❌ [SIEA SUPERVISORES] Error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear supervisor
     */
    async createSupervisor(datos) {
      this.loading = true
      try {
        // Filtrar valores vacíos del array provincias_asignadas
        const datosParaEnviar = {
          ...datos,
          provincias_asignadas: (datos.provincias_asignadas || []).filter((p) => p && p.trim()),
        }

        console.log('📤 [CREATE SUPERVISOR] Datos a enviar:', datosParaEnviar)

        const response = await supervisoresService.create(datosParaEnviar)

        if (response.success) {
          await this.fetchSupervisores(this.currentPage)
        }

        return response
      } catch (error) {
        console.error('❌ [SIEA SUPERVISORES] Error al crear:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar supervisor
     */
    async updateSupervisor(id, datos) {
      this.loading = true
      try {
        // Filtrar valores vacíos del array provincias_asignadas
        const datosParaEnviar = {
          ...datos,
          provincias_asignadas: (datos.provincias_asignadas || []).filter((p) => p && p.trim()),
        }

        console.log('📤 [UPDATE SUPERVISOR] Datos a enviar:', datosParaEnviar)

        const response = await supervisoresService.update(id, datosParaEnviar)

        if (response.success) {
          await this.fetchSupervisores(this.currentPage)
        }

        return response
      } catch (error) {
        console.error('❌ [SIEA SUPERVISORES] Error al actualizar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar supervisor
     */
    async deleteSupervisor(id) {
      this.loading = true
      try {
        const response = await supervisoresService.delete(id)

        if (response.success) {
          await this.fetchSupervisores(this.currentPage)
        }

        return response
      } catch (error) {
        console.error('❌ [SIEA SUPERVISORES] Error al eliminar:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar supervisores
     */
    async buscar(termino) {
      this.filtros.search = termino
      await this.fetchSupervisores(1)
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
        region: null,
        search: '',
      }
    },
  },
})
