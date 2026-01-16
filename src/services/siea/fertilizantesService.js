import { SieaBaseService } from './baseService'

/**
 * Servicio para gestión de fertilizantes
 *
 * Endpoints:
 * - GET /fertilizantes - Listar con paginación
 * - GET /fertilizantes/:id - Obtener detalle
 * - POST /fertilizantes - Crear nuevo fertilizante
 * - PUT /fertilizantes/:id - Actualizar fertilizante
 * - DELETE /fertilizantes/:id - Eliminar fertilizante
 * - GET /fertilizantes/activos - Listar solo activos
 * - GET /fertilizantes/buscar?q=term - Buscar por nombre o código
 * - GET /fertilizantes/tipos - Listar tipos de fertilizante
 */
class FertilizantesService extends SieaBaseService {
  constructor() {
    super('fertilizantes')
  }

  /**
   * Listar solo fertilizantes activos (sin paginación)
   * @returns {Promise} Lista de fertilizantes activos
   */
  async listarActivos() {
    try {
      // console.log('🔍 [FERTILIZANTES] Consultando fertilizantes activos...')
      // console.log('🔍 [FERTILIZANTES] URL completa:', `${this.baseUrl}`)

      // Traer todos los fertilizantes (el backend ya filtra por activos)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: {
          per_page: 1000, // Traer todos sin paginación
        },
      })

      // console.log('✅ [FERTILIZANTES] Respuesta:', {
      //   success: response.data.success,
      //   total: response.data.pagination?.total,
      //   cantidad: response.data.data?.length,
      // })

      // Extraer los datos
      const fertilizantes = response.data.data || []

      // Filtrar solo activos (por si acaso el backend retorna inactivos)
      const activos = fertilizantes.filter((f) => f.activo === true || f.activo === 1)

      // console.log(
      //   '✅ [FERTILIZANTES] Cargados:',
      //   activos.length,
      //   'activos de',
      //   fertilizantes.length,
      //   'totales',
      // )

      // Mostrar tipos encontrados
      const tipos = [...new Set(activos.map((f) => f.tipo))].sort()
      // console.log('📋 [FERTILIZANTES] Tipos encontrados:', tipos)

      return { data: activos }
    } catch (error) {
      // console.error('❌ [FERTILIZANTES] Error:', error.message)
      // console.error('❌ [FERTILIZANTES] Status:', error.response?.status)
      throw this.handleError(error)
    }
  } /**
   * Buscar fertilizantes por término
   * @param {string} termino - Término de búsqueda
   * @returns {Promise} Resultados de búsqueda
   */
  async buscar(termino) {
    try {
      // console.log('🔍 [FERTILIZANTES] Buscando:', termino)
      const response = await this.api.get(`${this.baseUrl}/buscar`, {
        params: { q: termino },
      })
      // console.log('✅ [FERTILIZANTES] Encontrados:', response.data.data?.length, 'registros')
      return response.data
    } catch (error) {
      // console.error('❌ [FERTILIZANTES] Error en búsqueda:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar fertilizantes por tipo
   * @param {string} tipo - Tipo de fertilizante (nitrogenado, fosfatado, potasico, compuesto, organico)
   * @returns {Promise} Lista de fertilizantes filtrados
   */
  async listarPorTipo(tipo) {
    try {
      // console.log('🔍 [FERTILIZANTES] Consultando por tipo:', tipo)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: { tipo },
      })
      // console.log('✅ [FERTILIZANTES] Fertilizantes encontrados:', response.data.data?.length)
      return response.data
    } catch (error) {
      // console.error('❌ [FERTILIZANTES] Error al filtrar por tipo:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar fertilizantes por composición
   * @param {string} composicion - Composición química (N-P-K)
   * @returns {Promise} Lista de fertilizantes filtrados
   */
  async listarPorComposicion(composicion) {
    try {
      // console.log('🔍 [FERTILIZANTES] Consultando por composición:', composicion)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: { composicion },
      })
      // console.log('✅ [FERTILIZANTES] Fertilizantes encontrados:', response.data.data?.length)
      return response.data
    } catch (error) {
      // console.error('❌ [FERTILIZANTES] Error al filtrar por composición:', error)
      throw this.handleError(error)
    }
  }
}

export const fertilizantesService = new FertilizantesService()
