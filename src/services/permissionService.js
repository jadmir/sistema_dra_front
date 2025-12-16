import { api } from 'boot/axios'

const base = '/v1/permisos' // ← ajustado a español

function normalize(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const permissionService = {
  async getAll(params = {}) {
    const res = await api.get(base, { params })
    return normalize(res.data)
  },
}
