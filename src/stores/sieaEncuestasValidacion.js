import { defineStore } from 'pinia'
import encuestasValidacionService from 'src/services/siea/encuestasValidacionService'
import { Notify } from 'quasar'

/**
 * Store para validar y rechazar encuestas SIEA
 */
export const useSieaEncuestasValidacionStore = defineStore('sieaEncuestasValidacion', {
  state: () => ({
    loading: false,
    encuestaSeleccionada: null,
  }),

  actions: {
    /**
     * Validar encuesta (Supervisor aprueba)
     * @param {number} encuestaId - ID de la encuesta
     * @param {object} datos - { supervisor_id, observaciones_supervisor?, firma_supervisor? }
     * @returns {Promise<object|null>} - Encuesta validada o null si error
     */
    async validarEncuesta(encuestaId, datos) {
      this.loading = true

      try {
        console.log('📤 [VALIDAR ENCUESTA] ID:', encuestaId, 'Datos:', datos)

        const response = await encuestasValidacionService.validar(encuestaId, datos)

        if (response.success) {
          Notify.create({
            type: 'positive',
            message: '✅ Encuesta validada exitosamente',
            caption: 'El encuestador será notificado',
            position: 'top-right',
            timeout: 3000,
          })

          console.log('✅ [VALIDAR ENCUESTA] Success:', response.data)
          return response.data
        } else {
          throw new Error(response.message || 'Error al validar encuesta')
        }
      } catch (error) {
        console.error('❌ [VALIDAR ENCUESTA] Error:', error)

        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
        const errorDetails = error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : ''

        Notify.create({
          type: 'negative',
          message: '❌ Error al validar encuesta',
          caption: errorDetails || errorMessage,
          position: 'top-right',
          timeout: 5000,
        })

        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Rechazar encuesta (Supervisor rechaza con motivo)
     * @param {number} encuestaId - ID de la encuesta
     * @param {object} datos - { supervisor_id, observaciones_supervisor (OBLIGATORIO) }
     * @returns {Promise<object|null>} - Encuesta rechazada o null si error
     */
    async rechazarEncuesta(encuestaId, datos) {
      this.loading = true

      try {
        // Validar que haya observaciones (obligatorio)
        if (!datos.observaciones_supervisor || datos.observaciones_supervisor.trim() === '') {
          throw new Error('Las observaciones son obligatorias al rechazar una encuesta')
        }

        console.log('📤 [RECHAZAR ENCUESTA] ID:', encuestaId, 'Datos:', datos)

        const response = await encuestasValidacionService.rechazar(encuestaId, datos)

        if (response.success) {
          Notify.create({
            type: 'warning',
            message: '❌ Encuesta rechazada',
            caption: 'El encuestador deberá corregir y reenviar',
            position: 'top-right',
            timeout: 3000,
          })

          console.log('✅ [RECHAZAR ENCUESTA] Success:', response.data)
          return response.data
        } else {
          throw new Error(response.message || 'Error al rechazar encuesta')
        }
      } catch (error) {
        console.error('❌ [RECHAZAR ENCUESTA] Error:', error)

        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
        const errorDetails = error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : ''

        Notify.create({
          type: 'negative',
          message: '❌ Error al rechazar encuesta',
          caption: errorDetails || errorMessage,
          position: 'top-right',
          timeout: 5000,
        })

        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Seleccionar encuesta para validar/rechazar
     * @param {object} encuesta - Objeto de encuesta
     */
    seleccionarEncuesta(encuesta) {
      this.encuestaSeleccionada = encuesta
      console.log('📋 [SELECCIONAR ENCUESTA]', encuesta)
    },

    /**
     * Limpiar selección
     */
    limpiarSeleccion() {
      this.encuestaSeleccionada = null
      console.log('🧹 [LIMPIAR SELECCIÓN]')
    },
  },
})
