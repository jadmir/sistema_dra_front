import SieaBaseService from './baseService'

/**
 * Servicio para gestión de supervisores
 */
class SupervisoresService extends SieaBaseService {
  constructor() {
    super('supervisores')
  }

  /**
   * Listar supervisores activos
   * @returns {Promise}
   */
  async listarActivos() {
    return this.list({ activos: true })
  }

  /**
   * Buscar supervisores
   * @param {string} termino - Término de búsqueda
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise}
   */
  async buscar(termino, filtros = {}) {
    const params = {
      search: termino,
      ...filtros,
    }
    console.log('🔍 [SUPERVISORES] Buscando:', termino)
    return this.list(params)
  }

  /**
   * Listar supervisores por región
   * @param {string} region - Nombre de la región
   * @returns {Promise}
   */
  async listarPorRegion(region) {
    return this.list({ region })
  }

  /**
   * Listar supervisores por estado
   * @param {string} estado - activo, inactivo
   * @returns {Promise}
   */
  async listarPorEstado(estado) {
    return this.list({ estado })
  }
}

export default new SupervisoresService()
