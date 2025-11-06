import { api } from 'boot/axios'

const base = '/api/v1/roles' // ajusta si tu endpoint es otro

function normalizeToArray(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.roles)) return payload.roles
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export const roleService = {
  // listado de roles
  async getAll(params = {}) {
    const res = await api.get(base, { params })
    return normalizeToArray(res.data)
  },

  // obtener un rol por id
  async getById(id) {
    const res = await api.get(`${base}/${id}`)
    return res.data
  },

  //crear un rol
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

  async assignPermissions(roleId, permissions) {
    const res = await api.post(`${base}/${roleId}/permissions`, { permissions })
    return res.data
  },
}
