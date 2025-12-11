<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md flex flex-center">
      <q-card
        class="q-pa-md q-mx-auto shadow-2 rounded-borders"
        style="max-width: 1400px; width: 100%"
      >
        <div class="col">
          <div class="text-h5 text-weight-medium text-grey-8">
            <q-icon name="grass" color="green-7" size="sm" class="q-mr-sm" />
            Cultivos
          </div>
          <div class="text-caption text-grey-6">Gestiona los cultivos agrícolas</div>
        </div>

        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="search"
              filled
              dense
              placeholder="Buscar cultivo..."
              @keyup.enter="getData"
              color="green"
              clear-icon="close"
              clearable
            >
              <template #append><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn
              label="Nuevo Cultivo"
              color="green"
              unelevated
              icon="add"
              @click="openDialog()"
            />
          </div>
        </div>

        <q-separator spaced />

        <q-table
          :rows="catalogos"
          :columns="columns"
          row-key="id"
          flat
          bordered
          color="green"
          no-data-label="No hay cultivos registrados"
        >
          <template #body-cell-estado="props">
            <q-td align="center">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-toggle
                  v-model="props.row.estado"
                  color="green"
                  dense
                  @update:model-value="toggleEstado(props.row)"
                />
                <q-badge :color="props.row.estado ? 'green' : 'red'" class="badge-status">
                  {{ props.row.estado ? 'Activo' : 'Inactivo' }}
                </q-badge>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat round icon="edit" color="green" @click="openDialog(props.row)" />
            </q-td>
          </template>
        </q-table>

        <div class="row justify-center q-mt-md">
          <q-pagination
            v-model="pagination.page"
            :max="pagination.totalPages"
            color="green"
            boundary-links
            @update:model-value="getData"
          />
        </div>

        <q-dialog v-model="dialog">
          <q-card style="width: 400px">
            <q-card-section class="text-h6">
              {{ form.id ? 'Editar Cultivo' : 'Nuevo Cultivo' }}
            </q-card-section>

            <q-card-section>
              <q-input v-model="form.nombre" label="Nombre" filled dense color="green" />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="red" v-close-popup />
              <q-btn flat label="Guardar" color="green" @click="save" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const search = ref('')
const dialog = ref(false)
const catalogos = ref([])

const form = ref({
  id: null,
  nombre: '',
})

const pagination = ref({
  page: 1,
  totalPages: 1,
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const getData = async () => {
  try {
    const r = await api.get('/api/v1/agri-cultivo-catalogos', {
      params: {
        per_page: 10,
        page: pagination.value.page,
        search: search.value,
      },
    })
    catalogos.value = r.data.data.data
    pagination.value.totalPages = r.data.data.last_page
  } catch {
    Notify.create({ type: 'negative', message: 'Error cargando cultivos' })
  }
}

const save = async () => {
  try {
    if (!form.value.nombre) {
      Notify.create({ type: 'negative', message: 'Completa el nombre' })
      return
    }

    if (form.value.id) {
      await api.put(`/api/v1/agri-cultivo-catalogos/${form.value.id}`, {
        nombre: form.value.nombre,
      })
      Notify.create({ type: 'positive', message: 'Cultivo actualizado' })
    } else {
      await api.post('/api/v1/agri-cultivo-catalogos', { nombre: form.value.nombre })
      Notify.create({ type: 'positive', message: 'Cultivo creado' })
    }

    dialog.value = false
    getData()
  } catch (error) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      for (let key in errors) {
        Notify.create({ type: 'negative', message: errors[key][0] })
      }
    } else {
      Notify.create({ type: 'negative', message: 'Error guardando cultivo' })
    }
  }
}

const toggleEstado = async (row) => {
  try {
    if (row.estado) {
      await api.put(`/api/v1/agri-cultivo-catalogos/${row.id}`, { nombre: row.nombre })
      Notify.create({ type: 'positive', message: 'Cultivo activado' })
    } else {
      await api.delete(`/api/v1/agri-cultivo-catalogos/${row.id}`)
      Notify.create({ type: 'warning', message: 'Cultivo desactivado' })
    }
    getData()
  } catch {
    Notify.create({ type: 'negative', message: 'Error cambiando estado' })
    getData()
  }
}

const openDialog = (row = null) => {
  if (row) {
    form.value = { id: row.id, nombre: row.nombre }
  } else {
    form.value = { id: null, nombre: '' }
  }
  dialog.value = true
}

onMounted(getData)
</script>

<style scoped>
.badge-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
