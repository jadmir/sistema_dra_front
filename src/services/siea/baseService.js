import { api } from 'src/boot/axios'

/**
 * Servicio base para API SIEA
 * Base URL: /agri
 */
const BASE_URL = '/agri'

/**
 * Clase base para servicios SIEA
 */
class SieaBaseService {
  constructor(endpoint) {
    this.endpoint = endpoint
    this.baseURL = BASE_URL
    this.api = api
  }

  /**
   * Getter para baseUrl (alias de baseURL)
   */
  get baseUrl() {
    return `${this.baseURL}/${this.endpoint}`
  }

  /**
   * GET: Listar recursos con paginación y filtros
   * @param {Object} params - Parámetros de query
   * @returns {Promise}
   */
  async list(params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/${this.endpoint}`, { params })
      return response.data
    } catch (error) {
      // console.error(`❌ Error al listar ${this.endpoint}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * GET: Obtener un recurso por ID
   * @param {number} id - ID del recurso
   * @returns {Promise}
   */
  async get(id) {
    try {
      const response = await api.get(`${this.baseURL}/${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      // console.error(`❌ Error al obtener ${this.endpoint} #${id}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * POST: Crear un nuevo recurso
   * @param {Object} data - Datos del recurso
   * @returns {Promise}
   */
  async create(data) {
    try {
      const response = await api.post(`${this.baseURL}/${this.endpoint}`, data)
      return response.data
    } catch (error) {
      // console.error(`❌ Error al crear ${this.endpoint}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * PUT: Actualizar un recurso
   * @param {number} id - ID del recurso
   * @param {Object} data - Datos actualizados
   * @returns {Promise}
   */
  async update(id, data) {
    try {
      const response = await api.put(`${this.baseURL}/${this.endpoint}/${id}`, data)
      return response.data
    } catch (error) {
      // console.error(`❌ Error al actualizar ${this.endpoint} #${id}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * DELETE: Eliminar un recurso
   * @param {number} id - ID del recurso
   * @returns {Promise}
   */
  async delete(id) {
    try {
      const response = await api.delete(`${this.baseURL}/${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      // console.error(`❌ Error al eliminar ${this.endpoint} #${id}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error capturado
   * @returns {Error}
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response

      switch (status) {
        case 400:
        case 422:
          // Errores de validación
          return {
            message: data.message || 'Error de validación',
            errors: data.errors || {},
            status,
          }
        case 401:
          return {
            message: 'No autorizado. Por favor, inicia sesión nuevamente',
            status,
          }
        case 403:
          return {
            message: 'No tienes permisos para realizar esta acción',
            status,
          }
        case 404:
          return {
            message: data.message || 'Recurso no encontrado',
            status,
          }
        case 500:
          return {
            message: 'Error interno del servidor',
            error: data.error || 'Error desconocido',
            status,
          }
        default:
          return {
            message: data.message || 'Error en la petición',
            status,
          }
      }
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión. Verifica tu conexión a internet',
        status: 0,
      }
    } else {
      // Error desconocido
      return {
        message: error.message || 'Error desconocido',
        status: -1,
      }
    }
  }
}

export { SieaBaseService }
export default SieaBaseService
