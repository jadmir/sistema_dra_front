<template>
  <div>
    <div class="row q-col-gutter-md items-end">
      <div class="col-12 col-md-5">
        <q-select
          v-model="selectedDestino"
          :options="destinoOptions"
          option-value="id"
          option-label="nombre"
          label="Destino de leche"
          dense
          outlined
          emit-value
          map-options
          color="green-7"
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input
          v-model.number="cantidad"
          type="number"
          label="Cantidad (Lt)"
          dense
          outlined
          color="green-7"
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input
          v-model.number="precio"
          type="number"
          step="0.01"
          min="0"
          label="Precio (S/.)"
          dense
          outlined
          color="green-7"
        />
      </div>

      <div class="col-12 col-md-auto">
        <q-btn color="green-7" label="Agregar" @click="addDestino" dense unelevated />
      </div>
    </div>

    <!-- Tabla -->
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
      <template #body-cell-destino="props">
        <q-td>{{ props.row.destino_nombre }}</q-td>
      </template>

      <template #body-cell-cantidad="props">
        <q-td align="center">{{ props.row.cantidad || '—' }}</q-td>
      </template>

      <template #body-cell-precio="props">
        <q-td align="center">S/ {{ Number(props.row.precio).toFixed(2) }}</q-td>
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
              color="green-7"
            />
          </div>

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
import { useDestinoStore } from 'src/stores/destino'

const props = defineProps({
  producto_leches: { type: Array, default: () => [] },
  leche_fresca: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:producto_leches', 'update:leche_fresca'])

const storeDest = useDestinoStore()
const destinoOptions = ref([])

onMounted(async () => {
  await storeDest.fetchDestinos(1)
  destinoOptions.value = storeDest.destinos || []
})

// Tabla interna
const rows = ref([])

// Columnas de la tabla
const cols = [
  { name: 'destino', label: 'DESTINO', field: 'destino_nombre', align: 'center' },
  { name: 'cantidad', label: 'CANTIDAD (Lt)', field: 'cantidad', align: 'center' },
  { name: 'precio', label: 'PRECIO (S/.)', field: 'precio', align: 'center' },
  { name: 'actions', label: 'ACCIONES', align: 'center' },
]

const selectedDestino = ref(null)
const cantidad = ref(null)
const precio = ref(null)

// Inicializar rows desde el prop producto_leches
onMounted(() => {
  rows.value = props.producto_leches.map((r) => ({
    ...r,
    uid: r.id ?? crypto.randomUUID(),
    destino_nombre:
      r.destino?.nombre ||
      r.destino_nombre ||
      destinoOptions.value.find((o) => o.id === r.agri_destinos_id)?.nombre ||
      '',
  }))
})

// Sincronizar cambios internos hacia el v-model del padre
watch(
  rows,
  (val) => {
    emit(
      'update:producto_leches',
      val.map((r) => ({
        id: r.id,
        agri_destinos_id: r.agri_destinos_id,
        destino_nombre: r.destino_nombre,
        cantidad: r.cantidad,
        precio: r.precio,
      })),
    )
  },
  { deep: true },
)

function addDestino() {
  if (!selectedDestino.value || (cantidad.value === null && precio.value === null)) return

  const destObj = destinoOptions.value.find((d) => d.id === selectedDestino.value)

  const newRow = {
    uid: crypto.randomUUID(),
    agri_destinos_id: destObj.id,
    destino_nombre: destObj.nombre,
    cantidad: cantidad.value !== null ? Number(cantidad.value) : null,
    precio: precio.value !== null ? Number(precio.value) : null,
  }

  rows.value.push(newRow)

  selectedDestino.value = null
  cantidad.value = null
  precio.value = null
}

function removeRow(uid) {
  rows.value = rows.value.filter((r) => r.uid !== uid)
}
</script>
