<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md flex flex-center">
      <q-card
        class="q-pa-md q-mx-auto shadow-2 rounded-borders"
        style="max-width: 1000px; width: 100%"
      >
        <!-- Título -->
        <div class="text-h6 text-primary text-weight-bold q-mb-md text-center">
          Gestión de Natalidad y Mortalidad
        </div>

        <!-- Barra de filtros y acciones -->
        <div class="row items-center q-col-gutter-sm q-mb-md justify-between">
          <div class="col-12 col-md-5">
            <q-input
              dense
              outlined
              debounce="500"
              v-model="store.search"
              placeholder="Buscar registro..."
              @update:model-value="onSearch"
            >
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
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

          <div class="col-12 col-md-auto flex q-gutter-sm justify-end">
            <q-btn
              color="primary"
              icon="add"
              label="Nuevo registro"
              class="q-mx-xs"
              dense
              unelevated
              @click="openForm()"
            />
            <q-btn
              color="secondary"
              icon="download"
              label="Exportar Excel"
              class="q-mx-xs"
              dense
              unelevated
              :loading="store.loading"
              @click="onExport"
            />
          </div>
        </div>

        <!-- Tabla -->
        <q-table
          :rows="store.registros"
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
          separator="horizontal"
        >
          <template #body-cell-estado="props">
            <q-td align="center">
              <q-chip :color="props.row.estado ? 'green' : 'red'" text-color="white" size="sm">
                {{ props.row.estado ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

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

          <!-- Mobile card -->
          <template #item="props">
            <div class="q-pa-xs col-12">
              <q-card bordered>
                <q-card-section>
                  <div class="text-subtitle1">{{ props.row.concepto }}</div>
                  <div class="text-caption text-grey-7">{{ props.row.observaciones || '—' }}</div>
                </q-card-section>

                <q-separator inset />

                <q-card-actions align="right">
                  <q-chip dense :color="props.row.estado ? 'green' : 'red'" text-color="white">
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

    <!-- Form modal -->
    <natalidad-mortalidad-form
      v-model="showForm"
      :registro="selected"
      @saved="onSaved"
      @close="closeForm"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useQuasar } from 'quasar'
import { useNatalidadStore } from 'src/stores/natalidadMortalidad'
import NatalidadMortalidadForm from './NatalidadMortalidadForm.vue'

const $q = useQuasar()
const store = useNatalidadStore()

const showForm = ref(false)
const selected = ref(null)
const isMobile = computed(() => $q.screen.lt.md)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'concepto', label: 'Concepto', field: 'concepto', align: 'left', sortable: true },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

// --------- FUNCIONES ---------
function openForm(registro = null) {
  selected.value = registro ? { ...registro } : null
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

function onSaved() {
  store.fetchRegistros(store.pagination.page)
  closeForm()
}

function onRequest({ pagination }) {
  store.pagination.page = pagination.page
  store.fetchRegistros(pagination.page)
}

function onSearch() {
  store.pagination.page = 1
  store.fetchRegistros(1)
}

async function onExport() {
  const ok = await store.exportExcel()
  if (ok) {
    $q.notify({ type: 'positive', message: 'Excel generado correctamente' })
  } else {
    $q.notify({ type: 'negative', message: store.error || 'No se pudo exportar' })
  }
}

async function toggleEstado(row) {
  const nuevo = !row.estado
  const accion = nuevo ? 'activar' : 'desactivar'
  const colorBoton = nuevo ? '#21ba45' : '#c10015'

  const result = await Swal.fire({
    title: `¿Deseas ${accion} el registro "${row.concepto}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: accion.charAt(0).toUpperCase() + accion.slice(1),
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonColor: colorBoton,
  })

  if (!result.isConfirmed) return

  const ok = await store.deleteRegistro(row.id, { estado: nuevo })
  if (ok) {
    Swal.fire({
      icon: 'success',
      title: `Registro ${nuevo ? 'activado' : 'desactivado'}`,
      timer: 1200,
      showConfirmButton: false,
    })
  } else {
    Swal.fire({ icon: 'error', title: 'Error', text: store.error || 'No se pudo actualizar' })
  }
}

onMounted(() => {
  store.fetchRegistros()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 10px;
}
</style>
