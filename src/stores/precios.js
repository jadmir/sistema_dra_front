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

    // ========== REPORTES ==========
    async fetchReporteComparativo(params = {}) {
      this.loading = true
      this.error = null
      try {
        console.log('🔍 [REPORTE] Consultando reporte con params:', params)
        const response = await preciosService.getReporteComparativo(params)
        console.log('📊 [REPORTE] Respuesta del backend:', response)
        console.log('📊 [REPORTE] Tipo de response:', typeof response)
        console.log('📊 [REPORTE] ¿Es array?:', Array.isArray(response))
        console.log('📊 [REPORTE] Estructura:', {
          tiene_fecha: !!response?.fecha,
          tiene_total_productos: !!response?.total_productos,
          tiene_reportes: !!response?.reportes,
          longitud_reportes: response?.reportes?.length,
        })

        // El backend devuelve directamente el objeto con fecha, total_productos y reportes
        this.reporteComparativo = response
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar reporte'
        console.error('❌ [REPORTE] Error fetching reporte:', error)
        console.error('❌ [REPORTE] Response data:', error.response?.data)
        this.reporteComparativo = null
        throw error
      } finally {
        this.loading = false
      }
    },
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
        console.log('Productos recibidos:', data)
        this.productos = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar productos'
        console.error('Error fetching productos:', error)
        this.productos = []
      } finally {
        this.loading = false
      }
    },

    async fetchCategorias() {
      try {
        const data = await preciosService.getCategorias()
        console.log('Categorías recibidas:', data)
        this.categorias = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar categorías'
        console.error('Error fetching categorias:', error)
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
        console.log('Mercados recibidos:', data)
        this.mercados = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar mercados'
        console.error('Error fetching mercados:', error)
        this.mercados = []
      } finally {
        this.loading = false
      }
    },

    async fetchUbicaciones() {
      try {
        const data = await preciosService.getUbicaciones()
        console.log('Ubicaciones recibidas:', data)
        this.ubicaciones = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar ubicaciones'
        console.error('Error fetching ubicaciones:', error)
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
        console.log('Encuestadores recibidos:', data)
        this.encuestadores = Array.isArray(data) ? data : []
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar encuestadores'
        console.error('Error fetching encuestadores:', error)
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
        this.muestras = await preciosService.getMuestras(params)
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar muestras'
        console.error('Error fetching muestras:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchMuestrasPendientes() {
      try {
        this.muestrasPendientes = await preciosService.getMuestrasPendientes()
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar muestras pendientes'
        console.error('Error fetching muestras pendientes:', error)
      }
    },

    async createMuestra(data) {
      try {
        console.log('📤 [CREATE MUESTRA] Datos a enviar:', data)
        console.log('📤 [CREATE MUESTRA] Endpoint: POST /api/precios/muestras')

        const response = await preciosService.createMuestra(data)

        console.log('✅ [CREATE MUESTRA] Respuesta exitosa:', response)

        await this.fetchMuestras()
        return true
      } catch (error) {
        console.error('❌ [CREATE MUESTRA] Error completo:', error)
        console.error('❌ [CREATE MUESTRA] Response status:', error.response?.status)
        console.error('❌ [CREATE MUESTRA] Response data:', error.response?.data)
        console.error('❌ [CREATE MUESTRA] Request data:', error.config?.data)
        console.error('❌ [CREATE MUESTRA] URL:', error.config?.url)

        this.error = error.response?.data?.message || 'Error al crear muestra'
        return false
      }
    },

    async updateMuestra(id, data) {
      try {
        await preciosService.updateMuestra(id, data)
        await this.fetchMuestras()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar muestra'
        return false
      }
    },

    async deleteMuestra(id) {
      try {
        await preciosService.deleteMuestra(id)
        await this.fetchMuestras()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar muestra'
        return false
      }
    },

    async validarMuestra(id) {
      try {
        await preciosService.validarMuestra(id)
        await this.fetchMuestras()
        await this.fetchMuestrasPendientes()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al validar muestra'
        return false
      }
    },

    async validarMuestrasLote(ids) {
      try {
        await preciosService.validarMuestrasLote(ids)
        await this.fetchMuestras()
        await this.fetchMuestrasPendientes()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al validar muestras'
        return false
      }
    },

    // ========== REPORTES ==========
    async fetchReporteComparativo(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getReporteComparativo(params)
        console.log('Reporte comparativo recibido:', response)
        // El backend devuelve directamente el objeto con fecha, total_productos y reportes
        this.reporteComparativo = response
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar reporte'
        console.error('Error fetching reporte:', error)
        this.reporteComparativo = null
        throw error
      } finally {
        this.loading = false
      }
    },

    async generarReporteComparativo(data) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.generarReporteComparativo(data)
        console.log('Reporte generado:', response)

        // Después de generar, consultar el reporte completo para obtener los datos
        if (response.fecha) {
          await this.fetchReporteComparativo({ fecha: response.fecha })
        }

        return {
          success: true,
          message: response.message,
          productos_procesados: response.productos_procesados,
          reportes_creados: response.reportes_creados,
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al generar reporte'
        console.error('Error al generar reporte:', error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async downloadReportePDF(reporteId) {
      try {
        const blob = await preciosService.exportarReportePDF(reporteId)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_precios_${reporteId}_${new Date().getTime()}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al descargar PDF'
        return false
      }
    },

    async downloadReporteExcel(reporteId) {
      try {
        const blob = await preciosService.exportarReporteExcel(reporteId)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_precios_${reporteId}_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al descargar Excel'
        return false
      }
    },

    async fetchResumenMuestras(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getResumenMuestras(params)
        console.log('Resumen de muestras recibido:', response)
        this.resumenMuestras = response
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar resumen de muestras'
        console.error('Error fetching resumen:', error)
        this.resumenMuestras = null
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchReporteHistorico(productoId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await preciosService.getReporteHistorico(productoId, params)
        console.log('Reporte histórico recibido:', response)
        this.reporteHistorico = response
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar reporte histórico'
        console.error('Error fetching histórico:', error)
        this.reporteHistorico = null
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
