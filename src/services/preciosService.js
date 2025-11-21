import { api } from 'src/boot/axios'

const BASE_URL = '/api/precios'

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
  async getMuestras(params = {}) {
    const response = await api.get(`${BASE_URL}/muestras`, { params })
    return response.data.data || response.data
  },

  async getMuestraById(id) {
    const response = await api.get(`${BASE_URL}/muestras/${id}`)
    return response.data.data || response.data
  },

  async createMuestra(data) {
    console.log('🔵 [SERVICIO] createMuestra - Datos recibidos:', data)
    console.log('🔵 [SERVICIO] URL completa:', `${BASE_URL}/muestras`)
    console.log('🔵 [SERVICIO] Tipo de dato precio:', typeof data.precio, data.precio)

    try {
      const response = await api.post(`${BASE_URL}/muestras`, data)
      console.log('🟢 [SERVICIO] Respuesta exitosa:', response)
      return response.data
    } catch (error) {
      console.error('🔴 [SERVICIO] Error en createMuestra:', error)
      console.error('🔴 [SERVICIO] Error response:', error.response)
      throw error
    }
  },

  async updateMuestra(id, data) {
    const response = await api.put(`${BASE_URL}/muestras/${id}`, data)
    return response.data
  },

  async deleteMuestra(id) {
    const response = await api.delete(`${BASE_URL}/muestras/${id}`)
    return response.data
  },

  async validarMuestra(id) {
    const response = await api.post(`${BASE_URL}/muestras/${id}/validar`)
    return response.data
  },

  async validarMuestrasLote(ids) {
    const response = await api.post(`${BASE_URL}/muestras/validar-lote`, { ids })
    return response.data
  },

  async getMuestrasPendientes() {
    const response = await api.get(`${BASE_URL}/muestras/pendientes`)
    return response.data.data || response.data
  },

  // ========== REPORTES ==========
  async getReporteComparativo(params = {}) {
    const response = await api.get(`${BASE_URL}/reportes/comparativo`, { params })
    return response.data.data || response.data
  },

  async generarReporteComparativo(data) {
    const response = await api.post(`${BASE_URL}/reportes/generar-comparativo`, data)
    return response.data
  },

  async getResumenMuestras(params = {}) {
    const response = await api.get(`${BASE_URL}/reportes/resumen-muestras`, { params })
    return response.data
  },

  async getReporteHistorico(productoId, params = {}) {
    const response = await api.get(`${BASE_URL}/reportes/historico/${productoId}`, { params })
    return response.data
  },

  async exportarReportePDF(reporteId) {
    const response = await api.get(`${BASE_URL}/reportes/${reporteId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  async exportarReporteExcel(reporteId) {
    const response = await api.get(`${BASE_URL}/reportes/${reporteId}/excel`, {
      responseType: 'blob',
    })
    return response.data
  },
}
