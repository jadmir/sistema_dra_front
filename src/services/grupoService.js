import { api } from 'src/boot/axios'

export const grupoService = {
  async getAll() {
    const response = await api.get('/v1/grupos', {
      params: { with: 'subsector' },
    })
    // Si viene paginado, retornar solo el array de data
    return response.data.data || response.data
  },

  async search(query) {
    const isNumeric = /^\d+$/.test(query)
    const params = isNumeric ? { id: query, with: 'subsector' } : { q: query, with: 'subsector' }
    const response = await api.get('/v1/grupos/search', { params })
    return response.data.data || response.data
  },

  async getById(id) {
    const response = await api.get(`/v1/grupos/${id}`)
    return response.data.data || response.data
  },

  async create(data) {
    const response = await api.post('/v1/grupos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/v1/grupos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/v1/grupos/${id}`)
    return response.data
  },
}
