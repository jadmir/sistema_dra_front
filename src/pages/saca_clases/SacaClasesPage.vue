<template>
  <q-page padding>
    <!-- Título -->
    <div class="row justify-center q-mb-sm">
      <div class="text-h5 text-weight-bold text-center">Gestión de Saca Clases</div>
    </div>

    <!-- Barra de búsqueda + botón -->
    <div class="row q-col-gutter-sm items-center justify-center justify-sm-between q-mb-md">
      <div class="col-12 col-sm-6">
        <q-input
          dense
          outlined
          debounce="500"
          placeholder="Buscar clase..."
          v-model="store.search"
          @update:model-value="onSearch"
        >
          <template #append><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-12 col-sm-auto" v-can="PERMISSIONS.DATA_CREATE">
        <q-btn color="primary" label="NUEVA CLASE" class="full-width" @click="openForm()" />
      </div>
    </div>

    <!-- Tabla / Tarjetas en móvil -->
    <q-table
      :rows="store.items"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      v-model:pagination="store.pagination"
      @request="onRequest"
      :rows-per-page-options="[5,10,20]"
      :grid="isMobile"
      :dense="isMobile"
      flat
      bordered
    >
      <!-- Columna Acciones -->
      <template #body-cell-actions="props">
        <q-td align="center">
          <q-btn 
            v-can="PERMISSIONS.DATA_EDIT"
            dense 
            flat 
            icon="edit" 
            color="primary" 
            @click="openForm(props.row)" 
          />
          <q-btn 
            v-can="PERMISSIONS.DATA_DELETE"
            dense 
            flat 
            icon="delete" 
            color="negative" 
            @click="confirmDelete(props.row.id)" 
          />
        </q-td>
      </template>

      <!-- Tarjetas en móvil -->
      <template #item="props">
        <div class="q-pa-xs col-12">
          <q-card bordered class="cursor-pointer" @click="openDetail(props.row)">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1">{{ props.row.nombre }}</div>
              <div class="text-caption text-grey-7">ID: {{ props.row.id }}</div>
            </q-card-section>

            <q-card-section class="q-pt-xs">
              <div class="text-body2">{{ props.row.descripcion || 'Sin descripción' }}</div>
            </q-card-section>

            <q-separator inset />

            <q-card-actions align="right">
              <q-btn dense flat icon="edit" color="primary" @click.stop="openForm(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click.stop="confirmDelete(props.row.id)" />
            </q-card-actions>
          </q-card>
        </div>
      </template>

      <template #no-data>
        <div class="q-pa-md text-grey">
          {{ store.search ? 'Sin resultados para la búsqueda.' : 'No hay registros.' }}
        </div>
      </template>
    </q-table>

    <!-- Modal detalle (móvil) -->
    <q-dialog v-model="detailOpen">
      <q-card style="max-width: 560px; width: 100%">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar color="primary" text-color="white" icon="info" />
          <div class="text-h6">Detalle de la clase</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-list bordered separator>
            <q-item>
              <q-item-section>Nombre</q-item-section>
              <q-item-section side class="text-weight-medium">
                {{ detailItem?.nombre || '—' }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Descripción</q-item-section>
              <q-item-section side>
                {{ detailItem?.descripcion || '—' }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>ID</q-item-section>
              <q-item-section side>{{ detailItem?.id }}</q-item-section>
            </q-item>
            <q-item v-if="detailItem?.created_at">
              <q-item-section>Creado</q-item-section>
              <q-item-section side>{{ formatDate(detailItem.created_at) }}</q-item-section>
            </q-item>
            <q-item v-if="detailItem?.updated_at">
              <q-item-section>Actualizado</q-item-section>
              <q-item-section side>{{ formatDate(detailItem.updated_at) }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn 
            v-can="PERMISSIONS.DATA_EDIT"
            color="primary" 
            label="Editar" 
            @click="openEditFromDetail" 
          />
          <q-btn 
            v-can="PERMISSIONS.DATA_DELETE"
            color="negative" 
            label="Eliminar" 
            @click="deleteFromDetail" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal crear/editar -->
    <saca-clase-form v-model="showForm" :item="selected" @saved="reload" @close="closeForm" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useClaseSacaStore } from 'stores/sacaClases'
import SacaClaseForm from './SacaClaseForm.vue'
import Swal from 'sweetalert2'
import { useQuasar } from 'quasar'
import { PERMISSIONS } from 'src/utils/permissions'

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md)

const store = useClaseSacaStore()

const showForm = ref(false)
const selected = ref(null)

// Detalle móvil
const detailOpen = ref(false)
const detailItem = ref(null)

function openDetail(row) {
  detailItem.value = row
  detailOpen.value = true
}
function openEditFromDetail() {
  const row = detailItem.value
  detailOpen.value = false
  if (row) openForm(row)
}
async function deleteFromDetail() {
  const row = detailItem.value
  detailOpen.value = false
  if (row) await confirmDelete(row.id)
}
function formatDate(v) {
  try { return new Date(v).toLocaleString() } catch { return v || '—' }
}

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

onMounted(() => store.fetch())

const openForm = (item = null) => {
  selected.value = item
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}

const reload = async () => {
  showForm.value = false
  await store.fetch(store.pagination.page, store.pagination.rowsPerPage)
}

const confirmDelete = async (id) => {
  const res = await Swal.fire({
    title: 'Confirmar',
    text: '¿Eliminar esta saca?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
  })
  if (res.isConfirmed) {
    const ok = await store.delete(id)
    if (ok !== false) {
      await Swal.fire('Eliminado', 'La saca fue eliminada', 'success')
      const prevPage =
        store.items.length === 1 && store.pagination.page > 1
          ? store.pagination.page - 1
          : store.pagination.page
      await store.fetch(prevPage, store.pagination.rowsPerPage)
    } else {
      await Swal.fire('Error', store.error || 'No se pudo eliminar', 'error')
    }
  }
}

const onSearch = () => {
  store.fetch(1, store.pagination.rowsPerPage)
}

const onRequest = ({ pagination }) => {
  store.pagination.rowsPerPage = pagination.rowsPerPage
  store.fetch(pagination.page, pagination.rowsPerPage)
}
</script>
