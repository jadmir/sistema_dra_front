<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-medium text-grey-8">
          <q-icon name="eco" size="sm" color="green-7" class="q-mr-sm" />
          Gestión de Registro Agrícola
        </div>
        <div class="text-caption text-grey-6">
          Administra y filtra los registros agrícolas del sistema
        </div>
      </div>

      <div class="col-auto gt-xs row q-gutter-sm items-center">
        <q-btn unelevated color="green-7" icon="add" label="Nuevo registro" @click="openForm" />
        <q-btn
          :label="$q.screen.gt.xs ? 'Reporte Histórico' : ''"
          icon="timeline"
          color="green-7"
          outline
          @click="showReporteModal = true"
          :size="$q.screen.gt.xs ? 'md' : 'sm'"
        >
          <q-tooltip v-if="!$q.screen.gt.xs">Reporte Histórico</q-tooltip>
        </q-btn>
        <q-btn
          :label="$q.screen.gt.xs ? 'Reporte Campaña Agrícola' : ''"
          icon="insert_chart"
          color="info"
          outline
          @click="modalCampania = true"
        >
          <q-tooltip v-if="!$q.screen.gt.xs">Reporte Campaña Agrícola</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-pa-md q-mb-md bg-white shadow-2 rounded-borders">
      <q-card-section class="q-pt-sm q-pb-sm">
        <div class="row q-col-gutter-md items-end">
          <!-- Región -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.region_id"
              :options="regiones"
              option-value="id"
              option-label="nombre"
              label="Región"
              dense
              outlined
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Año -->
          <div class="col-12 col-md-2">
            <q-input
              v-model.number="filters.anio"
              type="number"
              label="Año"
              dense
              outlined
              clearable
              min="2000"
            />
          </div>

          <!-- Cultivos -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.cultivos"
              :options="cultivos"
              option-value="id"
              option-label="nombre"
              label="Cultivo(s)"
              multiple
              dense
              outlined
              clearable
              emit-value
              map-options
            >
              <template v-slot:selection="scope">
                <div>
                  <template v-if="scope.selected.length <= 2">
                    <q-chip
                      v-for="item in scope.selected"
                      :key="item.id"
                      dense
                      color="green"
                      text-color="white"
                      class="q-mr-xs"
                    >
                      {{ item.nombre }}
                    </q-chip>
                  </template>
                  <template v-else>
                    <q-chip dense color="grey-4" text-color="black">
                      +{{ scope.selected.length - 2 }} más
                    </q-chip>
                  </template>
                </div>
              </template>
            </q-select>
          </div>

          <!-- Buscar -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.search"
              label="Buscar..."
              dense
              outlined
              clearable
              debounce="300"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-1">
            <q-btn
              label="Filtrar"
              color="primary"
              class="full-width"
              unelevated
              :loading="loading"
              @click="getRegistros"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA-->
    <q-card flat bordered>
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[10, 20, 50]"
        flat
        bordered
        dense
      >
        <template #body-cell-actions="props">
          <q-td align="center">
            <q-btn dense flat round icon="edit" color="green-7" @click="edit(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn dense flat round icon="download" color="blue-6" @click="exportExcel(props.row)">
              <q-tooltip>Exportar Excel</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-cultivos="props">
          <q-td :props="props">
            <div class="row q-col-gutter-xs q-mt-xs q-mb-xs">
              <q-chip
                v-for="(detalle, index) in props.row.detalles.slice(0, 3)"
                :key="index"
                color="green-7"
                text-color="white"
                dense
                outline
                class="q-mb-xs"
              >
                {{ detalle.cultivo?.nombre || 'N/A' }}
                <q-tooltip>{{ detalle.cultivo?.nombre || 'N/A' }}</q-tooltip>
              </q-chip>

              <q-chip
                v-if="props.row.detalles.length > 3"
                color="green-4"
                text-color="white"
                dense
                outline
                class="q-mb-xs"
              >
                +{{ props.row.detalles.length - 3 }} más
                <q-tooltip>
                  <div v-for="(detalle, index) in props.row.detalles.slice(3)" :key="index">
                    {{ detalle.cultivo?.nombre || 'N/A' }}
                  </div>
                </q-tooltip>
              </q-chip>
            </div>
          </q-td>
        </template>

        <template #body-cell-total_variables="props">
          <q-td :props="props" class="text-center">
            {{ props.row.detalles.reduce((sum, d) => sum + (d.variables?.length || 0), 0) }}
          </q-td>
        </template>

        <template #body-cell-observacion="props">
          <q-td :props="props">
            <div class="text-caption text-grey-8">
              {{ props.row.observacion || '-' }}
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- form -->
    <agricola-form v-model="showForm" :registro="selected" @saved="onSaved" />

    <!-- REPORTE HISTORICO -->
    <q-dialog v-model="showReporteModal" persistent maximized>
      <q-card>
        <q-card-section class="bg-green-7 text-white row items-center">
          <q-icon name="timeline" size="md" class="q-mr-sm" />
          <div class="text-h6">Exportar Reporte Histórico</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- Filtros -->
        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6 col-md-3">
              <q-select
                v-model="reporte.anio_inicio"
                :options="anios"
                label="Año inicio"
                outlined
                dense
                color="green-7"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-select
                v-model="reporte.mes_inicio"
                :options="meses"
                label="Mes inicio"
                outlined
                dense
                color="green-7"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-select
                v-model="reporte.anio_fin"
                :options="anios"
                label="Año fin"
                outlined
                dense
                color="green-7"
              />
            </div>
            <div class="col-6 col-md-3">
              <q-select
                v-model="reporte.mes_fin"
                :options="meses"
                label="Mes fin"
                outlined
                dense
                color="green-7"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="reporte.region_id"
                :options="regiones"
                option-value="id"
                option-label="nombre"
                label="Región"
                outlined
                dense
                color="green-7"
                emit-value
                map-options
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat icon="close" label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            flat
            icon="file_download"
            label="Exportar Excel"
            color="green-7"
            @click="exportReporteHistorico"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EXPORTAR POR CAMPAÑA -->
    <q-dialog v-model="modalCampania" persistent maximized @before-show="resetFiltrosCampania">
      <q-card class="bg-grey-1">
        <q-card-section class="bg-green-7 text-white row items-center">
          <q-icon name="insert_chart" size="md" class="q-mr-sm" />
          <div class="text-h6">Exportar Campaña Agrícola</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- Filtros -->
        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedCultivos"
                :options="[{ id: 0, nombre: 'TODOS' }, ...cultivos]"
                option-value="id"
                option-label="nombre"
                label="Seleccionar Cultivo(s)"
                multiple
                outlined
                dense
                color="green-7"
                emit-value
                map-options
                @update:model-value="onCultivosChange"
              >
                <template v-slot:selection="scope">
                  <div>
                    <template v-if="scope.selected.length <= 2">
                      <q-chip
                        v-for="item in scope.selected"
                        :key="item.id"
                        outline
                        dense
                        color="green-7"
                        class="q-mr-xs"
                      >
                        {{ item.nombre }}
                      </q-chip>
                    </template>
                    <template v-else>
                      <q-chip outline dense color="green-7">
                        {{ scope.selected.length }} seleccionados
                      </q-chip>
                    </template>
                  </div>
                </template>
              </q-select>
            </div>

            <!-- Región -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedRegion"
                :options="regiones"
                option-value="id"
                option-label="nombre"
                label="Seleccionar Región"
                outlined
                dense
                color="green-7"
                emit-value
                map-options
                @update:model-value="loadProvincias"
              />
            </div>

            <!-- Provincia -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedProvincia"
                :options="provincias"
                option-value="id"
                option-label="nombre"
                label="Seleccionar Provincia"
                outlined
                dense
                color="green-7"
                emit-value
                map-options
                @update:model-value="loadDistritos"
              />
            </div>

            <!-- Distrito -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedDistrito"
                :options="distritos"
                option-value="id"
                option-label="nombre"
                label="Seleccionar Distrito"
                outlined
                dense
                color="green-7"
                emit-value
                map-options
              />
            </div>

            <!-- Años y Meses agrupados -->
            <div class="col-12 row q-col-gutter-md justify-center">
              <div class="col-6 col-md-3">
                <q-input
                  v-model="anioInicio"
                  type="number"
                  label="Año Inicio"
                  dense
                  outlined
                  color="green-7"
                />
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model="mesInicio"
                  :options="meses"
                  label="Mes Inicio"
                  dense
                  outlined
                  color="green-7"
                  emit-value
                  map-options
                />
              </div>

              <div class="col-6 col-md-3">
                <q-input
                  v-model="anioFin"
                  type="number"
                  label="Año Fin"
                  dense
                  outlined
                  color="green-7"
                />
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model="mesFin"
                  :options="meses"
                  label="Mes Fin"
                  dense
                  outlined
                  color="green-7"
                  emit-value
                  map-options
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Botones -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat icon="close" label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            v-if="anioInicio && anioFin && mesInicio && mesFin && selectedCultivos.length > 0"
            flat
            icon="file_download"
            label="Exportar Excel"
            color="green-7"
            @click="exportCampania"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import AgricolaForm from './AgricolaForm.vue'
import { useQuasar } from 'quasar'

/*catalogos */
const regiones = ref([])
const provincias = ref([])
const distritos = ref([])
const $q = useQuasar()
const showReporteModal = ref(false)
/*Exportar Campaña*/
const modalCampania = ref(false)
const selectedCultivos = ref([])
const selectedRegion = ref(null)
const selectedProvincia = ref(null)
const selectedDistrito = ref(null)
const anioInicio = ref(null)
const anioFin = ref(null)
const mesInicio = ref(null)
const mesFin = ref(null)
const cultivos = ref([])

const reporte = ref({
  anio_inicio: null,
  mes_inicio: null,
  anio_fin: null,
  mes_fin: null,
  region_id: null,
  provincia_id: null,
  distrito_id: null,
})

const anios = Array.from({ length: 30 }, (_, i) => 2000 + i)
const meses = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]

const filters = ref({
  region_id: null,
  provincia_id: null,
  distrito_id: null,
  anio: null,
  search: null,
})

const rows = ref([])
const loading = ref(false)

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  {
    name: 'region',
    label: 'Región',
    field: (row) => row.distrito?.provincia?.region?.nombre,
    align: 'left',
  },
  {
    name: 'provincia',
    label: 'Provincia',
    field: (row) => row.distrito?.provincia?.nombre,
    align: 'left',
  },
  { name: 'distrito', label: 'Distrito', field: (row) => row.distrito?.nombre, align: 'left' },
  { name: 'anio', label: 'Año', field: 'anio', align: 'left' },
  {
    name: 'cultivos',
    label: 'Cultivos Registrados',
    field: 'detalles',
    align: 'left',
    sortable: false,
  },
  {
    name: 'total_variables',
    label: 'Variables Registradas',
    field: 'total_variables',
    align: 'center',
  },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]
function onCultivosChange(val) {
  if (val.includes(0)) {
    selectedCultivos.value = [0]
  } else if (selectedCultivos.value.includes(0)) {
    selectedCultivos.value = val.filter((v) => v !== 0)
  } else {
    selectedCultivos.value = val
  }
}

async function loadRegiones() {
  try {
    const r = await api.get('/api/v1/agri-regiones/all')
    regiones.value = r.data.map((item) => ({ id: item.id, nombre: item.nombre }))
  } catch (err) {
    console.error('Error cargando regiones:', err)
    $q.notify({ type: 'negative', message: 'Error cargando regiones' })
  }
}

async function loadProvincias(regionId = null) {
  provincias.value = []
  distritos.value = []
  filters.value.provincia_id = null
  filters.value.distrito_id = null

  const id = regionId || filters.value.region_id
  if (!id) return

  try {
    const r = await api.get(`/api/v1/agri-provincias/${id}`)
    provincias.value = r.data.data.map((item) => ({ id: item.id, nombre: item.nombre }))
  } catch (err) {
    console.error('Error cargando provincias:', err)
    $q.notify({ type: 'negative', message: 'Error cargando provincias' })
  }
}

async function loadDistritos(provinciaId = null) {
  distritos.value = []
  filters.value.distrito_id = null

  const id = provinciaId || filters.value.provincia_id
  if (!id) return

  try {
    const r = await api.get(`/api/v1/agri-distritos/${id}`)
    distritos.value = r.data.data.map((item) => ({ id: item.id, nombre: item.nombre }))
  } catch (err) {
    console.error('Error cargando distritos:', err)
    $q.notify({ type: 'negative', message: 'Error cargando distritos' })
  }
}

async function loadCultivos() {
  try {
    const r = await api.get('/api/v1/agri-cultivo-catalogos/all')
    cultivos.value = r.data.map((item) => ({ id: item.id, nombre: item.nombre }))
  } catch (err) {
    console.error('Error cargando cultivos:', err)
    $q.notify({ type: 'negative', message: 'Error cargando cultivos' })
  }
}

async function exportReporteHistorico() {
  $q.loading.show({ message: 'Generando Excel...' })

  try {
    const response = await api.get('/api/v1/registros-agricola/export-periodo', {
      params: {
        anio_inicio: reporte.value.anio_inicio,
        mes_inicio: reporte.value.mes_inicio.value,
        anio_fin: reporte.value.anio_fin,
        mes_fin: reporte.value.mes_fin.value,
        region_id: reporte.value.region_id,
        provincia_id: reporte.value.provincia_id,
        distrito_id: reporte.value.distrito_id,
      },
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'reporte_historico.xlsx'
    link.click()

    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Reporte generado correctamente',
    })

    showReporteModal.value = false
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'No se pudo generar el reporte',
    })
  } finally {
    $q.loading.hide()
  }
}

// exportar por campañia
async function exportCampania() {
  try {
    $q.loading.show({ message: 'Generando Excel...' })

    const response = await api.get('/api/v1/registros-agricola/export-campania', {
      params: {
        cultivos: selectedCultivos.value,
        anio_inicio: anioInicio.value,
        mes_inicio: mesInicio.value,
        anio_fin: anioFin.value,
        mes_fin: mesFin.value,
        region_id: selectedRegion.value,
        provincia_id: selectedProvincia.value,
        distrito_id: selectedDistrito.value,
      },
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'reporte_campania.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: 'Reporte generado correctamente' })
    modalCampania.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'No se pudo generar el reporte' })
  } finally {
    $q.loading.hide()
  }
}

/*registro*/
async function getRegistros() {
  loading.value = true

  try {
    const r = await api.get('/api/v1/registros', {
      params: {
        page: pagination.value.page,
        per_page: pagination.value.rowsPerPage,
        region_id: filters.value.region_id || null,
        anio: filters.value.anio || null,
        search: filters.value.search || null,
        cultivos: filters.value.cultivos?.length ? filters.value.cultivos : null,
      },
    })

    rows.value = r.data.data

    pagination.value = {
      page: r.data.current_page,
      rowsPerPage: r.data.per_page,
      rowsNumber: r.data.total,
    }
  } catch (err) {
    console.error('Error al obtener registros:', err)
  } finally {
    loading.value = false
  }
}

/*exportar excel detallado */
async function exportExcel(row) {
  if (!row || !row.id) {
    console.error('No se recibió ID del registro para exportar')
    return
  }

  try {
    const response = await api.get('/api/v1/registros-agricola/export', {
      params: { id: row.id },
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Registro_Agricola_${row.id}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: 'Excel generado correctamente' })
  } catch (err) {
    console.error('Error exportando Excel:', err)
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'No se pudo exportar el Excel',
    })
  }
}

function resetFiltrosCampania() {
  selectedCultivos.value = []
  selectedRegion.value = null
  selectedProvincia.value = null
  selectedDistrito.value = null
  provincias.value = []
  distritos.value = []
  anioInicio.value = null
  mesInicio.value = null
  anioFin.value = null
  mesFin.value = null
}

function onRequest(props) {
  pagination.value = props.pagination
  getRegistros()
}

const showForm = ref(false)
const selected = ref(null)

function openForm() {
  selected.value = null
  showForm.value = true
}

function edit(row) {
  selected.value = row
  showForm.value = true
}

function onSaved() {
  getRegistros()
}

onMounted(() => {
  loadRegiones()
  loadCultivos()
  getRegistros()
})
</script>
