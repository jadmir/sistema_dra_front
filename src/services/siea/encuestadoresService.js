import SieaBaseService from './baseService'

/**
 * Servicio para gestión de encuestadores
 */
class EncuestadoresService extends SieaBaseService {
  constructor() {
    super('encuestadores')
  }

  /**
   * Listar encuestadores activos
   * @returns {Promise}
   */
  async listarActivos() {
    return this.list({ activos: true })
  }

  /**
   * Buscar encuestadores
   * @param {string} termino - Término de búsqueda
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise}
   */
  async buscar(termino, filtros = {}) {
    const params = {
      search: termino,
      ...filtros,
    }
    // console.log('🔍 [ENCUESTADORES] Buscando:', termino)
    return this.list(params)
  }

  /**
   * Listar encuestadores por provincia
   * @param {string} provincia - Nombre de la provincia
   * @returns {Promise}
   */
  async listarPorProvincia(provincia) {
    return this.list({ provincia })
  }

  /**
   * Listar encuestadores por estado
   * @param {string} estado - activo, inactivo, suspendido
   * @returns {Promise}
   */
  async listarPorEstado(estado) {
    return this.list({ estado })
  }
}

export default new EncuestadoresService()
