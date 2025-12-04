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
          color="green-7"
        />
      </div>

      <div class="col-12 col-md-3">
        <q-input
          color="green-7"
          v-model.number="cantidad"
          type="number"
          min="1"
          label="Total"
          dense
          outlined
        />
      </div>

      <div class="col-12 col-md-auto">
        <q-btn color="green-7" label="Agregar" @click="addRow" dense unelevated />
      </div>
    </div>

    <!-- TABLA -->
    <q-table
      class="q-mt-md"
      :rows="rows"
      :columns="cols"
      row-key="uid"
      dense
      bordered
      separator="horizontal"
      :striped="true"
    >
      <template #body-cell-variedad="props">
        <q-td align="center">{{ props.row.variedad_nombre }}</q-td>
      </template>

      <template #body-cell-total="props">
        <q-td align="center">{{ props.row.total }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td align="center">
          <q-btn dense flat icon="delete" color="negative" @click="removeRow(props.row.uid)" />
        </q-td>
      </template>

      <template #bottom="scope">
        <div class="full-width q-pa-sm flex flex-center">
          <div class="flex items-center q-gutter-sm">
            <span class="text-weight-medium">Registros por página:</span>

            <q-select
              dense
              borderless
              v-model="scope.pagination.rowsPerPage"
              :options="scope.pagination.rowsPerPageOptions"
              style="width: 70px"
            />
          </div>

          <!-- Paginación -->
          <q-pagination
            class="q-ml-xl"
            v-model="scope.pagination.page"
            :max="scope.pagesNumber"
            boundary-links
            direction-links
            dense
            color="green-7"
          />
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useVariedadAnimalStore } from 'stores/variedadAnimal'
import { useQuasar } from 'quasar'

const $q = useQuasar()
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
  { name: 'variedad', label: 'VARIEDAD', field: 'variedad_nombre', align: 'center' },
  { name: 'total', label: 'TOTAL', field: 'total', align: 'center' },
  { name: 'actions', label: 'ACCIONES', align: 'center' },
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
  if (!selectedVariedad.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona una variedad.',
    })
    return
  }

  if (!cantidad.value || cantidad.value <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Ingresa un total válido.',
    })
    return
  }

  //variedades duplicadas
  const existe = rows.value.some((r) => Number(r.variedad_id) === Number(selectedVariedad.value))

  if (existe) {
    $q.notify({
      type: 'negative',
      message: 'Esta variedad ya fue agregada.',
    })
    selectedVariedad.value = null
    cantidad.value = 0
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
