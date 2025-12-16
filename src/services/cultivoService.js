import { api } from 'src/boot/axios'

export const cultivoService = {
  async getAll() {
    const response = await api.get('/v1/cultivos', {
      params: { with: 'subgrupo.grupo.subsector' },
    })
    // Si viene paginado, retornar solo el array de data
    return response.data.data || response.data
  },

  async search(query) {
    const isNumeric = /^\d+$/.test(query)
    const params = isNumeric
      ? { id: query, with: 'subgrupo.grupo.subsector' }
      : { q: query, with: 'subgrupo.grupo.subsector' }
    const response = await api.get('/v1/cultivos/search', { params })
    return response.data.data || response.data
  },

  async getById(id) {
    const response = await api.get(`/v1/cultivos/${id}`)
    return response.data.data || response.data
  },

  async create(data) {
    const response = await api.post('/v1/cultivos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/v1/cultivos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/v1/cultivos/${id}`)
    return response.data
  },

  // Reportes
  async getPDF(filters = {}) {
    const response = await api.get('/v1/reportes/cultivos/pdf', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },

  async getExcel(filters = {}) {
    const response = await api.get('/v1/reportes/cultivos/excel', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },
}
