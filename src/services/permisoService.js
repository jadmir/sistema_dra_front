import { api } from 'boot/axios'

/**
 * Normaliza la respuesta del backend para mantener consistencia
 */
const normalizeResponse = (response) => {
  const data = response.data || response

  // Si ya tiene formato correcto, retornar tal cual
  if (data.data && Array.isArray(data.data)) {
    return data
  }

  // Si es array directo, envolver en formato paginado
  if (Array.isArray(data)) {
    return {
      data: data,
      total: data.length,
      current_page: 1,
      per_page: data.length,
      last_page: 1,
    }
  }

  // Si no cumple ningún formato, retornar estructura vacía
  return {
    data: [],
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
  }
}

export default {
  /**
   * Obtiene la lista de permisos con paginación
   */
  async getAll(params = {}) {
    const response = await api.get('/v1/permisos', { params })
    return normalizeResponse(response.data)
  },

  /**
   * Busca permisos por ID, nombre o descripción
   */
  async search(query = '', params = {}) {
    const searchParams = { ...params }

    // Si el query está vacío, buscar todos
    if (!query || !String(query).trim()) {
      // console.log('Búsqueda vacía, params:', searchParams)
      const response = await api.get('/v1/permisos/search', { params: searchParams })
      return normalizeResponse(response.data)
    }

    // Detectar si es búsqueda por ID (solo números)
    const isNumeric = /^\d+$/.test(String(query).trim())

    if (isNumeric) {
      // Si es número, solo enviar parámetro 'id'
      searchParams.id = query
      // console.log('Búsqueda por ID:', searchParams)
    } else {
      // Si es texto, solo enviar parámetro 'q'
      searchParams.q = query
      // console.log('Búsqueda por texto:', searchParams)
    }

    const response = await api.get('/v1/permisos/search', { params: searchParams })
    // console.log('Respuesta del backend:', response.data)
    return normalizeResponse(response.data)
  },

  /**
   * Obtiene un permiso por ID
   */
  async getById(id) {
    const response = await api.get(`/v1/permisos/${id}`)
    return response.data
  },

  /**
   * Crea un nuevo permiso
   */
  async create(data) {
    const response = await api.post('/v1/permisos', data)
    return response.data
  },

  /**
   * Actualiza un permiso existente
   */
  async update(id, data) {
    const response = await api.put(`/v1/permisos/${id}`, data)
    return response.data
  },

  /**
   * Elimina un permiso
   */
  async delete(id) {
    const response = await api.delete(`/v1/permisos/${id}`)
    return response.data
  },
}
