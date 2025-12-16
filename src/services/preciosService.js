import { api } from 'src/boot/axios'

const BASE_URL = '/precios'

export const preciosService = {
  // ========== PRODUCTOS ==========
  async getProductos() {
    const response = await api.get(`${BASE_URL}/productos`)
    return response.data.data || response.data
  },

  async getProductoById(id) {
    const response = await api.get(`${BASE_URL}/productos/${id}`)
    return response.data.data || response.data
  },

  async createProducto(data) {
    const response = await api.post(`${BASE_URL}/productos`, data)
    return response.data
  },

  async updateProducto(id, data) {
    const response = await api.put(`${BASE_URL}/productos/${id}`, data)
    return response.data
  },

  async deleteProducto(id) {
    const response = await api.delete(`${BASE_URL}/productos/${id}`)
    return response.data
  },

  // ========== CATEGORÍAS ==========
  async getCategorias() {
    const response = await api.get(`${BASE_URL}/categorias`)
    return response.data.data || response.data
  },

  async getCategoriaById(id) {
    const response = await api.get(`${BASE_URL}/categorias/${id}`)
    return response.data.data || response.data
  },

  async createCategoria(data) {
    const response = await api.post(`${BASE_URL}/categorias`, data)
    return response.data
  },

  async updateCategoria(id, data) {
    const response = await api.put(`${BASE_URL}/categorias/${id}`, data)
    return response.data
  },

  async deleteCategoria(id) {
    const response = await api.delete(`${BASE_URL}/categorias/${id}`)
    return response.data
  },

  // ========== MERCADOS ==========
  async getMercados() {
    const response = await api.get(`${BASE_URL}/mercados`)
    return response.data.data || response.data
  },

  async getMercadoById(id) {
    const response = await api.get(`${BASE_URL}/mercados/${id}`)
    return response.data.data || response.data
  },

  async createMercado(data) {
    const response = await api.post(`${BASE_URL}/mercados`, data)
    return response.data
  },

  async updateMercado(id, data) {
    const response = await api.put(`${BASE_URL}/mercados/${id}`, data)
    return response.data
  },

  async deleteMercado(id) {
    const response = await api.delete(`${BASE_URL}/mercados/${id}`)
    return response.data
  },

  // ========== UBICACIONES ==========
  async getUbicaciones() {
    const response = await api.get(`${BASE_URL}/ubicaciones`)
    return response.data.data || response.data
  },

  // ========== ENCUESTADORES ==========
  async getEncuestadores() {
    const response = await api.get(`${BASE_URL}/encuestadores`)
    return response.data.data || response.data
  },

  async getEncuestadorById(id) {
    const response = await api.get(`${BASE_URL}/encuestadores/${id}`)
    return response.data.data || response.data
  },

  async createEncuestador(data) {
    const response = await api.post(`${BASE_URL}/encuestadores`, data)
    return response.data
  },

  async updateEncuestador(id, data) {
    const response = await api.put(`${BASE_URL}/encuestadores/${id}`, data)
    return response.data
  },

  async deleteEncuestador(id) {
    const response = await api.delete(`${BASE_URL}/encuestadores/${id}`)
    return response.data
  },

  // ========== MUESTRAS ==========
  /**
   * Listar muestras con filtros y paginación
   * @param {Object} params - Filtros: page, per_page, search, producto_id, mercado_id, encuestador_id, fecha_desde, fecha_hasta, estado
   */
  async getMuestras(params = {}) {
    const response = await api.get(`${BASE_URL}/muestras`, { params })
    return response.data
  },

  /**
   * Obtener detalle de una muestra
   */
  async getMuestraById(id) {
    const response = await api.get(`${BASE_URL}/muestras/${id}`)
    return response.data
  },

  /**
   * Crear nueva muestra de precio
   * @param {Object} data - producto_id, mercado_id, encuestador_id, fecha_registro, precio_minimo, precio_maximo, precio_frecuente, unidad_medida, cantidad_muestra, observaciones
   */
  async createMuestra(data) {
    const response = await api.post(`${BASE_URL}/muestras`, data)
    return response.data
  },

  /**
   * Actualizar muestra (solo si está en estado pendiente)
   */
  async updateMuestra(id, data) {
    const response = await api.put(`${BASE_URL}/muestras/${id}`, data)
    return response.data
  },

  /**
   * Eliminar muestra (solo si está en estado pendiente)
   */
  async deleteMuestra(id) {
    const response = await api.delete(`${BASE_URL}/muestras/${id}`)
    return response.data
  },

  /**
   * Validar muestra individual
   * @param {number} id - ID de la muestra
   * @param {string} observaciones_validacion - Observaciones opcionales
   */
  async validarMuestra(id, observaciones_validacion = null) {
    const response = await api.post(`${BASE_URL}/muestras/${id}/validar`, {
      observaciones_validacion,
    })
    return response.data
  },

  /**
   * Validar múltiples muestras en lote
   * @param {Array} muestra_ids - Array de IDs de muestras
   * @param {string} observaciones_validacion - Observaciones opcionales
   */
  async validarMuestrasLote(muestra_ids, observaciones_validacion = null) {
    const response = await api.post(`${BASE_URL}/muestras/validar-lote`, {
      muestra_ids,
      observaciones_validacion,
    })
    return response.data
  },

  /**
   * Obtener muestras pendientes de validación
   */
  async getMuestrasPendientes() {
    const response = await api.get(`${BASE_URL}/muestras`, {
      params: { estado: 'pendiente' },
    })
    return response.data
  },

  // ========== REPORTES ==========
  /**
   * Obtener reporte comparativo de precios
   * @param {Object} params - producto_id (req), mercado_id, fecha_desde (req), fecha_hasta (req), agrupar_por (dia/semana/mes)
   */
  async getReporteComparativo(params = {}) {
    const response = await api.get(`${BASE_URL}/reportes/comparativo`, { params })
    return response.data
  },

  /**
   * Generar y descargar reporte comparativo en PDF o Excel
   * @param {Object} data - producto_ids[], fecha_desde, fecha_hasta, formato (pdf/excel), incluir_graficos, agrupar_por
   * @returns {Blob} Archivo descargable
   */
  async generarReporteComparativo(data) {
    const response = await api.post(`${BASE_URL}/reportes/generar-comparativo`, data, {
      responseType: 'blob',
    })
    return response
  },

  /**
   * Obtener resumen de muestras por periodo
   * @param {Object} params - fecha_desde, fecha_hasta, encuestador_id, mercado_id
   */
  async getResumenMuestras(params = {}) {
    const response = await api.get(`${BASE_URL}/reportes/resumen-muestras`, { params })
    return response.data
  },

  /**
   * Obtener histórico de precios de un producto
   * @param {number} productoId - ID del producto
   * @param {Object} params - fecha_desde, fecha_hasta, mercado_id, intervalo (dia/semana/mes)
   */
  async getReporteHistorico(productoId, params = {}) {
    const response = await api.get(`${BASE_URL}/reportes/historico/${productoId}`, { params })
    return response.data
  },

  /**
   * Descargar reporte en formato específico
   * @param {string} formato - 'pdf' o 'excel'
   * @param {Object} filtros - Filtros del reporte
   */
  async descargarReporte(formato, filtros) {
    const response = await api.post(
      `${BASE_URL}/reportes/generar-comparativo`,
      { ...filtros, formato },
      { responseType: 'blob' },
    )

    // Crear nombre de archivo
    const fecha = new Date().toISOString().split('T')[0]
    const extension = formato === 'excel' ? 'xlsx' : 'pdf'
    const nombreArchivo = `reporte_comparativo_${fecha}.${extension}`

    // Descargar archivo
    const blob = new Blob([response.data], {
      type:
        formato === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return nombreArchivo
  },
}
