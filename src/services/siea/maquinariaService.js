import { SieaBaseService } from './baseService'

/**
 * Servicio para gestión de maquinaria agrícola
 *
 * Endpoints:
 * - GET /maquinaria - Listar con paginación
 * - GET /maquinaria/:id - Obtener detalle
 * - POST /maquinaria - Crear nueva maquinaria
 * - PUT /maquinaria/:id - Actualizar maquinaria
 * - DELETE /maquinaria/:id - Eliminar maquinaria
 * - GET /maquinaria/activos - Listar solo activos
 * - GET /maquinaria/buscar?q=term - Buscar por nombre o código
 * - GET /maquinaria/tipos - Listar tipos de maquinaria
 */
class MaquinariaService extends SieaBaseService {
  constructor() {
    super('maquinaria')
  }

  /**
   * Listar solo maquinaria activa (sin paginación)
   * @returns {Promise} Lista de maquinaria activa
   */
  async listarActivos() {
    try {
      console.log('🔍 [MAQUINARIA] Consultando maquinaria activa...')
      console.log('🔍 [MAQUINARIA] URL completa:', `${this.baseUrl}`)

      // El endpoint no tiene /activos, usar el endpoint base sin paginación
      const response = await this.api.get(`${this.baseUrl}`, {
        params: {
          per_page: 1000, // Traer todos
          activo: 1, // Solo activos
        },
      })

      const maquinaria = response.data.data || response.data || []

      // Filtrar solo activos en el frontend por si acaso
      const activos = maquinaria.filter((m) => {
        if (m.activo === undefined || m.activo === null) return true
        return m.activo === true || m.activo === 1
      })

      console.log(
        '✅ [MAQUINARIA] Maquinaria activa obtenida:',
        activos.length,
        'de',
        maquinaria.length,
        'registros',
      )
      return { data: activos }
    } catch (error) {
      console.error('❌ [MAQUINARIA] Error al obtener activos:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Buscar maquinaria por término
   * @param {string} termino - Término de búsqueda
   * @returns {Promise} Resultados de búsqueda
   */
  async buscar(termino) {
    try {
      console.log('🔍 [MAQUINARIA] Buscando:', termino)
      const response = await this.api.get(`${this.baseUrl}/buscar`, {
        params: { q: termino },
      })
      console.log('✅ [MAQUINARIA] Encontrados:', response.data.data?.length, 'registros')
      return response.data
    } catch (error) {
      console.error('❌ [MAQUINARIA] Error en búsqueda:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar tipos de maquinaria disponibles
   * @returns {Promise} Lista de tipos
   */
  async listarTipos() {
    try {
      console.log('🔍 [MAQUINARIA] Consultando tipos...')
      const response = await this.api.get(`${this.baseUrl}/tipos`)
      console.log('✅ [MAQUINARIA] Tipos obtenidos:', response.data.data?.length)
      return response.data
    } catch (error) {
      console.error('❌ [MAQUINARIA] Error al obtener tipos:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Listar maquinaria por tipo
   * @param {string} tipo - Tipo de maquinaria
   * @returns {Promise} Lista de maquinaria filtrada
   */
  async listarPorTipo(tipo) {
    try {
      console.log('🔍 [MAQUINARIA] Consultando por tipo:', tipo)
      const response = await this.api.get(`${this.baseUrl}`, {
        params: { tipo },
      })
      console.log('✅ [MAQUINARIA] Maquinaria encontrada:', response.data.data?.length)
      return response.data
    } catch (error) {
      console.error('❌ [MAQUINARIA] Error al filtrar por tipo:', error)
      throw this.handleError(error)
    }
  }
}

export const maquinariaService = new MaquinariaService()
