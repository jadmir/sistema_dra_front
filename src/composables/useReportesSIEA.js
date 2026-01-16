import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

/**
 * Composable genérico para reportes SIEA
 * @param {string} formulario - 'maquinaria' | 'fertilizantes' | 'agroquimicos' | 'transporte'
 * @returns {Object} Funciones y estado para manejar reportes
 */
export function useReportesSIEA(formulario) {
  const $q = useQuasar()

  const loading = ref(false)
  const exportandoExcel = ref(false)
  const exportandoPDF = ref(false)
  const datos = ref([])
  const meta = ref(null)
  const filtros = ref({
    mes: null, // Obligatorio
    ano: null, // Obligatorio
    region: null,
    provincia: null,
    distrito: null,
    tipo: null,
    producto: null,
  })

  // Códigos de formulario
  const codigosFormulario = {
    maquinaria: 'F-1',
    fertilizantes: 'F-4',
    agroquimicos: 'F-6',
    transporte: 'F-14',
  }

  /**
   * Construir parámetros de query eliminando valores vacíos
   * @param {Object} filtrosParam - Filtros a usar (null = usar filtros.value)
   * @param {Boolean} convertirFechas - Si true, convierte mes/ano a fecha_inicio/fecha_fin
   * @param {Boolean} incluirMesAno - Si true, incluye mes/ano además de las fechas (para exportaciones)
   */
  function buildParams(filtrosParam = null, convertirFechas = false, incluirMesAno = false) {
    // console.log(
    //   `🔧 buildParams() llamado con convertirFechas=${convertirFechas}, incluirMesAno=${incluirMesAno}`,
    // )
    const filtrosAUsar = filtrosParam || filtros.value
    const params = {}

    // console.log(`🔍 [DEBUG] filtrosAUsar completo:`, filtrosAUsar)
    // console.log(`🔍 [DEBUG] filtrosAUsar.mes:`, filtrosAUsar.mes, typeof filtrosAUsar.mes)
    // console.log(`🔍 [DEBUG] filtrosAUsar.ano:`, filtrosAUsar.ano, typeof filtrosAUsar.ano)
    // console.log(`🔍 [DEBUG] convertirFechas:`, convertirFechas)

    // Si se pide convertir a fechas y tenemos mes/ano
    if (convertirFechas && filtrosAUsar.mes && filtrosAUsar.ano) {
      // console.log(`📅 CONVIRTIENDO: mes=${filtrosAUsar.mes}, ano=${filtrosAUsar.ano}`)
      const mes = parseInt(filtrosAUsar.mes)
      const ano = parseInt(filtrosAUsar.ano)

      // Primer día del mes
      params.fecha_inicio = `${ano}-${String(mes).padStart(2, '0')}-01`

      // Último día del mes
      // IMPORTANTE: En JavaScript los meses van de 0-11, pero nosotros usamos 1-12
      // Por eso usamos 'mes' directamente (sin restar 1) como segundo parámetro
      // y 0 como día para obtener el último día del mes anterior (que es el mes actual)
      const ultimoDia = new Date(ano, mes, 0).getDate()
      params.fecha_fin = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

      // console.log(`📅 Convertido mes=${mes} año=${ano} a:`, {
      //   fecha_inicio: params.fecha_inicio,
      //   fecha_fin: params.fecha_fin,
      //   ultimoDia: ultimoDia,
      // })

      // Si se pide incluir mes/ano (para exportaciones), los agregamos también
      if (incluirMesAno) {
        params.mes = mes
        params.ano = ano
        // console.log(`📅 INCLUYENDO mes/ano para exportación:`, { mes, ano })
      }
    }

    // Agregar el resto de parámetros
    Object.keys(filtrosAUsar).forEach((key) => {
      // Si ya convertimos fechas Y no se pide incluir mes/ano, omitirlos
      if (convertirFechas && !incluirMesAno && (key === 'mes' || key === 'ano')) {
        // console.log(`📅 Omitiendo ${key} porque ya se convirtió a fechas (y no se pidió incluirlo)`)
        return
      }

      if (filtrosAUsar[key] !== null && filtrosAUsar[key] !== '') {
        params[key] = filtrosAUsar[key]
      }
    })

    // console.log(`📅 Params finales después de buildParams:`, params)
    return params
  }

  /**
   * Consultar precios
   * @param {Object} filtrosParam - Filtros opcionales (si no se pasan, usa filtros.value)
   */
  async function consultarPrecios(filtrosParam = null) {
    loading.value = true
    try {
      // IMPORTANTE: También convertir a fechas para la consulta
      const params = buildParams(filtrosParam, true)
      // console.log(`📊 [${codigosFormulario[formulario]}] Consultando con params:`, params)

      // Construir URL para debugging
      // const urlParams = new URLSearchParams(params)
      // const fullUrl = `/agri/reportes/precios-${formulario}?${urlParams.toString()}`
      // console.log(`🌐 URL COMPLETA: ${fullUrl}`)

      const response = await api.get(`/agri/reportes/precios-${formulario}`, { params })

      // ============================================================================
      // 📊 RESUMEN DE RESPUESTA DEL BACKEND
      // ============================================================================
      // console.log(`\n${'='.repeat(80)}`)
      // console.log(`� [${codigosFormulario[formulario]}] RESPUESTA DEL BACKEND RECIBIDA`)
      // console.log(`${'='.repeat(80)}`)
      // console.log(`📊 Status: ${response.status} ${response.statusText}`)
      // console.log(`📊 Keys disponibles:`, Object.keys(response.data))
      // console.log(`📊 Respuesta completa:`, JSON.stringify(response.data, null, 2))

      // Contar elementos en cada array posible
      // const conteos = {
      //   precios_por_tipo: Array.isArray(response.data.precios_por_tipo)
      //     ? response.data.precios_por_tipo.length
      //     : 0,
      //   precios_por_fertilizante: Array.isArray(response.data.precios_por_fertilizante)
      //     ? response.data.precios_por_fertilizante.length
      //     : 0,
      //   precios_por_agroquimico: Array.isArray(response.data.precios_por_agroquimico)
      //     ? response.data.precios_por_agroquimico.length
      //     : 0,
      //   precios_por_transporte: Array.isArray(response.data.precios_por_transporte)
      //     ? response.data.precios_por_transporte.length
      //     : 0,
      //   precios_por_ruta: Array.isArray(response.data.precios_por_ruta)
      //     ? response.data.precios_por_ruta.length
      //     : 0,
      // }

      // console.log(`\n📊 CONTEO DE ELEMENTOS POR ARRAY:`)
      // Object.entries(conteos).forEach(([key, count]) => {
      //   const icon = count > 0 ? '✅' : '❌'
      //   console.log(`   ${icon} ${key}: ${count} elementos`)
      // })
      // console.log(`${'='.repeat(80)}\n`)

      // Detectar el array de precios según el formulario
      const preciosArray =
        response.data.precios_por_tipo ||
        response.data.precios_por_fertilizante ||
        response.data.precios_por_agroquimico ||
        response.data.precios_por_transporte ||
        response.data.precios_por_ruta ||
        null

      // console.log(`\n🔍 DETECCIÓN DE ARRAY DE PRECIOS:`)
      // console.log(`   Buscando para formulario: "${formulario}"`)
      // console.log(`   Array detectado:`, preciosArray ? '✅ SÍ' : '❌ NO')
      if (preciosArray) {
        // console.log(`   Es un array: ${Array.isArray(preciosArray) ? '✅ SÍ' : '❌ NO'}`)
        // console.log(`   Cantidad de elementos: ${preciosArray?.length || 0}`)
        if (preciosArray.length > 0) {
          // console.log(`   Primer elemento (muestra):`, preciosArray[0])
        }
      } else {
        // console.log(`   ⚠️ NO SE ENCONTRÓ ningún array de precios en la respuesta`)
        // console.log(`   Estructura recibida:`, Object.keys(response.data))
      }
      // console.log(``)

      if (response.data && preciosArray) {
        // Estructura backend: { periodo, resumen, precios_por_*, comparativo_por_* }
        // console.log(`📊 [${codigosFormulario[formulario]}] Array de precios detectado`)
        // console.log(`📊 [${codigosFormulario[formulario]}] Datos recibidos:`, preciosArray)

        // Los datos vienen en el array de precios
        datos.value = preciosArray.map((item) => {
          // console.log(`📊 [${codigosFormulario[formulario]}] Procesando item:`, item)

          // Detectar si los precios están en "estadisticas" o directamente en el item
          const precios = item.estadisticas || item

          // Detectar ID según el formulario
          const itemId =
            item[`tipo_${formulario}_id`] ||
            item.maquinaria_id ||
            item.fertilizante_id ||
            item.agroquimico_id ||
            item.transporte_id ||
            item.id ||
            Math.random()

          // Detectar nombre según el formulario
          const itemNombre =
            item.ruta || item.nombre || item.nombre_comercial || item.descripcion || 'N/A'

          // Detectar categoría/tipo según el formulario
          const itemCategoria = item.tipo_vehiculo || item.categoria || item.tipo || 'N/A'

          const registro = {
            id: itemId,
            // Ubicación (desde filtros o desde el item)
            region: item.region || filtros.value.region || 'Nacional',
            provincia: item.provincia || filtros.value.provincia || 'Todas',
            distrito: item.distrito || filtros.value.distrito || 'Todos',
            // Período (desde response.data.periodo o desde filtros)
            mes_nombre: (() => {
              const mesValue = response.data.periodo?.mes || filtros.value.mes
              // console.log(
              //   `📅 Obteniendo mes_nombre: response.data.periodo?.mes=${response.data.periodo?.mes}, filtros.value.mes=${filtros.value.mes}, mesValue=${mesValue}`,
              // )
              const nombre = getMesNombre(mesValue)
              // console.log(`📅 getMesNombre(${mesValue}) = ${nombre}`)
              return nombre || 'N/A'
            })(),
            ano: response.data.periodo?.ano || filtros.value.ano || new Date().getFullYear(),
            // Producto
            producto_categoria: itemCategoria,
            producto_nombre: itemNombre,
            producto_marca: item.marca || '',
            // Precios (desde estadisticas o directamente del item)
            precio_minimo: parseFloat(precios.precio_minimo || 0),
            precio_promedio: parseFloat(
              precios.precio_promedio || precios.precio_promedio_viaje || 0,
            ),
            precio_maximo: parseFloat(precios.precio_maximo || 0),
            // Observaciones
            observaciones: `${precios.num_registros || item.num_registros || 0} registros`,
            // Tendencia
            tendencia_direccion: item.tendencia?.direccion || 'estable',
            tendencia_cambio: item.tendencia?.cambio_porcentual || 0,
          }

          // console.log(
          //   `📊 [${codigosFormulario[formulario]}] Registro procesado ${index}:`,
          //   registro,
          // )
          return registro
        })

        // Meta con información del resumen
        meta.value = {
          total: response.data.resumen?.total_registros || datos.value.length,
          productos_distintos: response.data.resumen?.tipos_distintos || datos.value.length,
          precio_promedio_general: calcularPromedio(datos.value, 'precio_promedio'),
          precio_minimo_general:
            datos.value.length > 0
              ? Math.min(...datos.value.map((d) => d.precio_minimo).filter((p) => p > 0))
              : 0,
          precio_maximo_general:
            datos.value.length > 0 ? Math.max(...datos.value.map((d) => d.precio_maximo)) : 0,
        }

        // console.log(`📊 [${codigosFormulario[formulario]}] Total registros:`, datos.value.length)
        // console.log(`📊 [${codigosFormulario[formulario]}] Datos procesados:`, datos.value)
        // console.log(`📊 [${codigosFormulario[formulario]}] Meta:`, meta.value)

        if (datos.value.length > 0) {
          $q.notify({
            type: 'positive',
            message: `Se encontraron ${datos.value.length} tipos de ${formulario}`,
            icon: 'check_circle',
            position: 'top-right',
          })
        } else {
          $q.notify({
            type: 'warning',
            message: 'No hay datos disponibles con los filtros seleccionados',
            icon: 'info',
            position: 'top-right',
          })
        }
      } else {
        // console.warn(`⚠️ [${codigosFormulario[formulario]}] Estructura desconocida:`, response.data)
        datos.value = []
        meta.value = null
        $q.notify({
          type: 'warning',
          message: 'No se encontraron datos',
          icon: 'info',
          position: 'top-right',
        })
      }
    } catch (error) {
      // console.error(`❌ [${codigosFormulario[formulario]}] Error:`, error)
      // console.error(`❌ [${codigosFormulario[formulario]}] Response data:`, error.response?.data)
      // console.error(`❌ [${codigosFormulario[formulario]}] Status:`, error.response?.status)

      // Si es 404 con mensaje de "sin datos", tratarlo como warning, no error
      if (error.response?.status === 404) {
        const mensaje = error.response?.data?.message || ''
        if (mensaje.includes('No hay datos') || mensaje.includes('disponibles')) {
          $q.notify({
            type: 'info',
            message: mensaje || 'No hay datos disponibles para el periodo seleccionado',
            icon: 'info',
            position: 'top-right',
            timeout: 4000,
          })
        } else {
          manejarError(error)
        }
      } else {
        manejarError(error)
      }

      datos.value = []
      meta.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener nombre del mes
   */
  function getMesNombre(mes) {
    if (!mes || mes < 1 || mes > 12) return null

    const meses = [
      '',
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ]
    return meses[mes]
  }

  /**
   * Calcular promedio
   */
  function calcularPromedio(array, campo) {
    if (array.length === 0) return 0
    const suma = array.reduce((acc, item) => acc + (parseFloat(item[campo]) || 0), 0)
    return suma / array.length
  }

  /**
   * Exportar a Excel
   * @param {Object} filtrosParam - Filtros opcionales (si no se pasan, usa filtros.value)
   */
  async function exportarExcel(filtrosParam = null) {
    exportandoExcel.value = true
    try {
      // IMPORTANTE: Incluir mes/ano Y fechas para que el backend use lo que necesite
      const params = buildParams(filtrosParam, true, true)
      // console.log(`📥 [${codigosFormulario[formulario]}] Exportando Excel con params:`, params)

      // Usar la ruta correcta del backend: {formulario}-export
      const response = await api.get(`/agri/reportes/${formulario}-export`, {
        params,
        responseType: 'blob',
        // onDownloadProgress: (progressEvent) => {
        //   const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        //   console.log(`📥 Descargando Excel: ${percent}%`)
        // },
      })

      if (!(response.data instanceof Blob)) {
        throw new Error('La respuesta no es un archivo válido')
      }

      // Verificar si el blob es realmente un JSON de error
      if (response.data.type === 'application/json') {
        const text = await response.data.text()
        const error = JSON.parse(text)
        // console.error(`❌ [${codigosFormulario[formulario]}] Error del backend:`, error)
        throw new Error(error.message || 'Error al generar el archivo')
      }

      descargarArchivo(response.data, 'excel', formulario)

      // console.log(`✅ [${codigosFormulario[formulario]}] Excel exportado exitosamente`)

      $q.notify({
        type: 'positive',
        message: 'Excel generado correctamente',
        icon: 'download',
        position: 'top-right',
        timeout: 3000,
      })
    } catch (error) {
      // console.error(`❌ [${codigosFormulario[formulario]}] Error al exportar Excel:`, error)
      await manejarErrorExportacion(error, 'Excel')
    } finally {
      exportandoExcel.value = false
    }
  }

  /**
   * Exportar a PDF
   * @param {Object} filtrosParam - Filtros opcionales (si no se pasan, usa filtros.value)
   */
  async function exportarPDF(filtrosParam = null) {
    exportandoPDF.value = true
    try {
      // IMPORTANTE: Incluir mes/ano Y fechas para que el backend use lo que necesite
      const params = buildParams(filtrosParam, true, true)
      // console.log(`📄 [${codigosFormulario[formulario]}] Exportando PDF con params:`, params)

      // Usar la ruta correcta del backend: {formulario}-pdf
      const response = await api.get(`/agri/reportes/${formulario}-pdf`, {
        params,
        responseType: 'blob',
        // onDownloadProgress: (progressEvent) => {
        //   const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        //   console.log(`📄 Descargando PDF: ${percent}%`)
        // },
      })

      if (!(response.data instanceof Blob)) {
        throw new Error('La respuesta no es un archivo válido')
      }

      // Verificar si el blob es realmente un JSON de error
      if (response.data.type === 'application/json') {
        const text = await response.data.text()
        const error = JSON.parse(text)
        // console.error(`❌ [${codigosFormulario[formulario]}] Error del backend:`, error)
        throw new Error(error.message || 'Error al generar el archivo')
      }

      descargarArchivo(response.data, 'pdf', formulario)

      // console.log(`✅ [${codigosFormulario[formulario]}] PDF exportado exitosamente`)

      $q.notify({
        type: 'positive',
        message: 'PDF generado correctamente',
        icon: 'download',
        position: 'top-right',
        timeout: 3000,
      })
    } catch (error) {
      // console.error(`❌ [${codigosFormulario[formulario]}] Error al exportar PDF:`, error)
      await manejarErrorExportacion(error, 'PDF')
    } finally {
      exportandoPDF.value = false
    }
  }

  /**
   * Descargar archivo (blob)
   */
  function descargarArchivo(blob, tipo, nombre) {
    const mimeTypes = {
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    }
    const extensiones = { excel: 'xlsx', pdf: 'pdf' }

    const blobFinal = new Blob([blob], { type: mimeTypes[tipo] })
    const url = window.URL.createObjectURL(blobFinal)
    const link = document.createElement('a')
    link.href = url

    const ahora = new Date()
    const fecha = ahora.toISOString().split('T')[0]
    const hora = tipo === 'excel' ? `_${ahora.toTimeString().split(' ')[0].replace(/:/g, '')}` : ''
    const codigo = codigosFormulario[nombre].replace('-', '')

    link.download = `${nombre}_${codigo}_${fecha}${hora}.${extensiones[tipo]}`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // console.log(
    //   `✅ [${codigosFormulario[nombre]}] ${tipo.toUpperCase()} descargado:`,
    //   link.download,
    // )
  }

  /**
   * Manejar errores de consulta
   */
  function manejarError(error) {
    let mensaje = 'Error al consultar precios'

    if (error.response) {
      switch (error.response.status) {
        case 401:
          mensaje = 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          break
        case 403:
          mensaje = 'No tienes permisos para acceder a estos datos'
          break
        case 404:
          mensaje = error.response.data?.message || 'Recurso no encontrado'
          break
        case 422:
          mensaje = error.response.data?.message || 'Error de validación en los filtros'
          break
        case 500:
          mensaje = 'Error del servidor. Por favor, intenta nuevamente.'
          break
        default:
          mensaje = error.response.data?.message || mensaje
      }
    } else if (error.request) {
      mensaje = 'No se pudo conectar con el servidor'
    }

    $q.notify({
      type: 'negative',
      message: mensaje,
      icon: 'error',
      position: 'top-right',
      timeout: 5000,
    })
  }

  /**
   * Manejar errores de exportación
   */
  async function manejarErrorExportacion(error, tipo) {
    let mensaje = `Error al generar ${tipo}`

    if (error.response) {
      switch (error.response.status) {
        case 404:
          mensaje = `No hay datos disponibles para exportar`
          break
        case 401:
          mensaje = 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          break
        case 403:
          mensaje = `No tienes permisos para exportar reportes`
          break
        case 500:
          mensaje = `Error del servidor al generar ${tipo}. Intenta nuevamente.`
          break
        default:
          if (error.response.data instanceof Blob) {
            try {
              const text = await error.response.data.text()
              const jsonError = JSON.parse(text)
              mensaje = jsonError.message || mensaje
            } catch {
              // console.error('No se pudo parsear error del blob')
            }
          }
      }
    } else if (error.request) {
      mensaje = 'No se pudo conectar con el servidor'
    }

    $q.notify({
      type: 'negative',
      message: mensaje,
      icon: 'error',
      position: 'top-right',
      timeout: 5000,
    })
  }

  /**
   * Limpiar filtros
   */
  function limpiarFiltros() {
    filtros.value = {
      fecha_inicio: null,
      fecha_fin: null,
      region: null,
      provincia: null,
      distrito: null,
      tipo: null,
      producto: null,
      ano: null,
      mes: null,
    }
    datos.value = []
    meta.value = null
  }

  return {
    // Estado
    loading,
    exportandoExcel,
    exportandoPDF,
    datos,
    meta,
    filtros,

    // Funciones
    consultarPrecios,
    exportarExcel,
    exportarPDF,
    limpiarFiltros,
  }
}
