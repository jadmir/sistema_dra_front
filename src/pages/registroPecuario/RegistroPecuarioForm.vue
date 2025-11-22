<template>
  <q-dialog v-model="isOpen" persistent maximized>
    <q-card style="min-width: 800px; max-width: 1200px">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          {{ editing ? 'Editar Registro Pecuario' : 'Nuevo Registro Pecuario' }}
        </q-toolbar-title>
        <q-btn flat dense round icon="close" @click="close" />
      </q-toolbar>

      <q-card-section class="q-pt-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.codigo_establo" label="Código Establo" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.ubigeo" label="Ubigeo" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.nombre_establo" label="Nombre Establo" />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              dense
              outlined
              v-model="form.producto_razon_social"
              label="Razón social del producto"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.mes_de_referencia" label="Mes de referencia" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.anio" label="Año" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.ruc" label="RUC" />
          </div>

          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.region" label="Región" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.provincia" label="Provincia" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.distrito" label="Distrito" />
          </div>
          <div class="col-12 col-md-4">
            <q-input dense outlined v-model="form.direccion" label="Direccion" />
          </div>

          <div class="col-12">
            <q-separator spaced />
          </div>

          <div class="col-12">
            <q-tabs v-model="tab" class="text-primary" dense>
              <q-tab name="animales" label="Animales" />
              <q-tab name="leche" label="Leche" />
              <q-tab name="saca" label="Saca" />
              <q-tab name="natalidad" label="Natalidad / Mortalidad" />
              <q-tab name="informe" label="Informe Técnico" />
            </q-tabs>

            <q-tab-panels v-model="tab" animated>
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

                <!-- BOTONES SOLO EN ESTA PESTAÑA -->
                <div class="row justify-end q-gutter-sm q-mt-lg">
                  <q-btn flat label="Cancelar" @click="close" />
                  <q-btn
                    color="primary"
                    label="Guardar Registro"
                    :loading="saving"
                    @click="guardarRegistro"
                  />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRegistroPecuarioStore } from 'src/stores/registroPecuario'

/* Tabs */
import AnimalesTab from './components/AnimalesTab.vue'
import LecheTab from './components/LecheTab.vue'
import SacaTab from './components/SacaTab.vue'
import NatalidadMortalidadTab from './components/NatalidadMortalidadTab.vue'
import InformeTecnicoTab from './components/InformeTecnicoTab.vue'

/* Props / Emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false }, // para v-model en el dialog
  registro: { type: [Object, null], default: null }, // registro para editar
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const $q = useQuasar()
const store = useRegistroPecuarioStore()

/* local state */
const isOpen = ref(false)
const tab = ref('animales')
const saving = ref(false)

/* computed */
const editing = computed(() => !!props.registro)
const registroId = computed(() => props.registro?.id ?? null)

/* Form structure acorde a tu backend */
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
  animales: [], // AgriAnimales[]
  producto_leches: [], // AgriProductoLeche[] (campo backend: producto_leches)
  leche_fresca: {}, // LecheFresca
  saca_reproduccion: [], // SacaReproduccion[]
  saca_vacuno_descarte: [], // SacaVacunoDescarte[]
  natalidad: [], // AgriNatalidad[]
  mortalidad: [], // AgriMortalidad[]
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

/* Sincronizar apertura del dialog con el prop modelValue */
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

/* Cuando el usuario cierre/abra el dialog desde dentro (isOpen cambia), avisar al padre */
watch(isOpen, (val) => {
  emit('update:modelValue', val)
})

/* Si llega un registro para editar, llenamos el form */
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
/* Helpers */
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

/* llena el form con la estructura que retorna tu backend en show() */
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

/* Cerrar dialog (emitir al padre) */
function close() {
  isOpen.value = false
  resetLocalForm()
  emit('close')
}

/* Validaciones sencillas antes de guardar */
function validateBeforeSave() {
  // Campos obligatorios según tu CONTROLLER
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

  // Validación especial para año
  if (String(form.anio).length !== 4) {
    $q.notify({ type: 'negative', message: 'Ingrese un año válido (4 dígitos).' })
    tab.value = 'animales'
    return false
  }

  return true
}

/* Construir payload final tal como lo espera tu backend */
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

/* Guardar (create o update) */
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
</style>
