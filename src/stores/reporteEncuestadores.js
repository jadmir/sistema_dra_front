import { defineStore } from 'pinia'
import reporteEncuestadoresService from 'src/services/reporteEncuestadoresService'

export const useReporteEncuestadoresStore = defineStore('reporteEncuestadores', {
  state: () => ({
    // Reporte de productividad
    productividad: null,
    loadingProductividad: false,

    // Reporte por día
    reporteDia: null,
    loadingDia: false,

    // Reporte mensual
    reporteMes: null,
    loadingMes: false,

    // Filtros activos
    filtros: {
      fecha_inicio: null,
      fecha_fin: null,
      encuestador_id: null,
      fecha: null,
      año: null,
      mes: null,
    },
  }),

  getters: {
    /**
     * Total de muestras del reporte de productividad
     */
    totalMuestrasProductividad: (state) => {
      return state.productividad?.totales?.total_muestras || 0
    },

    /**
     * Lista de encuestadores ordenados por productividad
     */
    rankingEncuestadores: (state) => {
      if (!state.productividad?.encuestadores) return []
      return [...state.productividad.encuestadores].sort(
        (a, b) => b.total_muestras - a.total_muestras,
      )
    },

    /**
     * Resumen del día actual
     */
    resumenDia: (state) => {
      return state.reporteDia?.resumen || null
    },

    /**
     * Calendario mensual formateado para visualización
     */
    calendarioMensual: (state) => {
      if (!state.reporteMes?.calendario) return []

      return Object.entries(state.reporteMes.calendario).map(([fecha, datos]) => ({
        fecha,
        total_muestras: datos.total_muestras,
        encuestadores_activos: datos.encuestadores_activos,
        detalle: datos.detalle,
      }))
    },
  },

  actions: {
    /**
     * Obtener reporte de productividad
     */
    async fetchProductividad(params = {}) {
      this.loadingProductividad = true
      try {
        console.log('🔍 [PRODUCTIVIDAD] Consultando con params:', params)
        const data = await reporteEncuestadoresService.getProductividad(params)
        console.log('✅ [PRODUCTIVIDAD] Datos recibidos:', data)
        this.productividad = data
        this.filtros.fecha_inicio = params.fecha_inicio || null
        this.filtros.fecha_fin = params.fecha_fin || null
        this.filtros.encuestador_id = params.encuestador_id || null
        return data
      } catch (error) {
        console.error('❌ [PRODUCTIVIDAD] Error:', error)
        throw error
      } finally {
        this.loadingProductividad = false
      }
    },

    /**
     * Obtener reporte del día
     */
    async fetchReporteDia(fecha = null) {
      this.loadingDia = true
      try {
        console.log('🔍 [REPORTE DIA] Consultando fecha:', fecha || 'hoy')
        const data = await reporteEncuestadoresService.getReporteDia(fecha)
        console.log('✅ [REPORTE DIA] Datos recibidos:', data)
        this.reporteDia = data
        this.filtros.fecha = fecha
        return data
      } catch (error) {
        console.error('❌ [REPORTE DIA] Error:', error)
        throw error
      } finally {
        this.loadingDia = false
      }
    },

    /**
     * Obtener reporte mensual
     */
    async fetchReporteMes(año = null, mes = null) {
      this.loadingMes = true
      try {
        console.log('🔍 [REPORTE MES] Consultando:', año, mes)
        const data = await reporteEncuestadoresService.getReporteMes(año, mes)
        console.log('✅ [REPORTE MES] Datos recibidos:', data)
        this.reporteMes = data
        this.filtros.año = año
        this.filtros.mes = mes
        return data
      } catch (error) {
        console.error('❌ [REPORTE MES] Error:', error)
        throw error
      } finally {
        this.loadingMes = false
      }
    },

    /**
     * Limpiar filtros
     */
    limpiarFiltros() {
      this.filtros = {
        fecha_inicio: null,
        fecha_fin: null,
        encuestador_id: null,
        fecha: null,
        año: null,
        mes: null,
      }
    },

    /**
     * Exportar reporte a Excel
     */
    async exportarExcel(params = {}) {
      try {
        const blob = await reporteEncuestadoresService.exportarExcel(params)

        // Crear link de descarga
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_encuestadores_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        console.error('❌ Error al exportar:', error)
        throw error
      }
    },
  },
})
