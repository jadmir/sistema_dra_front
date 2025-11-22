<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md flex flex-center">
      <q-card
        class="q-pa-md q-mx-auto shadow-2 rounded-borders"
        style="max-width: 1000px; width: 100%"
      >
        <div class="text-h5 text-center text-primary text-weight-bold q-mb-md">
          Gestión de Variedades de Animal
        </div>

        <div class="row justify-center q-mb-md">
          <q-btn
            color="primary"
            icon="add"
            label="Nueva variedad"
            class="q-mx-sm"
            size="sm"
            unelevated
            @click="openForm()"
          />
          <q-btn
            color="secondary"
            icon="download"
            label="Exportar Excel"
            class="q-mx-sm"
            size="sm"
            unelevated
            @click="onExport"
          />
        </div>
        <!--Busqueda -->
        <div class="q-pa-sm q-mb-md bg-grey-2 rounded-borders">
          <div class="row q-col-gutter-sm items-center justify-between">
            <div class="col-12 col-md-6">
              <q-input
                dense
                outlined
                debounce="500"
                v-model="store.search"
                placeholder="Buscar variedad..."
                @update:model-value="onSearch"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!--Filtro por estado -->
            <div class="col-12 col-md-4">
              <q-select
                dense
                outlined
                v-model="store.estado"
                label="Estado"
                emit-value
                map-options
                :options="[
                  { label: 'Todos', value: null },
                  { label: 'Activos', value: true },
                  { label: 'Inactivos', value: false },
                ]"
                @update:model-value="onSearch"
              />
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <q-table
          :rows="store.variedades"
          :columns="columns"
          row-key="id"
          :loading="store.loading"
          v-model:pagination="store.pagination"
          @request="onRequest"
          :rows-per-page-options="[5, 10, 20]"
          :grid="isMobile"
          :dense="isMobile"
          flat
          bordered
          class="shadow-1 rounded-borders"
        >
          <!-- Estado -->
          <template #body-cell-estado="props">
            <q-td align="center">
              <q-chip :color="props.row.estado ? 'green' : 'red'" text-color="white" size="sm">
                {{ props.row.estado ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Acciones -->
          <template #body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat icon="edit" color="primary" @click="openForm(props.row)" />
              <q-btn
                dense
                flat
                :icon="props.row.estado ? 'block' : 'check_circle'"
                :color="props.row.estado ? 'negative' : 'positive'"
                @click="toggleEstado(props.row)"
              />
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-12">
              <q-card bordered flat class="cursor-pointer">
                <q-card-section>
                  <div class="text-subtitle1">{{ props.row.nombre }}</div>
                  <div class="text-caption text-grey-7">
                    {{ props.row.descripcion || '—' }}
                  </div>
                </q-card-section>

                <q-separator inset />

                <q-card-actions align="right">
                  <q-chip
                    dense
                    :color="props.row.estado ? 'green' : 'red'"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.row.estado ? 'Activo' : 'Inactivo' }}
                  </q-chip>
                  <q-space />
                  <q-btn dense flat icon="edit" color="primary" @click.stop="openForm(props.row)" />
                  <q-btn
                    dense
                    flat
                    :icon="props.row.estado ? 'block' : 'check_circle'"
                    :color="props.row.estado ? 'negative' : 'positive'"
                    @click.stop="toggleEstado(props.row)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
    <!-- Formulario -->
    <variedad-form v-model="showForm" :variedad="selected" @saved="onSaved" @close="closeForm" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import Swal from 'sweetalert2'
import { useVariedadAnimalStore } from 'stores/variedadAnimal'
import VariedadForm from './VariedadForm.vue'

const $q = useQuasar()
const store = useVariedadAnimalStore()
const showForm = ref(false)
const selected = ref(null)

const isMobile = computed(() => $q.screen.lt.md)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

onMounted(async () => {
  await store.fetchVariedades(store.pagination.page)
})

function openForm(variedad = null) {
  selected.value = variedad ? { ...variedad } : null
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

async function onSaved() {
  await store.fetchVariedades(store.pagination.page)
  showForm.value = false
  selected.value = null
}

async function onExport() {
  const ok = await store.exportExcel()
  if (ok) {
    $q.notify({ type: 'positive', message: 'Archivo Excel generado correctamente' })
  } else {
    $q.notify({ type: 'negative', message: store.error || 'No se pudo exportar el Excel' })
  }
}

function onSearch() {
  store.pagination.page = 1
  store.fetchVariedades(store.pagination.page)
}

function onRequest({ pagination }) {
  store.fetchVariedades(pagination.page)
}

function toggleEstado(row) {
  const nuevoEstado = !row.estado
  const accion = nuevoEstado ? 'activar' : 'desactivar'
  const icono = nuevoEstado ? 'success' : 'warning'
  const colorBoton = nuevoEstado ? '#21ba45' : '#c10015'

  Swal.fire({
    title: `¿Deseas ${accion} esta variedad?`,
    text: `La variedad se marcará como ${nuevoEstado ? 'activa' : 'inactiva'}.`,
    icon: icono,
    showCancelButton: true,
    confirmButtonText: accion.charAt(0).toUpperCase() + accion.slice(1),
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonColor: colorBoton,
  }).then(async (r) => {
    if (!r.isConfirmed) return
    const ok = await store.deleteVariedad(row.id, { estado: nuevoEstado })
    if (ok) {
      Swal.fire({
        icon: 'success',
        title: nuevoEstado ? 'Activada' : 'Desactivada',
        timer: 1200,
        showConfirmButton: false,
      })
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: store.error || 'No se pudo actualizar' })
    }
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 10px;
}
</style>
