<template>
  <div>
    <div class="row q-col-gutter-md items-end">
      <div class="col-12 col-md-6">
        <q-select
          v-model="selectedVariedad"
          :options="variedadOptions"
          option-value="id"
          option-label="nombre"
          label="Variedad animal"
          dense
          outlined
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-md-3">
        <q-input v-model.number="cantidad" type="number" min="1" label="Total" dense outlined />
      </div>

      <div class="col-12 col-md-auto">
        <q-btn color="primary" label="Agregar" @click="addRow" dense />
      </div>
    </div>

    <!-- TABLA -->
    <q-table class="q-mt-md" :rows="rows" :columns="cols" row-key="uid" dense flat>
      <template #body-cell-variedad="props">
        <q-td>{{ props.row.variedad_nombre }}</q-td>
      </template>

      <template #body-cell-total="props">
        <q-td align="center">{{ props.row.total }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td align="center">
          <q-btn dense flat icon="delete" color="negative" @click="removeRow(props.row.uid)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useVariedadAnimalStore } from 'stores/variedadAnimal'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

/* store */
const storeVar = useVariedadAnimalStore()
const variedadOptions = ref([])

/* CARGAR VARIEDADES */
onMounted(async () => {
  await storeVar.fetchVariedades(1)
  variedadOptions.value = storeVar.variedades || []
})

/* TABLA */
const rows = ref([])

const cols = [
  { name: 'variedad', label: 'Variedad', field: 'variedad_nombre' },
  { name: 'total', label: 'Total', field: 'total', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const selectedVariedad = ref(null)
const cantidad = ref(0)

/* SINCRONIZACIÓN CON PADRE */
watch(
  () => props.modelValue,
  (v) => {
    rows.value = (v || []).map((r) => ({
      id: r.id ?? null,
      variedad_id: r.variedad_id ?? r.variedad?.id ?? null,
      variedad_nombre: r.variedad_nombre ?? r.variedad?.nombre ?? '',
      total: Number(r.total ?? 0),
      uid: r.uid ?? `${r.variedad_id}-${r.id ?? Math.random()}`,
    }))
  },
  { immediate: true, deep: true },
)

/* AGREGAR */
function addRow() {
  if (!selectedVariedad.value || !cantidad.value) return

  // evitar repetidos
  if (rows.value.some((r) => Number(r.variedad_id) === Number(selectedVariedad.value))) {
    cantidad.value = 0
    selectedVariedad.value = null
    return
  }

  const variety = variedadOptions.value.find((v) => v.id === selectedVariedad.value)

  const newRow = {
    id: null,
    variedad_id: variety.id,
    variedad_nombre: variety.nombre,
    total: Number(cantidad.value),
    uid: `${variety.id}-${Date.now()}`,
  }

  rows.value.push(newRow)
  emitUpdate()

  selectedVariedad.value = null
  cantidad.value = 0
}

/* QUITAR FILA */
function removeRow(uid) {
  rows.value = rows.value.filter((r) => r.uid !== uid)
  emitUpdate()
}

/* EMITIR AL PADRE */
function emitUpdate() {
  emit(
    'update:modelValue',
    rows.value.map((r) => ({
      id: r.id ?? undefined,
      variedad_id: r.variedad_id,
      variedad_nombre: r.variedad_nombre,
      total: r.total,
    })),
  )
}
</script>
