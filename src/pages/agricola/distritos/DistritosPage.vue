<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md flex flex-center">
      <q-card
        class="q-pa-md q-mx-auto shadow-2 rounded-borders"
        style="max-width: 1400px; width: 100%"
      >
        <div class="col">
          <div class="text-h5 text-weight-medium text-grey-8">
            <q-icon name="location_city" color="green-7" size="sm" class="q-mr-sm" />
            Distritos
          </div>
          <div class="text-caption text-grey-6">
            Administra los distritos dentro de cada provincia
          </div>
        </div>

        <!-- BUSQUEDA Y NUEVO -->
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="search"
              filled
              dense
              placeholder="Buscar distrito..."
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
              label="Nuevo Distrito"
              color="green"
              unelevated
              icon="add"
              @click="openDialog()"
            />
          </div>
        </div>

        <q-separator spaced />

        <!-- TABLA -->
        <q-table
          :rows="distritos"
          :columns="columns"
          row-key="id"
          flat
          bordered
          color="green"
          no-data-label="No hay distritos registrados"
        >
          <template #body-cell-provincia_id="props">
            <q-td>{{ props.row.provincia?.nombre || '' }}</q-td>
          </template>

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
          <q-card style="width: 420px">
            <q-card-section class="text-h6">
              {{ form.id ? 'Editar Distrito' : 'Nuevo Distrito' }}
            </q-card-section>

            <q-card-section>
              <q-input v-model="form.nombre" label="Nombre" filled dense color="green" />
              <q-select
                v-model="form.provincia_id"
                label="Provincia"
                :options="provincias"
                option-label="nombre"
                option-value="id"
                filled
                dense
                color="green"
              />
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
const distritos = ref([])
const provincias = ref([])

const form = ref({
  id: null,
  nombre: '',
  provincia_id: null,
})

const pagination = ref({
  page: 1,
  totalPages: 1,
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'provincia_id', label: 'Provincia', field: 'provincia_id', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

// Cargar provincias para select
const getProvincias = async () => {
  try {
    const r = await api.get('/api/v1/agri-provincias/all')
    provincias.value = r.data
  } catch (e) {
    // console.log(e)
    Notify.create({ type: 'negative', message: 'Error cargando provincias' })
  }
}

// Cargar distritos
const getData = async () => {
  try {
    const r = await api.get('/api/v1/agri-distritos', {
      params: {
        per_page: 10,
        page: pagination.value.page,
        search: search.value,
      },
    })
    distritos.value = r.data.data.data
    pagination.value.totalPages = r.data.data.last_page
  } catch {
    Notify.create({ type: 'negative', message: 'Error cargando distritos' })
  }
}

// Guardar distrito
const save = async () => {
  try {
    if (!form.value.nombre || !form.value.provincia_id) {
      Notify.create({ type: 'negative', message: 'Completa todos los campos' })
      return
    }

    const payload = {
      nombre: form.value.nombre,
      provincia_id: form.value.provincia_id.id ?? form.value.provincia_id,
    }

    if (form.value.id) {
      await api.put(`/api/v1/agri-distritos/${form.value.id}`, payload)
      Notify.create({ type: 'positive', message: 'Distrito actualizado' })
    } else {
      await api.post('/api/v1/agri-distritos', payload)
      Notify.create({ type: 'positive', message: 'Distrito creado' })
    }

    dialog.value = false
    getData()
  } catch (error) {
    // console.log(error.response?.data)
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      for (let key in errors) {
        Notify.create({ type: 'negative', message: errors[key][0] })
      }
    } else {
      Notify.create({ type: 'negative', message: 'Error guardando distrito' })
    }
  }
}

// Activar / Desactivar
const toggleEstado = async (row) => {
  try {
    if (row.estado) {
      await api.put(`/api/v1/agri-distritos/${row.id}`, {
        nombre: row.nombre,
        provincia_id: row.provincia_id.id ?? row.provincia_id,
      })
      Notify.create({ type: 'positive', message: 'Distrito activado' })
    } else {
      await api.delete(`/api/v1/agri-distritos/${row.id}`)
      Notify.create({ type: 'warning', message: 'Distrito desactivado' })
    }
    getData()
  } catch (error) {
    // console.log(error.response?.data)
    Notify.create({ type: 'negative', message: 'Error cambiando estado' })
    getData()
  }
}

// Abrir diálogo
const openDialog = (row = null) => {
  if (row) {
    const provObj = provincias.value.find((p) => p.id === row.provincia_id) || null
    form.value = {
      id: row.id,
      nombre: row.nombre,
      provincia_id: provObj,
    }
  } else {
    form.value = { id: null, nombre: '', provincia_id: null }
  }
  dialog.value = true
}

onMounted(() => {
  getProvincias()
  getData()
})
</script>

<style scoped>
.badge-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
