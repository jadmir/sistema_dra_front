<template>
  <q-dialog v-model="showing" persistent maximized>
    <q-inner-loading :showing="loading" class="bg-black bg-opacity-50 text-white">
      <q-spinner-dots color="green-7" size="50px" />
    </q-inner-loading>
    <q-card class="q-pa-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-green-7">
          <q-icon name="eco" color="green-7" class="q-mr-sm" />
          {{ isEdit ? 'Editar Registro Agrícola' : 'Nuevo Registro Agrícola' }}
        </div>

        <q-btn dense flat icon="close" color="grey-7" @click="closeForm" />
      </div>

      <q-separator />

      <q-inner-loading :showing="loading" />

      <q-form @submit.prevent="saveForm" class="q-mt-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="form.region_id"
              :options="regiones"
              option-value="id"
              option-label="nombre"
              label="Región"
              dense
              outlined
              color="green-7"
              emit-value
              map-options
              :rules="[(v) => !!v || 'Seleccione una región']"
              @update:model-value="loadProvincias"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.provincia_id"
              :options="provincias"
              option-value="id"
              option-label="nombre"
              label="Provincia"
              dense
              outlined
              color="green-7"
              emit-value
              map-options
              :disable="!form.region_id"
              :rules="[(v) => !!v || 'Seleccione una provincia']"
              @update:model-value="loadDistritos"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.distrito_id"
              :options="distritos"
              option-value="id"
              option-label="nombre"
              label="Distrito"
              dense
              outlined
              color="green-7"
              emit-value
              map-options
              :disable="!form.provincia_id"
              :rules="[(v) => !!v || 'Seleccione un distrito']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model.number="form.anio"
              type="number"
              label="Año"
              dense
              outlined
              color="green-7"
              :rules="[(v) => !!v || 'El año es obligatorio', (v) => v >= 2000 || 'Año no válido']"
            />
          </div>

          <div class="col-12 col-md-9">
            <q-input
              v-model="form.observacion"
              type="textarea"
              autogrow
              label="Observación"
              dense
              outlined
              color="green-7"
            />
          </div>
        </div>

        <div class="q-mt-xl">
          <cultivo-variables-table
            v-model="form.detalles"
            :cultivos="cultivos"
            :variables="variables"
          />
        </div>

        <div class="row justify-end q-gutter-sm q-mt-xl">
          <q-btn label="Cancelar" flat color="grey-7" @click="closeForm" />
          <q-btn
            :label="isEdit ? 'Actualizar' : 'Guardar'"
            color="green-7"
            unelevated
            type="submit"
            :disable="!canSave"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import CultivoVariablesTable from './components/CultivoVariablesTable.vue'

const props = defineProps({
  modelValue: Boolean,
  registro: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const showing = ref(false)
const isEdit = computed(() => !!props.registro)
const loading = ref(false)
const $q = useQuasar()

// Datos form
const form = ref({
  region_id: null,
  provincia_id: null,
  distrito_id: null,
  anio: null,
  observacion: '',
  detalles: [],
})

// Catálogos
const regiones = ref([])
const provincias = ref([])
const distritos = ref([])

const cultivos = ref([])
const variables = ref([])
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const canSave = computed(() => {
  const f = form.value

  // Validar campos
  if (!f.region_id || !f.provincia_id || !f.distrito_id) return false
  if (!f.anio || f.anio < 2000) return false

  // Validar cultivos
  if (!f.detalles.length) return false

  for (const c of f.detalles) {
    if (!c.variables || c.variables.length === 0) return false
  }

  return true
})
async function loadRegiones() {
  const r = await api.get('/api/v1/agri-regiones/all')
  regiones.value = r.data
}

async function loadProvincias() {
  form.value.provincia_id = null
  form.value.distrito_id = null
  provincias.value = []
  distritos.value = []

  if (!form.value.region_id) return

  const r = await api.get(`/api/v1/agri-provincias/${form.value.region_id}`)
  provincias.value = r.data.data
}

async function loadDistritos() {
  form.value.distrito_id = null
  distritos.value = []

  if (!form.value.provincia_id) return

  const r = await api.get(`/api/v1/agri-distritos/${form.value.provincia_id}`)
  distritos.value = r.data.data
}

async function loadCultivos() {
  const r = await api.get('/api/v1/agri-cultivo-catalogos')
  cultivos.value = r.data.data
}

async function loadVariables() {
  const r = await api.get('/api/v1/agri-variables')
  variables.value = r.data.data
}

/*open*/
watch(
  () => props.modelValue,
  async (v) => {
    showing.value = v
    if (!v) return

    loading.value = true
    await Promise.all([loadRegiones(), loadCultivos(), loadVariables()])

    if (props.registro) {
      await loadEditData(props.registro)
    }
    loading.value = false
  },
)

/*edit */
async function loadEditData(data) {
  form.value.region_id = data.region_id
  await loadProvincias()

  form.value.provincia_id = data.provincia_id
  await loadDistritos()

  form.value.distrito_id = data.distrito_id
  form.value.anio = data.anio
  form.value.observacion = data.observacion

  form.value.detalles = (data.detalles || []).map((c) => {
    return {
      cultivo_id: c.cultivo_id,
      nombre: c.cultivo?.nombre ?? 'SIN NOMBRE',
      uid: c.uid ?? `${c.cultivo_id}-${Date.now()}`,
      selectedVariable: null,
      variables: (c.variables || []).map((v) => ({
        id: v.id ?? null,
        variable_id: v.variable_id,
        nombre: v.variable_catalogo?.nombre ?? 'SIN NOMBRE',
        uid: v.uid ?? `${v.variable_id}-${Date.now()}`,
        total: meses.reduce((sum, m) => sum + Number(v[m] || 0), 0),
        ...Object.fromEntries(meses.map((m) => [m, Number(v[m] ?? 0)])),
      })),
    }
  })
}

/*save*/
async function saveForm() {
  const payload = {
    ...form.value,
    detalles: form.value.detalles.map((d) => ({
      cultivo_id: d.cultivo_id,
      variables: d.variables.map((v) => ({
        id: v.id ?? null,
        variable_id: v.variable_id,
        ...Object.fromEntries(
          ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'].map(
            (m) => [m, Number(v[m]) || 0],
          ),
        ),
      })),
    })),
  }

  try {
    $q.loading.show({
      message: isEdit.value ? 'Actualizando registro...' : 'Guardando registro...',
    })

    const url = '/api/v1/registros'
    const req = isEdit.value
      ? api.put(`${url}/${props.registro.id}`, payload)
      : api.post(url, payload)

    await req

    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Registro actualizado correctamente' : 'Registro creado con éxito',
    })

    emit('saved')
    closeForm()
  } catch (error) {
    console.log('ERROR LARAVEL:', error.response?.data)
    $q.notify({ type: 'negative', message: 'Ocurrió un error, intente nuevamente' })
  } finally {
    $q.loading.hide()
  }
}

function resetForm() {
  form.value = {
    region_id: null,
    provincia_id: null,
    distrito_id: null,
    anio: null,
    observacion: '',
    detalles: [],
  }
  provincias.value = []
  distritos.value = []
}

/*close*/
function closeForm() {
  showing.value = false
  emit('update:modelValue', false)
  resetForm()
}
</script>

<style scoped>
.q-dialog__inner {
  padding: 0;
}
</style>
