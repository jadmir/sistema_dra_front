<template>
  <div>
    <div class="row q-col-gutter-md items-end">
      <div class="col-12 col-md-5">
        <q-select
          v-model="selectedNatalidad"
          :options="natalidadOptions"
          option-value="id"
          option-label="concepto"
          label="Concepto Natalidad"
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input v-model.number="natalidadCantidad" type="number" label="Cantidad" dense outlined />
      </div>
      <div class="col-12 col-md-auto">
        <q-btn color="primary" label="Agregar" @click="addNatalidad" dense />
      </div>
    </div>

    <q-table
      :rows="rowsNatalidad"
      :columns="colsNatalidad"
      row-key="uid"
      dense
      flat
      class="q-mt-sm"
    >
      <template #body-cell-actions="props"
        ><q-td align="center"
          ><q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click="removeNatalidad(props.row.uid)" /></q-td
      ></template>
    </q-table>

    <q-separator class="q-my-md" />

    <div class="row q-col-gutter-md items-end">
      <div class="col-12 col-md-5">
        <q-select
          v-model="selectedMortVar"
          :options="variedades"
          option-value="id"
          option-label="nombre"
          label="Variedad Mortalidad"
          dense
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model.number="mortalidadCantidad"
          type="number"
          label="Cantidad"
          dense
          outlined
        />
      </div>
      <div class="col-12 col-md-auto">
        <q-btn color="primary" label="Agregar" @click="addMortalidad" dense />
      </div>
    </div>

    <q-table
      :rows="rowsMortalidad"
      :columns="colsMortalidad"
      row-key="uid"
      dense
      flat
      class="q-mt-sm"
    >
      <template #body-cell-actions="props"
        ><q-td align="center"
          ><q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click="removeMortalidad(props.row.uid)" /></q-td
      ></template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useVariedadAnimalStore } from 'stores/variedadAnimal'

const props = defineProps({
  natalidad: { type: Array, default: () => [] },
  mortalidad: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:natalidad', 'update:mortalidad'])

const variedades = ref([])
const natalidadOptions = ref([])

const storeVar = useVariedadAnimalStore()
onMounted(async () => {
  await storeVar.fetchVariedades(1)
  variedades.value = storeVar.variedades || []
  try {
    const r = await api.get('/api/v1/agri-natalidad-mortalidad')
    natalidadOptions.value = r.data.data || r.data || []
  } catch {
    natalidadOptions.value = []
  }
})

const rowsNatalidad = ref(
  (props.natalidad || []).map((n) => ({
    ...n,
    uid: n.id ?? Date.now() + Math.random(),
    concepto_text: n.concepto_text ?? n.natalidad_mortalidad?.concepto ?? '',
  })),
)
const rowsMortalidad = ref(
  (props.mortalidad || []).map((m) => ({
    uid: m.id ?? Date.now() + Math.random(),
    id: m.id,
    id_agri_variedad_animal: m.id_agri_variedad_animal,
    cantidad: Number(m.cantidad),
    variedad_nombre: m.variedad?.nombre || '',
    variedad: m.variedad,
  })),
)

const colsNatalidad = [
  { name: 'concepto', label: 'Concepto', field: 'concepto_text' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'actions', label: 'Acciones' },
]
const colsMortalidad = [
  { name: 'variedad', label: 'Variedad', field: 'variedad_nombre' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'actions', label: 'Acciones' },
]

const selectedNatalidad = ref(null)
const natalidadCantidad = ref(null)
const selectedMortVar = ref(null)
const mortalidadCantidad = ref(null)

watch(
  () => props.natalidad,
  (v) =>
    (rowsNatalidad.value = (v || []).map((n) => ({
      ...n,
      uid: n.id ?? Date.now() + Math.random(),
      concepto_text: n.concepto_text ?? n.natalidad_mortalidad?.concepto ?? '',
    }))),
  { deep: true, immediate: true },
)

watch(
  () => props.mortalidad,
  (v) =>
    (rowsMortalidad.value = (v || []).map((m) => ({
      uid: m.id ?? Date.now() + Math.random(),
      id: m.id,
      id_agri_variedad_animal: m.id_agri_variedad_animal,
      cantidad: Number(m.cantidad),
      variedad_nombre: m.variedad_nombre ?? m.variedad?.nombre ?? '',
      variedad: m.variedad ?? null,
    }))),
  { deep: true, immediate: true },
)

function addNatalidad() {
  if (!selectedNatalidad.value || !natalidadCantidad.value) return
  const concept = natalidadOptions.value.find((x) => x.id === selectedNatalidad.value)
  const newRow = {
    uid: Date.now(),
    natalidad_mortalidad_id: concept.id,
    concepto_text: concept.concepto,
    cantidad: Number(natalidadCantidad.value),
    natalidad_mortalidad: concept,
  }
  rowsNatalidad.value.push(newRow)
  emit(
    'update:natalidad',
    rowsNatalidad.value.map((r) => ({
      id: r.id ?? undefined,
      natalidad_mortalidad_id: r.natalidad_mortalidad_id,
      concepto_text: r.concepto_text,
      cantidad: r.cantidad,
    })),
  )
  selectedNatalidad.value = null
  natalidadCantidad.value = null
}

function removeNatalidad(uid) {
  rowsNatalidad.value = rowsNatalidad.value.filter((r) => r.uid !== uid)
  emit(
    'update:natalidad',
    rowsNatalidad.value.map((r) => ({
      id: r.id ?? undefined,
      natalidad_mortalidad_id: r.natalidad_mortalidad_id,
      cantidad: r.cantidad,
    })),
  )
}

function addMortalidad() {
  if (!selectedMortVar.value || !mortalidadCantidad.value) return
  const v = variedades.value.find((x) => x.id === selectedMortVar.value)
  const newRow = {
    uid: Date.now(),
    id_agri_variedad_animal: v.id,
    variedad_nombre: v.nombre,
    cantidad: Number(mortalidadCantidad.value),
  }
  rowsMortalidad.value.push(newRow)
  emit(
    'update:mortalidad',
    rowsMortalidad.value.map((r) => ({
      id: r.id ?? undefined,
      id_agri_variedad_animal: r.id_agri_variedad_animal,
      variedad_nombre: r.variedad_nombre,
      cantidad: r.cantidad,
    })),
  )
  selectedMortVar.value = null
  mortalidadCantidad.value = null
}

function removeMortalidad(uid) {
  rowsMortalidad.value = rowsMortalidad.value.filter((r) => r.uid !== uid)
  emit(
    'update:mortalidad',
    rowsMortalidad.value.map((r) => ({
      id: r.id ?? undefined,
      id_agri_variedad_animal: r.id_agri_variedad_animal,
      cantidad: r.cantidad,
    })),
  )
}
</script>
