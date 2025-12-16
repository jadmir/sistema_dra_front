import { api } from 'boot/axios'

const base = '/v1/variedades'

export const variedadService = {
  async getAll(page = 1, perPage = 10) {
    const res = await api.get(base, { params: { page, per_page: perPage } })
    return res.data
  },

  // Usa tu ruta: Route::get('/search', ...)
  async search(term, page = 1, perPage = 10) {
    const res = await api.get(`${base}/search`, {
      params: {
        q: term, // común en Laravel
        search: term, // backup si el controlador lee 'search'
        page,
        per_page: perPage,
      },
    })
    return res.data
  },

  async create(data) {
    const res = await api.post(base, data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`${base}/${id}`, data)
    return res.data
  },

  async delete(id) {
    const res = await api.delete(`${base}/${id}`)
    return res.data
  },
}
