import { api } from 'boot/axios'

export default {
  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getPerfil() {
    const response = await api.get('/perfil')
    return response.data
  },

  /**
   * Actualiza el perfil del usuario autenticado
   * @param {Object} data - Datos a actualizar (nombre, apellido, email, dni, direccion, celular)
   */
  async actualizarPerfil(data) {
    const response = await api.put('/perfil', data)
    return response.data
  },
}
