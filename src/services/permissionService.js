import { api } from 'boot/axios'

const base = '/api/v1/permissions' // ajusta si tu endpoint es otro

export const permissionService = {
  async getAll(params = {}) {
    const res = await api.get(base, { params })
    return res.data
  },
}
