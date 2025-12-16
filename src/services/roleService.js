import { api } from 'boot/axios'

const base = '/v1/roles'

function normalizeResponse(payload) {
  // Si es un array directo, devolverlo como data
  if (Array.isArray(payload)) {
    return {
      data: payload,
      total: payload.length,
      current_page: 1,
      per_page: payload.length,
    }
  }

  // Si tiene estructura de paginación de Laravel
  if (payload?.data && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      total: payload.total || payload.data.length,
      current_page: payload.current_page || 1,
      per_page: payload.per_page || 10,
      last_page: payload.last_page || 1,
    }
  }

  // Si tiene estructura alternativa con 'roles'
  if (payload?.roles && Array.isArray(payload.roles)) {
    return {
      data: payload.roles,
      total: payload.total || payload.roles.length,
      current_page: payload.current_page || 1,
      per_page: payload.per_page || 10,
    }
  }

  // Si no hay datos, retornar vacío
  return {
    data: [],
    total: 0,
    current_page: 1,
    per_page: 10,
  }
}

export const roleService = {
  // listado de roles con paginación
  async getAll(params = {}) {
    const res = await api.get(base, { params })
    return normalizeResponse(res.data)
  },

  // búsqueda de roles (busca por ID o nombre)
  async search(query = '', params = {}) {
    const searchParams = { ...params }

    // Si el query está vacío, buscar todos
    if (!query || !String(query).trim()) {
      // Sin parámetros de búsqueda
      const res = await api.get(`${base}/search`, { params: searchParams })
      return normalizeResponse(res.data)
    }

    // Detectar si es búsqueda por ID (solo números)
    const isNumeric = /^\d+$/.test(String(query).trim())

    if (isNumeric) {
      // Si es número, solo enviar parámetro 'id'
      searchParams.id = query
    } else {
      // Si es texto, solo enviar parámetro 'q'
      searchParams.q = query
    }

    const res = await api.get(`${base}/search`, {
      params: searchParams,
    })
    return normalizeResponse(res.data)
  },

  // obtener un rol por id
  async getById(id) {
    const res = await api.get(`${base}/${id}`)
    return res.data
  },

  // (Opcional) si tienes GET /v1/roles/{id}/permisos
  async getPermissions(roleId) {
    const res = await api.get(`${base}/${roleId}/permisos`)
    // Para permisos solo necesitamos el array
    const normalized = normalizeResponse(res.data)
    return normalized.data
  },

  // Añade modo (sync o append). Por defecto sync.
  async assignPermissions(roleId, permissionIds, mode = 'sync') {
    const payload = {
      permisos: Array.isArray(permissionIds) ? permissionIds : [],
      modo: mode, // 'sync' o 'append'
    }
    const res = await api.post(`${base}/${roleId}/permisos`, payload)
    return res.data
  },

  // crear un rol
  async create(data) {
    const res = await api.post(base, data)
    return res.data
  },

  // actualizar un rol
  async update(id, data) {
    const res = await api.put(`${base}/${id}`, data)
    return res.data
  },

  // eliminar un rol
  async delete(id) {
    const res = await api.delete(`${base}/${id}`)
    return res.data
  },
}
