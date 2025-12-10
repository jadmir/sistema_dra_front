<template>
  <div class="q-mt-md">
    <!-- AÑADIR CULTIVO -->
    <div class="row items-center q-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-select
          v-model="selectedCultivo"
          :options="cultivoOptions"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          dense
          outlined
          color="green-7"
          label="Seleccionar cultivo"
        />
      </div>

      <div class="col-auto">
        <q-btn color="green-7" label="Agregar cultivo" icon="add" unelevated @click="addCultivo" />
      </div>
    </div>

    <!-- TABLA DE CULTIVOS -->
    <div v-for="cultivo in rows" :key="cultivo.uid" class="q-mb-xl">
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6 text-green-8">
            <q-icon name="spa" color="green-7" class="q-mr-sm" />
            {{ cultivo.nombre }}
          </div>

          <q-btn flat round dense icon="delete" color="red-6" @click="removeCultivo(cultivo.uid)" />
        </div>

        <!-- BOTON AÑADIR VARIABLE -->
        <div class="row items-center q-gutter-md q-mb-sm">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="cultivo.selectedVariable"
              :options="variableOptions"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              dense
              outlined
              color="green-7"
              label="Selecciona variable"
            />
          </div>

          <div class="col-auto">
            <q-btn
              color="green-7"
              icon="add"
              label="Agregar variable"
              dense
              unelevated
              @click="addVariable(cultivo)"
            />
          </div>
        </div>

        <!-- TABLA VARIABLES -->
        <q-table :rows="cultivo.variables" :columns="columns" row-key="uid" flat dense>
          <template v-for="mes in meses" :key="mes" #[`body-cell-${mes}`]="props">
            <q-td>
              <q-input
                v-model="rowTempValues[props.row.uid][mes]"
                type="number"
                dense
                outlined
                step="0.01"
                min="0"
                color="green-7"
                class="full-width"
                @update:model-value="updateMonthValue(props.row, mes)"
                @blur="formatTwoDecimals(props.row, mes)"
              />
            </q-td>
          </template>

          <!-- TOTAL -->
          <template #body-cell-total="props">
            <q-td class="text-weight-bold">
              {{ props.row.total.toFixed(2) }}
            </q-td>
          </template>

          <!-- ACCIONES -->
          <template #body-cell-actions="props">
            <q-td>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="red"
                @click="removeVariable(cultivo, props.row.uid)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const columns = [
  { name: 'variable', label: 'VARIABLE', field: 'nombre', align: 'left' },
  ...meses.map((m) => ({ name: m, label: m.toUpperCase(), field: m, align: 'center' })),
  { name: 'total', label: 'TOTAL', field: 'total', align: 'center' },
  { name: 'actions', label: 'ACCIONES', align: 'center' },
]

const rows = ref([])
const cultivoOptions = ref([])
const variableOptions = ref([])
const selectedCultivo = ref(null)

const rowTempValues = ref({})

onMounted(async () => {
  const c = await api.get('/api/v1/agri-cultivo-catalogos/all')
  cultivoOptions.value = c.data

  const v = await api.get('/api/v1/agri-variable-catalogos/all')
  variableOptions.value = v.data
})

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return

    rows.value = v.map((c) => ({
      cultivo_id: c.cultivo_id,
      nombre: c.nombre,
      uid: c.uid ?? `${c.cultivo_id}-${Math.random()}`,
      selectedVariable: null,
      variables: (c.variables || []).map((vx) => {
        const mesesData = Object.fromEntries(meses.map((m) => [m, Number(vx[m] ?? 0)]))
        const total = Object.values(mesesData).reduce((a, b) => a + b, 0)
        return {
          ...vx,
          uid: vx.uid ?? `${vx.variable_id}-${Math.random()}`,
          ...mesesData,
          total,
        }
      }),
    }))
  },
  { immediate: true },
)

watch(
  rows,
  (newRows) => {
    newRows.forEach((cultivo) => {
      cultivo.variables.forEach((v) => {
        if (!rowTempValues.value[v.uid]) {
          rowTempValues.value[v.uid] = {}
        }
        meses.forEach((mes) => {
          rowTempValues.value[v.uid][mes] = Number(v[mes] ?? 0).toFixed(2)
        })
      })
    })
  },
  { immediate: true },
)

function emitUpdate() {
  emit(
    'update:modelValue',
    rows.value.map((c) => ({
      id: c.id,
      cultivo_id: c.cultivo_id,
      nombre: c.nombre,
      variables: c.variables.map((v) => ({
        id: v.id,
        variable_id: v.variable_id,
        nombre: v.nombre,
        ...Object.fromEntries(meses.map((m) => [m, v[m]])),
        total: v.total,
      })),
    })),
  )
}

function addCultivo() {
  if (!selectedCultivo.value) return
  if (rows.value.some((r) => r.cultivo_id === selectedCultivo.value)) {
    $q.notify({ type: 'warning', message: 'Este cultivo ya fue agregado' })
    return
  }

  const c = cultivoOptions.value.find((c) => c.id === selectedCultivo.value)

  rows.value.push({
    cultivo_id: c.id,
    nombre: c.nombre,
    uid: `${c.id}-${Date.now()}`,
    selectedVariable: null,
    variables: [],
  })

  selectedCultivo.value = null
  emitUpdate()
}

function removeCultivo(uid) {
  rows.value = rows.value.filter((r) => r.uid !== uid)
  emitUpdate()
}

/*variable de cultivo*/

function addVariable(cultivo) {
  const varID = cultivo.selectedVariable
  if (!varID) return

  if (cultivo.variables.some((v) => v.variable_id === varID)) {
    $q.notify({ type: 'warning', message: 'Variable ya agregada a este cultivo' })
    cultivo.selectedVariable = null
    return
  }

  const v = variableOptions.value.find((x) => x.id === varID)

  const newVar = {
    variable_id: v.id,
    nombre: v.nombre,
    uid: `${v.id}-${Date.now()}`,
    ...Object.fromEntries(meses.map((m) => [m, 0])),
    total: 0,
  }

  cultivo.variables.push(newVar)

  rowTempValues.value[newVar.uid] = {}
  meses.forEach((m) => (rowTempValues.value[newVar.uid][m] = '0.00'))

  cultivo.selectedVariable = null
  emitUpdate()
}

function removeVariable(cultivo, uid) {
  cultivo.variables = cultivo.variables.filter((v) => v.uid !== uid)
  emitUpdate()
}

function updateMonthValue(row, mes) {
  const uid = row.uid
  let raw = rowTempValues.value[uid][mes]

  row[mes] = Number(raw) || 0
  updateTotal(row)
}

function formatTwoDecimals(row, mes) {
  const uid = row.uid
  let value = Number(rowTempValues.value[uid][mes] || 0)

  rowTempValues.value[uid][mes] = value.toFixed(2)
  row[mes] = value

  updateTotal(row)
}

function updateTotal(row) {
  row.total = meses.reduce((sum, m) => sum + Number(row[m] || 0), 0)
  emitUpdate()
}
</script>
