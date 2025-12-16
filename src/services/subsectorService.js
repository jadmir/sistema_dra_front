import { api } from 'src/boot/axios'

export const subsectorService = {
  async getAll() {
    const response = await api.get('/v1/subsectores')
    // Si viene paginado, retornar solo el array de data
    return response.data.data || response.data
  },

  async search(query) {
    const isNumeric = /^\d+$/.test(query)
    const params = isNumeric ? { id: query } : { q: query }
    const response = await api.get('/v1/subsectores/search', { params })
    return response.data.data || response.data
  },

  async getById(id) {
    const response = await api.get(`/v1/subsectores/${id}`)
    return response.data.data || response.data
  },

  async create(data) {
    const response = await api.post('/v1/subsectores', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/v1/subsectores/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/v1/subsectores/${id}`)
    return response.data
  },
}
