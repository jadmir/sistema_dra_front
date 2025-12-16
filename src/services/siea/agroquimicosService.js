import { SieaBaseService } from './baseService'

/**
 * Servicio para gestión de agroquímicos
 *
 * Endpoints:
 * - GET /agroquimicos - Listar con paginación
 * - GET /agroquimicos/:id - Obtener detalle
 * - POST /agroquimicos - Crear nuevo agroquímico
 * - PUT /agroquimicos/:id - Actualizar agroquímico
 * - DELETE /agroquimicos/:id - Eliminar agroquímico
 * - GET /agroquimicos/activos - Listar solo activos
 * - GET /agroquimicos/buscar?q=term - Buscar por nombre o código
 * - GET /agroquimicos/categorias - Listar categorías
 * - GET /agroquimicos/toxicologicas - Listar categorías toxicológicas
 */
class AgroquimicosService extends SieaBaseService {
  constructor() {
    super('agroquimicos')
  }

  /**
   * Listar solo agroquímicos activos (sin paginación)
   * @returns {Promise} Lista de agroquímicos activos
   */
  async listarActivos() {
    try {
      console.log('🔍 [AGROQUÍMICOS] Consultando agroquímicos activos...')
      console.log('🔍 [AGROQUÍMICOS] URL completa:', `${this.baseUrl}`)

      // Traer todos los agroquímicos (el backend ya filtra por activos)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: {
          per_page: 1000, // Traer todos sin paginación
        },
      })

      console.log('✅ [AGROQUÍMICOS] Respuesta:', {
        success: response.data.success,
        total: response.data.pagination?.total,
        cantidad: response.data.data?.length,
      })

      // Extraer los datos
      const agroquimicos = response.data.data || []

      // Filtrar solo activos (por si acaso el backend retorna inactivos)
      const activos = agroquimicos.filter((a) => a.activo === true || a.activo === 1)

      console.log(
        '✅ [AGROQUÍMICOS] Cargados:',
        activos.length,
        'activos de',
        agroquimicos.length,
        'totales',
      )

      // Mostrar tipos encontrados
      const tipos = [...new Set(activos.map((a) => a.tipo))].sort()
      console.log('📋 [AGROQUÍMICOS] Tipos encontrados:', tipos)

      return { data: activos }
    } catch (error) {
      console.error('❌ [AGROQUÍMICOS] Error:', error.message)
      console.error('❌ [AGROQUÍMICOS] Status:', error.response?.status)
      throw this.handleError(error)
    }
  } /**
   * Buscar agroquímicos por término
   * @param {string} termino - Término de búsqueda
   * @returns {Promise} Resultados de búsqueda
   */
  async buscar(termino) {
    try {
      console.log('🔍 [AGROQUÍMICOS] Buscando:', termino)
      const response = await this.api.get(`${this.baseUrl}/buscar`, {
        params: { q: termino },
      })
      console.log('✅ [AGROQUÍMICOS] Encontrados:', response.data.data?.length, 'registros')
      return response.data
    } catch (error) {
      console.error('❌ [AGROQUÍMICOS] Error en búsqueda:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar categorías de agroquímicos
   * @returns {Promise} Lista de categorías (insecticidas, fungicidas, herbicidas, etc.)
   */
  async listarCategorias() {
    try {
      console.log('🔍 [AGROQUÍMICOS] Consultando categorías...')
      const response = await this.api.get(`${this.baseUrl}/categorias`)
      console.log('✅ [AGROQUÍMICOS] Categorías obtenidas:', response.data.data?.length)
      return response.data
    } catch (error) {
      console.error('❌ [AGROQUÍMICOS] Error al obtener categorías:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar categorías toxicológicas
   * @returns {Promise} Lista de categorías toxicológicas (I, II, III, IV)
   */
  async listarCategoriasToxico() {
    try {
      console.log('🔍 [AGROQUÍMICOS] Consultando categorías toxicológicas...')
      const response = await this.api.get(`${this.baseUrl}/toxicologicas`)
      console.log(
        '✅ [AGROQUÍMICOS] Categorías toxicológicas obtenidas:',
        response.data.data?.length,
      )
      return response.data
    } catch (error) {
      console.error('❌ [AGROQUÍMICOS] Error al obtener categorías toxicológicas:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar agroquímicos por categoría
   * @param {string} categoria - Categoría (insecticida, fungicida, herbicida, etc.)
   * @returns {Promise} Lista de agroquímicos filtrados
   */
  async listarPorCategoria(categoria) {
    try {
      console.log('🔍 [AGROQUÍMICOS] Consultando por categoría:', categoria)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: { categoria },
      })
      console.log('✅ [AGROQUÍMICOS] Agroquímicos encontrados:', response.data.data?.length)
      return response.data
    } catch (error) {
      console.error('❌ [AGROQUÍMICOS] Error al filtrar por categoría:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar agroquímicos por categoría toxicológica
   * @param {string} categoriaToxico - Categoría toxicológica (I, II, III, IV)
   * @returns {Promise} Lista de agroquímicos filtrados
   */
  async listarPorCategoriaToxico(categoriaToxico) {
    try {
      console.log('🔍 [AGROQUÍMICOS] Consultando por categoría toxicológica:', categoriaToxico)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: { categoria_toxicologica: categoriaToxico },
      })
      console.log('✅ [AGROQUÍMICOS] Agroquímicos encontrados:', response.data.data?.length)
      return response.data
    } catch (error) {
      console.error('❌ [AGROQUÍMICOS] Error al filtrar por categoría toxicológica:', error)
      throw this.handleError(error)
    }
  }
}

export const agroquimicosService = new AgroquimicosService()
