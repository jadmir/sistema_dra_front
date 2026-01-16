import SieaBaseService from './baseService'

/**
 * Service para obtener estadísticas de encuestas SIEA
 * Endpoint: GET /api/agri/encuestas-estadisticas
 */
class EncuestasEstadisticasService extends SieaBaseService {
  constructor() {
    super('encuestas-estadisticas') // Base: /api/agri/encuestas-estadisticas
  }

  /**
   * Obtener estadísticas de encuestas
   * @param {object} filtros - { anio?, mes? }
   * @returns {Promise<object>} - Response con estadísticas { total, por_estado, por_tipo, por_provincia }
   */
  async getEstadisticas(filtros = {}) {
    try {
      const params = new URLSearchParams()

      // Agregar filtros si existen
      if (filtros.anio) {
        params.append('anio', filtros.anio)
      }

      if (filtros.mes) {
        params.append('mes', filtros.mes)
      }

      const queryString = params.toString()
      const url = queryString
        ? `${this.baseURL}/${this.endpoint}?${queryString}`
        : `${this.baseURL}/${this.endpoint}`

      // console.log(`📊 [ESTADÍSTICAS] Obteniendo con filtros:`, filtros)
      // console.log(`🔗 [ESTADÍSTICAS] URL:`, url)
      const response = await this.api.get(url)
      // console.log('✅ [ESTADÍSTICAS] Success:', response.data)
      return response.data
    } catch (error) {
      // console.error('❌ [ESTADÍSTICAS] Error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default new EncuestasEstadisticasService()
