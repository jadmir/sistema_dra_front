import SieaBaseService from './baseService'
import { api } from 'src/boot/axios'

/**
 * Servicio para gestión de encuestas (F-1, F-4, F-6, F-14)
 */
class EncuestasService extends SieaBaseService {
  constructor() {
    super('encuestas')
  }

  /**
   * Validar una encuesta
   * @param {number} id - ID de la encuesta
   * @param {string} observaciones - Observaciones de validación
   * @returns {Promise}
   */
  async validar(id, observaciones = '') {
    try {
      const response = await api.post(`${this.baseURL}/${this.endpoint}/${id}/validar`, {
        observaciones,
      })
      console.log(`✅ [ENCUESTAS] Encuesta #${id} validada`)
      return response.data
    } catch (error) {
      console.error(`❌ Error al validar encuesta #${id}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Rechazar una encuesta
   * @param {number} id - ID de la encuesta
   * @param {string} observaciones - Motivo del rechazo
   * @returns {Promise}
   */
  async rechazar(id, observaciones) {
    try {
      const response = await api.post(`${this.baseURL}/${this.endpoint}/${id}/rechazar`, {
        observaciones,
      })
      console.log(`⚠️ [ENCUESTAS] Encuesta #${id} rechazada`)
      return response.data
    } catch (error) {
      console.error(`❌ Error al rechazar encuesta #${id}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtener formulario completo de una encuesta
   * @param {number} id - ID de la encuesta
   * @returns {Promise}
   */
  async obtenerFormularioCompleto(id) {
    try {
      const response = await api.get(`${this.baseURL}/${this.endpoint}/${id}/formulario-completo`)
      console.log(`📋 [ENCUESTAS] Formulario completo #${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener formulario completo #${id}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtener estadísticas de encuestas
   * @returns {Promise}
   */
  async getEstadisticas() {
    try {
      const response = await api.get(`${this.baseURL}/${this.endpoint}-estadisticas`)
      console.log('📊 [ENCUESTAS] Estadísticas obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.warn('⚠️ [ENCUESTAS] Endpoint de estadísticas no disponible:', error.message)
      // Devolver estructura vacía para no romper la aplicación
      return {
        success: false,
        data: {
          total: 0,
          por_tipo: {},
          por_estado: {},
          por_mes: {},
        },
        message: 'Endpoint no disponible',
      }
    }
  }

  /**
   * Listar encuestas con filtros específicos
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise}
   */
  async listarConFiltros(filtros = {}) {
    const params = {
      page: filtros.page || 1,
      per_page: filtros.per_page || 15,
      ...(filtros.tipo_formulario && { tipo_formulario: filtros.tipo_formulario }),
      ...(filtros.estado && { estado: filtros.estado }),
      ...(filtros.encuestador_id && { encuestador_id: filtros.encuestador_id }),
      ...(filtros.supervisor_id && { supervisor_id: filtros.supervisor_id }),
      ...(filtros.provincia && { provincia: filtros.provincia }),
      ...(filtros.anio && { anio: filtros.anio }),
      ...(filtros.mes && { mes: filtros.mes }),
      ...(filtros.orden_campo && { orden_campo: filtros.orden_campo }),
      ...(filtros.orden_direccion && { orden_direccion: filtros.orden_direccion }),
    }

    console.log('🔍 [ENCUESTAS] Consultando con filtros:', params)
    return this.list(params)
  }
}

export default new EncuestasService()
