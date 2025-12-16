import { api } from 'src/boot/axios'

const endpoint = '/v1/usuarios'

export const userService = {
  //listado con paginacion y filtros opcionales
  async getAll(page = 1) {
    const res = await api.get(endpoint, { params: { page } })
    return res.data
  },

  //busqueda de usuario
  async search(query) {
    const res = await api.get(`${endpoint}/search`, { params: { q: query } })
    return res.data
  },

  //busqueda por Id
  async getById(id) {
    const res = await api.get(`${endpoint}/${id}`)
    return res.data
  },

  //creacion de usuario
  async create(userData) {
    const res = await api.post(endpoint, userData)
    return res.data
  },

  //actualizacion de usuario
  async update(id, userData) {
    const res = await api.put(`${endpoint}/${id}`, userData)
    return res.data
  },

  //eliminacion de usuario
  async delete(id) {
    const res = await api.delete(`${endpoint}/${id}`)
    return res.data
  },
}
