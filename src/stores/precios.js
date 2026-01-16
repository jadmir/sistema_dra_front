import { defineStore } from 'pinia'
import { preciosService } from 'src/services/preciosService'

export const usePreciosStore = defineStore('precios', {
  state: () => ({
    // Productos
    productos: [],
    categorias: [],

    // Mercados
    mercados: [],
    ubicaciones: [],

    // Encuestadores
    encuestadores: [],

    // Muestras
    muestras: [],
    muestrasPendientes: [],

    // Reportes
    reporteComparativo: null,
    reporteHistorico: null,
    resumenMuestras: null,

    // Estados
    loading: false,
    error: null,
  }),

  actions: {
    // ========== PRODUCTOS ==========
    async fetchProductos() {
      this.loading = true
      this.error = null
      try {
        const data = await preciosService.getProductos()
        // console.log('Productos recibidos:', data)
        this.productos = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar productos'
        // console.error('Error fetching productos:', error)
        this.productos = []
      } finally {
        this.loading = false
      }
    },

    async fetchCategorias() {
      try {
        const data = await preciosService.getCategorias()
        // console.log('Categorías recibidas:', data)
        this.categorias = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar categorías'
        // console.error('Error fetching categorias:', error)
        this.categorias = []
      }
    },

    async createCategoria(data) {
      try {
        await preciosService.createCategoria(data)
        await this.fetchCategorias()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear categoría'
        return false
      }
    },

    async updateCategoria(id, data) {
      try {
        await preciosService.updateCategoria(id, data)
        await this.fetchCategorias()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar categoría'
        return false
      }
    },

    async deleteCategoria(id) {
      try {
        await preciosService.deleteCategoria(id)
        await this.fetchCategorias()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar categoría'
        return false
      }
    },

    async createProducto(data) {
      try {
        await preciosService.createProducto(data)
        await this.fetchProductos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear producto'
        return false
      }
    },

    async updateProducto(id, data) {
      try {
        await preciosService.updateProducto(id, data)
        await this.fetchProductos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar producto'
        return false
      }
    },

    async deleteProducto(id) {
      try {
        await preciosService.deleteProducto(id)
        await this.fetchProductos()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar producto'
        return false
      }
    },

    // ========== MERCADOS ==========
    async fetchMercados() {
      this.loading = true
      this.error = null
      try {
        const data = await preciosService.getMercados()
        // console.log('Mercados recibidos:', data)
        this.mercados = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar mercados'
        // console.error('Error fetching mercados:', error)
        this.mercados = []
      } finally {
        this.loading = false
      }
    },

    async fetchUbicaciones() {
      try {
        const data = await preciosService.getUbicaciones()
        // console.log('Ubicaciones recibidas:', data)
        this.ubicaciones = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar ubicaciones'
        // console.error('Error fetching ubicaciones:', error)
        this.ubicaciones = []
      }
    },

    async createMercado(data) {
      try {
        await preciosService.createMercado(data)
        await this.fetchMercados()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear mercado'
        return false
      }
    },

    async updateMercado(id, data) {
      try {
        await preciosService.updateMercado(id, data)
        await this.fetchMercados()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar mercado'
        return false
      }
    },

    async deleteMercado(id) {
      try {
        await preciosService.deleteMercado(id)
        await this.fetchMercados()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar mercado'
        return false
      }
    },

    // ========== ENCUESTADORES ==========
    async fetchEncuestadores() {
      this.loading = true
      this.error = null
      try {
        const data = await preciosService.getEncuestadores()
        // console.log('Encuestadores recibidos:', data)
        this.encuestadores = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar encuestadores'
        // console.error('Error fetching encuestadores:', error)
        this.encuestadores = []
      } finally {
        this.loading = false
      }
    },

    async createEncuestador(data) {
      try {
        await preciosService.createEncuestador(data)
        await this.fetchEncuestadores()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear encuestador'
        return false
      }
    },

    async updateEncuestador(id, data) {
      try {
        await preciosService.updateEncuestador(id, data)
        await this.fetchEncuestadores()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar encuestador'
        return false
      }
    },

    async deleteEncuestador(id) {
      try {
        await preciosService.deleteEncuestador(id)
        await this.fetchEncuestadores()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar encuestador'
        return false
      }
    },

    // ========== MUESTRAS ==========
    async fetchMuestras(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getMuestras(params)
        this.muestras = response.data || response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar muestras'
        // console.error('Error fetching muestras:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchMuestrasPendientes() {
      try {
        const response = await preciosService.getMuestrasPendientes()
        this.muestrasPendientes = response.data?.data || response.data || response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar muestras pendientes'
        // console.error('Error fetching muestras pendientes:', error)
      }
    },

    async createMuestra(data) {
      try {
        const response = await preciosService.createMuestra(data)
        await this.fetchMuestras()
        return response
      } catch (error) {
        // console.error('❌ [CREATE MUESTRA] Error:', error)
        this.error = error.response?.data?.message || 'Error al crear muestra'
        throw error
      }
    },

    async updateMuestra(id, data) {
      try {
        const response = await preciosService.updateMuestra(id, data)
        await this.fetchMuestras()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar muestra'
        throw error
      }
    },

    async deleteMuestra(id) {
      try {
        const response = await preciosService.deleteMuestra(id)
        await this.fetchMuestras()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar muestra'
        throw error
      }
    },

    /**
     * Validar muestra individual con observaciones
     * @param {number} id - ID de la muestra
     * @param {string} observaciones - Observaciones de validación
     */
    async validarMuestra(id, observaciones = null) {
      try {
        const response = await preciosService.validarMuestra(id, observaciones)
        await this.fetchMuestras()
        await this.fetchMuestrasPendientes()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al validar muestra'
        throw error
      }
    },

    /**
     * Validar múltiples muestras en lote
     * @param {Array} muestra_ids - Array de IDs de muestras
     * @param {string} observaciones - Observaciones de validación
     */
    async validarMuestrasLote(muestra_ids, observaciones = null) {
      try {
        const response = await preciosService.validarMuestrasLote(muestra_ids, observaciones)
        await this.fetchMuestras()
        await this.fetchMuestrasPendientes()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al validar muestras'
        throw error
      }
    },

    // ========== REPORTES ==========
    /**
     * Obtener reporte comparativo de precios
     * @param {Object} params - producto_id, mercado_id, fecha_desde, fecha_hasta, agrupar_por
     */
    async fetchReporteComparativo(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getReporteComparativo(params)
        this.reporteComparativo = response.data || response
        return this.reporteComparativo
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar reporte'
        // console.error('Error fetching reporte:', error)
        this.reporteComparativo = null
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener resumen de muestras por periodo
     * @param {Object} params - fecha_desde, fecha_hasta, encuestador_id, mercado_id
     */
    async fetchResumenMuestras(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getResumenMuestras(params)
        this.resumenMuestras = response.data || response
        return this.resumenMuestras
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar resumen'
        // console.error('Error fetching resumen:', error)
        this.resumenMuestras = null
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener histórico de precios de un producto
     * @param {number} productoId - ID del producto
     * @param {Object} params - fecha_desde, fecha_hasta, mercado_id, intervalo
     */
    async fetchReporteHistorico(productoId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getReporteHistorico(productoId, params)
        this.reporteHistorico = response.data || response
        return this.reporteHistorico
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar histórico'
        // console.error('Error fetching histórico:', error)
        this.reporteHistorico = null
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Descargar reporte comparativo en formato específico
     * @param {string} formato - 'pdf' o 'excel'
     * @param {Object} filtros - Filtros del reporte
     */
    async descargarReporte(formato, filtros) {
      this.loading = true
      try {
        const nombreArchivo = await preciosService.descargarReporte(formato, filtros)
        return { success: true, nombreArchivo }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al descargar reporte'
        // console.error('Error al descargar:', error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
