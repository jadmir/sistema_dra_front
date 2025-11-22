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
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input v-model.number="cantidad" type="number" label="Cantidad (Lt)" dense outlined />
      </div>

      <div class="col-12 col-md-2">
        <q-input v-model.number="precio" type="number" label="Precio (S/.)" dense outlined />
      </div>

      <div class="col-12 col-md-auto">
        <q-btn color="primary" label="Agregar" @click="addDestino" dense />
      </div>
    </div>

    <!-- Tabla -->
    <div class="q-mt-md">
      <q-table :rows="rows" :columns="cols" row-key="uid" dense flat>
        <template #body-cell-destino="props">
          <q-td>{{ props.row.destino_nombre }}</q-td>
        </template>
        <template #body-cell-cantidad="props">
          <q-td align="center">{{ props.row.cantidad || '—' }}</q-td>
        </template>
        <template #body-cell-precio="props">
          <q-td align="center">{{ props.row.precio || '—' }}</q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td align="center">
            <q-btn dense flat icon="delete" color="negative" @click="removeRow(props.row.uid)" />
          </q-td>
        </template>
      </q-table>
    </div>
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
  { name: 'destino', label: 'Destino', field: 'destino_nombre' },
  { name: 'cantidad', label: 'Cantidad (Lt)', field: 'cantidad', align: 'center' },
  { name: 'precio', label: 'Precio (S/.)', field: 'precio', align: 'center' },
  { name: 'actions', label: 'Acciones' },
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
