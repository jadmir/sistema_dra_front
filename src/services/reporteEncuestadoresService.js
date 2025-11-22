import { api } from 'src/boot/axios'

const BASE_URL = '/api/precios/reportes/encuestadores'

export default {
  /**
   * Obtener reporte de productividad por rango de fechas
   * @param {Object} params - { fecha_inicio, fecha_fin, encuestador_id }
   * @returns {Promise}
   */
  async getProductividad(params = {}) {
    try {
      const response = await api.get(`${BASE_URL}/productividad`, { params })
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener productividad:', error)
      throw error
    }
  },

  /**
   * Obtener reporte de actividad por día
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise}
   */
  async getReporteDia(fecha = null) {
    try {
      const params = fecha ? { fecha } : {}
      const response = await api.get(`${BASE_URL}/por-dia`, { params })
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener reporte del día:', error)
      throw error
    }
  },

  /**
   * Obtener reporte mensual con calendario
   * @param {number} año - Año a consultar
   * @param {number} mes - Mes a consultar (1-12)
   * @returns {Promise}
   */
  async getReporteMes(año = null, mes = null) {
    try {
      const params = {}
      if (año) params.año = año
      if (mes) params.mes = mes
      const response = await api.get(`${BASE_URL}/por-mes`, { params })
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener reporte mensual:', error)
      throw error
    }
  },

  /**
   * Exportar reporte a Excel (si el backend lo implementa)
   * @param {Object} params - Parámetros del reporte
   * @returns {Promise}
   */
  async exportarExcel(params = {}) {
    try {
      const response = await api.get(`${BASE_URL}/exportar`, {
        params,
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('❌ Error al exportar reporte:', error)
      throw error
    }
  },
}
