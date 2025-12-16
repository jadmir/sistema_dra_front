import { api } from 'src/boot/axios'

export const subgrupoService = {
  async getAll() {
    const response = await api.get('/v1/subgrupos', {
      params: { with: 'grupo.subsector' },
    })
    // Si viene paginado, retornar solo el array de data
    return response.data.data || response.data
  },

  async search(query) {
    const isNumeric = /^\d+$/.test(query)
    const params = isNumeric
      ? { id: query, with: 'grupo.subsector' }
      : { q: query, with: 'grupo.subsector' }
    const response = await api.get('/v1/subgrupos/search', { params })
    return response.data.data || response.data
  },

  async getById(id) {
    const response = await api.get(`/v1/subgrupos/${id}`)
    return response.data.data || response.data
  },

  async create(data) {
    const response = await api.post('/v1/subgrupos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/v1/subgrupos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/v1/subgrupos/${id}`)
    return response.data
  },
}
