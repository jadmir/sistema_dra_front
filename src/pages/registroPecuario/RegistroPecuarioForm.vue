<template>
  <q-dialog v-model="isOpen" persistent maximized>
    <q-card style="min-width: 800px; max-width: 1200px">
      <q-card-section class="bg-gradient-green text-white flex justify-between items-center">
        <div class="text-h6">
          {{ editing ? 'Editar Registro Pecuario' : 'Nuevo Registro Pecuario' }}
        </div>
        <q-btn flat dense round icon="close" class="text-white" @click="close" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form ref="formRef" @submit.prevent="guardarRegistro">
          <div class="row q-col-gutter-md">
            <!-- Codigo Establo -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.codigo_establo"
                label="Código Establo"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'El código de establo es requerido']"
              />
            </div>

            <!-- Ubigeo -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.ubigeo"
                label="Ubigeo"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'El ubigeo es requerido']"
              >
                <template #prepend>
                  <q-icon name="location_on" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Nombre Establo -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.nombre_establo"
                label="Nombre Establo"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'El nombre del establo es requerido']"
              >
                <template #prepend>
                  <q-icon name="store" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Razón social -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.producto_razon_social"
                label="Razón social del producto"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'La razón social es requerida']"
              >
                <template #prepend>
                  <q-icon name="business" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Mes de referencia -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.mes_de_referencia"
                label="Mes de referencia"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'El mes de referencia es requerido']"
              >
                <template #prepend>
                  <q-icon name="calendar_month" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Año -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.anio"
                label="Año"
                color="green-7"
                lazy-rules
                :rules="[
                  (v) => !!v || 'El año es requerido',
                  (v) => String(v).length === 4 || 'Debe ser un año válido (4 dígitos)',
                ]"
              >
                <template #prepend>
                  <q-icon name="event" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- RUC -->
            <div class="col-12 col-md-4">
              <q-input dense outlined v-model="form.ruc" label="RUC" type="tel" color="green-7">
                <template #prepend>
                  <q-icon name="badge" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Región -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.region"
                label="Región"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'La región es requerida']"
              >
                <template #prepend>
                  <q-icon name="map" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Provincia -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.provincia"
                label="Provincia"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'La provincia es requerida']"
              >
                <template #prepend>
                  <q-icon name="location_city" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Distrito -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.distrito"
                label="Distrito"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'El distrito es requerido']"
              >
                <template #prepend>
                  <q-icon name="place" color="green-7" />
                </template>
              </q-input>
            </div>

            <!-- Dirección -->
            <div class="col-12 col-md-4">
              <q-input
                dense
                outlined
                v-model="form.direccion"
                label="Direccion"
                color="green-7"
                lazy-rules
                :rules="[(v) => !!v || 'La direccion es requerida']"
              >
                <template #prepend>
                  <q-icon name="home" color="green-7" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-tabs
                v-model="tab"
                class="tabs-verdes"
                active-color="white"
                indicator-color="green-8"
                inline-label
              >
                <q-tab name="animales" label="Animales" />
                <q-tab name="leche" label="Leche" />
                <q-tab name="saca" label="Saca" />
                <q-tab name="natalidad" label="Natalidad / Mortalidad" />
                <q-tab name="informe" label="Informe Técnico" />
              </q-tabs>

              <q-tab-panels v-model="tab" class="tab-panel-verde">
                <q-tab-panel name="animales" class="q-pa-md">
                  <AnimalesTab v-model="form.animales" :registro-id="registroId" />
                </q-tab-panel>

                <q-tab-panel name="leche" class="q-pa-md">
                  <LecheTab
                    v-model:producto_leches="form.producto_leches"
                    v-model:leche_fresca="form.leche_fresca"
                  />
                </q-tab-panel>

                <q-tab-panel name="saca" class="q-pa-md">
                  <SacaTab
                    v-model:sacaReproduccion="form.saca_reproduccion"
                    v-model:sacaVacuno="form.saca_vacuno_descarte"
                  />
                </q-tab-panel>

                <q-tab-panel name="natalidad" class="q-pa-md">
                  <NatalidadMortalidadTab
                    v-model:natalidad="form.natalidad"
                    v-model:mortalidad="form.mortalidad"
                  />
                </q-tab-panel>

                <q-tab-panel name="informe" class="q-pa-md">
                  <InformeTecnicoTab v-model="form.informe_tecnico" />

                  <!--BOTONES SOLO EN ESTA PESTAÑA -->
                  <div class="row justify-end q-gutter-sm q-mt-lg">
                    <q-btn flat label="Cancelar" color="grey-7" @click="close" />
                    <q-btn
                      class="btn-green"
                      :label="editing ? 'Actualizar Registro' : 'Guardar Registro'"
                      :icon="editing ? 'save' : 'add'"
                      :loading="saving"
                      @click="guardarRegistro"
                    />
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRegistroPecuarioStore } from 'src/stores/registroPecuario'

import AnimalesTab from './components/AnimalesTab.vue'
import LecheTab from './components/LecheTab.vue'
import SacaTab from './components/SacaTab.vue'
import NatalidadMortalidadTab from './components/NatalidadMortalidadTab.vue'
import InformeTecnicoTab from './components/InformeTecnicoTab.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  registro: { type: [Object, null], default: null },
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const $q = useQuasar()
const store = useRegistroPecuarioStore()

const isOpen = ref(false)
const tab = ref('animales')
const saving = ref(false)

const editing = computed(() => !!props.registro)
const registroId = computed(() => props.registro?.id ?? null)

const form = reactive({
  codigo_establo: '',
  ubigeo: '',
  mes_de_referencia: '',
  anio: '',
  region: '',
  provincia: '',
  distrito: '',
  nombre_establo: '',
  producto_razon_social: '',
  direccion: '',
  ruc: '',
  animales: [], // AgriAnimales
  producto_leches: [], // AgriProductoLeche
  leche_fresca: {}, // LecheFresca
  saca_reproduccion: [], // SacaReproduccion
  saca_vacuno_descarte: [], // SacaVacunoDescarte
  natalidad: [], // AgriNatalidad
  mortalidad: [], // AgriMortalidad
  informe_tecnico: {
    informante: '',
    email: '',
    telefono: '',
    cargo: '',
    tecnico: '',
    fecha: '',
    observaciones: '',
  },
})

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val

    if (val) {
      if (props.registro) {
        fillFormFromRegistro(props.registro)
      }
    } else {
      if (!props.registro) {
        resetLocalForm()
      }
    }
  },
  { immediate: true },
)

watch(isOpen, (val) => {
  emit('update:modelValue', val)
})

watch(
  () => props.registro,
  (val) => {
    if (val) {
      fillFormFromRegistro(val)
    } else {
      resetLocalForm()
    }
  },
  { immediate: true, deep: true },
)
function resetLocalForm() {
  form.codigo_establo = ''
  form.ubigeo = ''
  form.mes_de_referencia = ''
  form.anio = ''
  form.region = ''
  form.provincia = ''
  form.distrito = ''
  form.nombre_establo = ''
  form.producto_razon_social = ''
  form.direccion = ''
  form.ruc = ''

  form.animales = []
  form.producto_leches = []
  form.leche_fresca = {}
  form.saca_reproduccion = []
  form.saca_vacuno_descarte = []
  form.natalidad = []
  form.mortalidad = []
  form.informe_tecnico = {
    informante: '',
    email: '',
    telefono: '',
    cargo: '',
    tecnico: '',
    fecha: '',
    observaciones: '',
  }
}

function fillFormFromRegistro(reg) {
  form.codigo_establo = reg.codigo_establo ?? ''
  form.ubigeo = reg.ubigeo ?? ''
  form.mes_de_referencia = reg.mes_de_referencia ?? ''
  form.anio = reg.anio ?? ''
  form.region = reg.region ?? ''
  form.provincia = reg.provincia ?? ''
  form.distrito = reg.distrito ?? ''
  form.nombre_establo = reg.nombre_establo ?? ''
  form.producto_razon_social = reg.producto_razon_social ?? ''
  form.direccion = reg.direccion ?? ''
  form.ruc = reg.ruc ?? ''

  form.animales = reg.animales || []
  form.producto_leches = reg.productos_leche || []
  form.leche_fresca = reg.leche_fresca || {}
  form.saca_reproduccion = reg.saca_reproduccion || []
  form.saca_vacuno_descarte = reg.saca_vacuno_descarte || []
  form.natalidad = reg.natalidad || []
  form.mortalidad = reg.mortalidad || []

  form.informe_tecnico = {
    informante: reg.informe_tecnico?.informante ?? '',
    email: reg.informe_tecnico?.email ?? '',
    telefono: reg.informe_tecnico?.telefono ?? '',
    cargo: reg.informe_tecnico?.cargo ?? '',
    tecnico: reg.informe_tecnico?.tecnico ?? '',
    observaciones: reg.informe_tecnico?.observaciones ?? '',
    fecha: reg.informe_tecnico?.fecha ?? '',
  }
}

function close() {
  isOpen.value = false
  resetLocalForm()
  emit('close')
}

/* Validaciones sencillas antes de guardar */
function validateBeforeSave() {
  const requiredFields = [
    { v: form.mes_de_referencia, label: 'Mes de referencia' },
    { v: form.anio, label: 'Año' },
    { v: form.region, label: 'Región' },
    { v: form.provincia, label: 'Provincia' },
    { v: form.distrito, label: 'Distrito' },
    { v: form.nombre_establo, label: 'Nombre del establo' },
    { v: form.producto_razon_social, label: 'Razón social del producto' },
  ]

  for (const field of requiredFields) {
    if (!field.v || String(field.v).trim() === '') {
      $q.notify({ type: 'negative', message: `Ingrese ${field.label}.` })
      tab.value = 'animales'
      return false
    }
  }

  // Validación para año
  if (String(form.anio).length !== 4) {
    $q.notify({ type: 'negative', message: 'Ingrese un año válido (4 dígitos).' })
    tab.value = 'animales'
    return false
  }

  return true
}

function buildPayload() {
  return {
    codigo_establo: form.codigo_establo || null,
    ubigeo: form.ubigeo || null,
    mes_de_referencia: form.mes_de_referencia,
    anio: form.anio,
    region: form.region || null,
    provincia: form.provincia || null,
    distrito: form.distrito || null,
    nombre_establo: form.nombre_establo,
    producto_razon_social: form.producto_razon_social,
    direccion: form.direccion || null,
    ruc: form.ruc || null,

    animales: form.animales || [],
    producto_leches: form.producto_leches || [],
    leche_fresca: form.leche_fresca || {},

    saca_reproduccion: form.saca_reproduccion || [],
    saca_vacuno_descarte: form.saca_vacuno_descarte || [],

    natalidad: form.natalidad || [],
    mortalidad: form.mortalidad || [],

    informe_tecnico: form.informe_tecnico || {},
  }
}

async function guardarRegistro() {
  if (!validateBeforeSave()) return

  const payload = buildPayload()
  saving.value = true

  try {
    if (props.registro && props.registro.id) {
      await store.updateRegistro(props.registro.id, payload)
      $q.notify({ type: 'positive', message: 'Registro actualizado correctamente.' })
    } else {
      await store.createRegistro(payload)
      $q.notify({ type: 'positive', message: 'Registro creado correctamente.' })
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Error guardando registro:', err)
    $q.notify({
      type: 'negative',
      message: err?.response?.data?.message || err?.message || 'Error al guardar el registro',
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.q-dialog__inner {
  max-width: 1200px;
}

.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  color: white;
}

.btn-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  color: white;
  font-weight: 600;
}

.btn-green:hover {
  background: linear-gradient(135deg, #4a7f59 0%, #2d5f3d 100%);
}

.tabs-verdes {
  background-color: #e8f5e9;
  color: #1b5e20;
  border-radius: 8px;
}

.tabs-verdes .q-tab {
  font-weight: 600;
}

.tabs-verdes .q-tab--active {
  background-color: #2e7d32 !important;
  color: white !important;
}

.tab-panel-verde {
  background: #f1f8e9;
  border-radius: 8px;
  padding: 16px;
}
</style>
