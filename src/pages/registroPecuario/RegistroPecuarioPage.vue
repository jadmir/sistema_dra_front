<template>
  <q-page padding class="bg-grey-1">
    <!-- HEADER -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-medium text-grey-8">
          <q-icon name="agriculture" color="green-7" size="sm" class="q-mr-sm" />
          Gestión de Registro Pecuario
        </div>
        <div class="text-caption text-grey-6">
          Administra y filtra los registros pecuarios del sistema
        </div>
      </div>

      <div class="col-auto gt-xs">
        <q-btn unelevated color="green-7" icon="add" label="Nuevo registro" @click="openForm()" />
      </div>
    </div>

    <div class="row q-mb-md lt-sm">
      <q-btn
        unelevated
        color="green-7"
        icon="add"
        label="Nuevo registro"
        class="full-width"
        @click="openForm()"
      />
    </div>

    <!-- FILTROS -->
    <q-card class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-3">
            <q-input
              outlined
              dense
              v-model="filters.fecha_inicio"
              type="date"
              label="Fecha inicio"
              :color="'green-7'"
            />
          </div>

          <div class="col-12 col-sm-3">
            <q-input
              outlined
              dense
              v-model="filters.fecha_fin"
              type="date"
              label="Fecha fin"
              color="green-7"
            />
          </div>

          <div class="col-12 col-sm-3">
            <q-select
              outlined
              dense
              v-model="filters.variedad"
              :options="variedadesOptions"
              label="Variedad"
              emit-value
              map-options
              color="green-7"
            />
          </div>

          <div class="col-12 col-sm-3">
            <q-select
              outlined
              dense
              v-model="filters.tipo"
              :options="tipoOptions"
              label="Tipo de actividad"
              emit-value
              map-options
              color="green-7"
            />
          </div>

          <div class="col-12 col-sm-4">
            <q-input
              outlined
              dense
              v-model="filters.search"
              label="Buscar..."
              clearable
              debounce="400"
            >
              <template #prepend>
                <q-icon name="search" color="green-7" />
              </template>
            </q-input>
          </div>

          <!-- Botón filtros -->
          <div class="col-12 col-sm-2 flex items-end">
            <q-btn
              unelevated
              color="green-7"
              label="Aplicar filtros"
              class="full-width"
              @click="getRegistros"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA -->
    <q-card flat bordered>
      <q-table
        :rows="store.registros"
        :columns="columns"
        row-key="id"
        :loading="store.loading"
        v-model:pagination="store.pagination"
        @request="onRequest"
        :rows-per-page-options="[5, 10, 20]"
        flat
      >
        <!-- Acciones -->
        <template #body-cell-actions="props">
          <q-td align="center">
            <q-btn
              dense
              flat
              round
              icon="edit"
              color="green-7"
              @click="edit(props.row)"
              :disable="!props.row.editable"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              dense
              flat
              round
              icon="picture_as_pdf"
              color="red-6"
              @click="exportPdf(props.row)"
            >
              <q-tooltip>Exportar PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- FORMULARIO -->
    <registro-pecuario-form
      v-model="showForm"
      :registro="selected"
      @saved="onSaved"
      @close="closeForm"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegistroPecuarioStore } from 'src/stores/registroPecuario'
import RegistroPecuarioForm from './RegistroPecuarioForm.vue'
import { api } from 'boot/axios'

const store = useRegistroPecuarioStore()
const showForm = ref(false)
const selected = ref(null)
const rows = ref([])
const loading = ref(false)
const variedadesOptions = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'nombre_establo', label: 'Nombre Establo', field: 'nombre_establo', align: 'left' },
  { name: 'region', label: 'Región', field: 'region', align: 'left' },
  { name: 'provincia', label: 'Provincia', field: 'provincia', align: 'left' },
  { name: 'distrito', label: 'Distrito', field: 'distrito', align: 'left' },
  { name: 'mes_de_referencia', label: 'Mes', field: 'mes_de_referencia', align: 'left' },
  { name: 'anio', label: 'Año', field: 'anio' },
  { name: 'variedades', label: 'Variedades', field: 'variedades', align: 'left' },
  { name: 'total_animales', label: 'Total Animales', field: 'total_animales', align: 'right' },
  { name: 'created_at', label: 'Fecha Creacion', field: 'created_at', align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

const filters = ref({
  fecha_inicio: null,
  fecha_fin: null,
  variedad: null,
  tipo: null,
  search: null,
})

const tipoOptions = [
  { label: 'Todos', value: null },
  { label: 'Natalidad', value: 'natalidad' },
  { label: 'Mortalidad', value: 'mortalidad' },
  { label: 'Saca', value: 'saca' },
  { label: 'Producción Leche', value: 'produccion_leche' },
]
async function getVariedades() {
  const r = await api.get('/api/v1/agri-variedad-animales')
  variedadesOptions.value = [
    { label: 'Todos', value: 'all' },
    ...r.data.data.map((v) => ({
      label: v.nombre,
      value: v.id,
    })),
  ]
}

async function getRegistros() {
  loading.value = true
  try {
    await store.fetchRegistros(pagination.value.page, {
      fecha_inicio: filters.value.fecha_inicio,
      fecha_fin: filters.value.fecha_fin,
      variedad: filters.value.variedad,
      tipo: filters.value.tipo,
      search: filters.value.search,
    })

    rows.value = store.registros
    pagination.value.page = store.pagination.page
    pagination.value.rowsNumber = store.pagination.rowsNumber
  } finally {
    loading.value = false
  }
}

function openForm() {
  selected.value = null
  showForm.value = true
}

async function edit(row) {
  const data = await store.fetchRegistro(row.id)

  if (data) {
    selected.value = data
    showForm.value = true
  }
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

function onSaved() {
  store.fetchRegistros(store.pagination.page)
  closeForm()
}

function onRequest({ pagination }) {
  store.pagination.page = pagination.page
  store.fetchRegistros(pagination.page)
}

async function exportPdf(row) {
  await store.exportPdf(row.id)
}

onMounted(() => {
  store.fetchRegistros()
  getVariedades()
  getRegistros()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 10px;
}
</style>
