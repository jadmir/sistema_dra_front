<template>
  <div>
    <!-- Reproductores -->
    <div class="q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Saca Reproductores</div>
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-5">
          <q-select
            v-model="selReprodVar"
            :options="variedadOptions"
            option-value="id"
            option-label="nombre"
            label="Variedad"
            dense
            outlined
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="reprodUnidad"
            type="number"
            label="Saca (unidades)"
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-2">
          <q-input
            v-model.number="reprodPrecio"
            type="number"
            label="Precio venta"
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-auto">
          <q-btn color="primary" label="Agregar" @click="addReprod" dense />
        </div>
      </div>

      <q-table :rows="rowsReprod" :columns="colsReprod" row-key="uid" dense flat class="q-mt-sm">
        <template #body-cell-actions="props"
          ><q-td align="center"
            ><q-btn
              dense
              flat
              icon="delete"
              color="negative"
              @click="removeReprod(props.row.uid)" /></q-td
        ></template>
      </q-table>
    </div>

    <!-- Vacuno descarte -->
    <div>
      <div class="text-subtitle2 q-mb-sm">Saca Vacuno Descarte</div>
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-5">
          <q-select
            v-model="selSacaVar"
            :options="variedadOptions"
            option-value="id"
            option-label="nombre"
            label="Variedad"
            dense
            outlined
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-2">
          <q-input
            v-model.number="sacaUnidad"
            type="number"
            label="Saca (unidades)"
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model.number="sacaPeso" type="number" label="Peso vivo (Kg)" dense outlined />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model.number="sacaPrecio" type="number" label="Precio venta" dense outlined />
        </div>
        <div class="col-12 col-md-auto">
          <q-btn color="primary" label="Agregar" @click="addSaca" dense />
        </div>
      </div>

      <q-table :rows="rowsSaca" :columns="colsSaca" row-key="uid" dense flat class="q-mt-sm">
        <template #body-cell-actions="props"
          ><q-td align="center"
            ><q-btn
              dense
              flat
              icon="delete"
              color="negative"
              @click="removeSaca(props.row.uid)" /></q-td
        ></template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useVariedadAnimalStore } from 'stores/variedadAnimal'

const props = defineProps({
  sacaReproduccion: { type: Array, default: () => [] },
  sacaVacuno: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:sacaReproduccion', 'update:sacaVacuno'])

const storeVar = useVariedadAnimalStore()
const variedadOptions = ref([])

onMounted(async () => {
  await storeVar.fetchVariedades(1)
  variedadOptions.value = storeVar.variedades || []
})

function mapVariedadNombre(r) {
  return (
    r.variedad?.nombre ||
    r.variedad_nombre ||
    variedadOptions.value.find((v) => v.id === r.id_agri_variedad_animal)?.nombre ||
    ''
  )
}

const rowsReprod = ref(
  (props.sacaReproduccion || []).map((r) => ({
    ...r,
    uid: r.id || crypto.randomUUID(),
    variedad_nombre: mapVariedadNombre(r),
  })),
)

const rowsSaca = ref(
  (props.sacaVacuno || []).map((r) => ({
    ...r,
    uid: r.id || crypto.randomUUID(),
    variedad_nombre: mapVariedadNombre(r),
  })),
)

const colsReprod = [
  { name: 'variedad', label: 'Variedad', field: 'variedad_nombre' },
  { name: 'saca', label: 'Saca', field: 'saca_unidad', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'precio_venta', align: 'center' },
  { name: 'actions', label: 'Acciones' },
]
const colsSaca = [
  { name: 'variedad', label: 'Variedad', field: 'variedad_nombre' },
  { name: 'saca', label: 'Saca', field: 'saca_unidad', align: 'center' },
  { name: 'peso', label: 'Peso (Kg)', field: 'peso_promedio_vivo', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'precio_venta', align: 'center' },
  { name: 'actions', label: 'Acciones' },
]

const selReprodVar = ref(null)
const reprodUnidad = ref(null)
const reprodPrecio = ref(null)
const selSacaVar = ref(null)
const sacaUnidad = ref(null)
const sacaPeso = ref(null)
const sacaPrecio = ref(null)

watch(
  () => props.sacaReproduccion,
  (v) =>
    (rowsReprod.value = (v || []).map((r) => ({
      ...r,
      uid: r.id || crypto.randomUUID(),
      variedad_nombre: mapVariedadNombre(r),
    }))),
  { deep: true, immediate: true },
)

watch(
  () => props.sacaVacuno,
  (v) =>
    (rowsSaca.value = (v || []).map((r) => ({
      ...r,
      uid: r.id || crypto.randomUUID(),
      variedad_nombre: mapVariedadNombre(r),
    }))),
  { deep: true, immediate: true },
)

function addReprod() {
  if (!selReprodVar.value || (reprodUnidad.value === null && reprodPrecio.value === null)) return

  const v = variedadOptions.value.find((x) => x.id === selReprodVar.value)

  const newRow = {
    uid: crypto.randomUUID(),
    id_agri_variedad_animal: v.id,
    variedad_nombre: v.nombre,
    saca_unidad: reprodUnidad.value ?? null,
    precio_venta: reprodPrecio.value ?? null,
  }

  rowsReprod.value.push(newRow)
  emit(
    'update:sacaReproduccion',
    rowsReprod.value.map((r) => ({
      id: r.id ?? undefined,
      id_agri_variedad_animal: r.id_agri_variedad_animal,
      variedad_nombre: r.variedad_nombre,
      saca_unidad: r.saca_unidad,
      precio_venta: r.precio_venta,
    })),
  )

  selReprodVar.value = null
  reprodUnidad.value = null
  reprodPrecio.value = null
}

function addSaca() {
  if (!selSacaVar.value || (sacaUnidad.value === null && sacaPrecio.value === null)) return

  const v = variedadOptions.value.find((x) => x.id === selSacaVar.value)

  const newRow = {
    uid: crypto.randomUUID(),
    id_agri_variedad_animal: v.id,
    variedad_nombre: v.nombre,
    saca_unidad: sacaUnidad.value ?? null,
    peso_promedio_vivo: sacaPeso.value ?? null,
    precio_venta: sacaPrecio.value ?? null,
  }

  rowsSaca.value.push(newRow)
  emit(
    'update:sacaVacuno',
    rowsSaca.value.map((r) => ({
      id: r.id ?? undefined,
      id_agri_variedad_animal: r.id_agri_variedad_animal,
      variedad_nombre: r.variedad_nombre,
      saca_unidad: r.saca_unidad,
      peso_promedio_vivo: r.peso_promedio_vivo,
      precio_venta: r.precio_venta,
    })),
  )

  selSacaVar.value = null
  sacaUnidad.value = null
  sacaPeso.value = null
  sacaPrecio.value = null
}

function removeReprod(uid) {
  rowsReprod.value = rowsReprod.value.filter((r) => r.uid !== uid)
  emit(
    'update:sacaReproduccion',
    rowsReprod.value.map((r) => ({
      id: r.id ?? undefined,
      id_agri_variedad_animal: r.id_agri_variedad_animal,
      saca_unidad: r.saca_unidad,
      precio_venta: r.precio_venta,
    })),
  )
}

function removeSaca(uid) {
  rowsSaca.value = rowsSaca.value.filter((r) => r.uid !== uid)
  emit(
    'update:sacaVacuno',
    rowsSaca.value.map((r) => ({
      id: r.id ?? undefined,
      id_agri_variedad_animal: r.id_agri_variedad_animal,
      saca_unidad: r.saca_unidad,
      peso_promedio_vivo: r.peso_promedio_vivo,
      precio_venta: r.precio_venta,
    })),
  )
}
</script>
