import { defineStore } from 'pinia'
import encuestasEstadisticasService from 'src/services/siea/encuestasEstadisticasService'
import { Notify } from 'quasar'

/**
 * Store para estadísticas de encuestas SIEA
 */
export const useSieaEncuestasEstadisticasStore = defineStore('sieaEncuestasEstadisticas', {
  state: () => ({
    loading: false,
    estadisticas: null,
    filtros: {
      anio: new Date().getFullYear(),
      mes: null,
    },
  }),

  getters: {
    /**
     * Total de encuestas
     */
    totalEncuestas: (state) => state.estadisticas?.total || 0,

    /**
     * Encuestas por estado
     */
    encuestasPorEstado: (state) => state.estadisticas?.por_estado || {},

    /**
     * Encuestas por tipo
     */
    encuestasPorTipo: (state) => state.estadisticas?.por_tipo || {},

    /**
     * Encuestas por provincia (Top 10)
     */
    encuestasPorProvincia: (state) => state.estadisticas?.por_provincia || {},

    /**
     * Porcentaje de validación
     */
    porcentajeValidadas: (state) => {
      const total = state.estadisticas?.total || 0
      const validadas = state.estadisticas?.por_estado?.validado || 0
      return total > 0 ? ((validadas / total) * 100).toFixed(1) : '0.0'
    },

    /**
     * Porcentaje de rechazo
     */
    porcentajeRechazadas: (state) => {
      const total = state.estadisticas?.total || 0
      const rechazadas = state.estadisticas?.por_estado?.rechazado || 0
      return total > 0 ? ((rechazadas / total) * 100).toFixed(1) : '0.0'
    },

    /**
     * Encuestas pendientes de validación
     */
    encuestasPendientes: (state) => state.estadisticas?.por_estado?.enviado || 0,

    /**
     * Encuestas en borrador
     */
    encuestasBorrador: (state) => state.estadisticas?.por_estado?.borrador || 0,

    /**
     * Encuestas validadas
     */
    encuestasValidadas: (state) => state.estadisticas?.por_estado?.validado || 0,

    /**
     * Encuestas rechazadas
     */
    encuestasRechazadas: (state) => state.estadisticas?.por_estado?.rechazado || 0,
  },

  actions: {
    /**
     * Obtener estadísticas con filtros actuales
     */
    async fetchEstadisticas() {
      this.loading = true

      try {
        // console.log('📊 [ESTADÍSTICAS] Obteniendo con filtros:', this.filtros)

        const response = await encuestasEstadisticasService.getEstadisticas(this.filtros)

        if (response.success) {
          this.estadisticas = response.data
          // console.log('✅ [ESTADÍSTICAS] Success:', response.data)
        } else {
          throw new Error(response.message || 'Error al obtener estadísticas')
        }
      } catch (error) {
        // console.error('❌ [ESTADÍSTICAS] Error:', error)

        Notify.create({
          type: 'negative',
          message: '❌ Error al cargar estadísticas',
          caption: error.response?.data?.message || error.message,
          position: 'top-right',
          timeout: 5000,
        })

        this.estadisticas = null
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar filtro de año
     * @param {number} anio - Año a filtrar
     */
    setAnio(anio) {
      this.filtros.anio = anio
      this.fetchEstadisticas()
    },

    /**
     * Actualizar filtro de mes
     * @param {number|null} mes - Mes a filtrar (1-12) o null para todos
     */
    setMes(mes) {
      this.filtros.mes = mes
      this.fetchEstadisticas()
    },

    /**
     * Limpiar filtros y resetear al año actual
     */
    limpiarFiltros() {
      this.filtros = {
        anio: new Date().getFullYear(),
        mes: null,
      }
      this.fetchEstadisticas()
    },

    /**
     * Refrescar estadísticas (útil después de validar/rechazar)
     */
    async refrescar() {
      // console.log('🔄 [ESTADÍSTICAS] Refrescando...')
      await this.fetchEstadisticas()
    },
  },
})
