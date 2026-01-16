import SieaBaseService from './baseService'

/**
 * Service para validar y rechazar encuestas SIEA
 * Endpoints:
 * - POST /api/agri/encuestas/{id}/validar
 * - POST /api/agri/encuestas/{id}/rechazar
 */
class EncuestasValidacionService extends SieaBaseService {
  constructor() {
    super('encuestas') // Base: /api/agri/encuestas
  }

  /**
   * Validar encuesta (Supervisor aprueba)
   * @param {number} id - ID de la encuesta
   * @param {object} datos - { supervisor_id, observaciones_supervisor?, firma_supervisor? }
   * @returns {Promise<object>} - Response con encuesta validada
   */
  async validar(id, datos) {
    try {
      // console.log(`📤 [VALIDAR ENCUESTA] ID: ${id}`, datos)
      const response = await this.api.post(`${this.baseURL}/${this.endpoint}/${id}/validar`, datos)
      // console.log('✅ [VALIDAR ENCUESTA] Success:', response.data)
      return response.data
    } catch (error) {
      // console.error('❌ [VALIDAR ENCUESTA] Error:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Rechazar encuesta (Supervisor rechaza con motivo)
   * @param {number} id - ID de la encuesta
   * @param {object} datos - { supervisor_id, observaciones_supervisor (OBLIGATORIO) }
   * @returns {Promise<object>} - Response con encuesta rechazada
   */
  async rechazar(id, datos) {
    try {
      // Validación previa: observaciones son obligatorias
      if (!datos.observaciones_supervisor || datos.observaciones_supervisor.trim() === '') {
        throw new Error('Las observaciones son obligatorias al rechazar una encuesta')
      }

      // console.log(`📤 [RECHAZAR ENCUESTA] ID: ${id}`, datos)
      const response = await this.api.post(`${this.baseURL}/${this.endpoint}/${id}/rechazar`, datos)
      // console.log('✅ [RECHAZAR ENCUESTA] Success:', response.data)
      return response.data
    } catch (error) {
      // console.error('❌ [RECHAZAR ENCUESTA] Error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default new EncuestasValidacionService()
