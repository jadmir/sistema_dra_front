<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="precision_manufacturing" size="md" class="q-mr-sm" />
            Maquinaria Agrícola
          </div>
          <div class="text-subtitle2 text-grey-7">Catálogo de maquinaria y equipos</div>
        </div>
        <div class="col-auto">
          <q-btn label="Nueva Maquinaria" icon="add" color="primary" @click="abrirDialog" />
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="secondary"
            @click="cargar"
            class="q-ml-sm"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-select
                v-model="filtros.categoria"
                :options="categoriasOptions"
                label="Categoría"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-6">
              <q-input v-model="filtros.search" label="Buscar" outlined dense clearable>
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-2">
              <q-btn
                label="Filtrar"
                icon="search"
                color="primary"
                @click="aplicarFiltros"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card flat bordered>
        <q-table
          :rows="maquinaria"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <q-badge color="blue-grey-5" :label="props.row.codigo" />
            </q-td>
          </template>
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.nombre }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-categoria="props">
            <q-td :props="props">
              <q-chip :color="getCategoriaColor(props.row.categoria)" text-color="white" dense>
                {{ formatCategoria(props.row.categoria) }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-unidad_medida="props">
            <q-td :props="props">
              <q-badge color="teal" :label="props.row.unidad_medida || 'N/A'" />
            </q-td>
          </template>
          <template v-slot:body-cell-descripcion="props">
            <q-td :props="props">
              <div class="text-caption" style="max-width: 200px">
                {{ props.row.descripcion || '—' }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-especificaciones="props">
            <q-td :props="props">
              <div v-if="props.row.especificaciones" class="text-caption">
                <span
                  v-for="(value, key) in parseEspecificaciones(props.row.especificaciones)"
                  :key="key"
                >
                  <strong>{{ key }}:</strong> {{ value }}<br />
                </span>
              </div>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn icon="edit" color="primary" size="sm" flat round @click="editar(props.row)"
                ><q-tooltip>Editar</q-tooltip></q-btn
              >
              <q-btn
                :icon="props.row.activo ? 'block' : 'check_circle'"
                :color="props.row.activo ? 'negative' : 'positive'"
                size="sm"
                flat
                round
                @click="toggleEstado(props.row)"
                ><q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip></q-btn
              >
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Dialog -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 500px">
          <q-card-section class="bg-primary text-white"
            ><div class="text-h6">
              {{ editando ? 'Editar' : 'Nueva' }} Maquinaria
            </div></q-card-section
          >
          <q-card-section>
            <q-form ref="formRef">
              <q-input
                v-model="form.codigo"
                label="Código *"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Requerido']"
              />
              <q-input
                v-model="form.nombre"
                label="Nombre *"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Requerido']"
              />
              <q-select
                v-model="form.tipo"
                :options="tiposOptions"
                label="Tipo *"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Requerido']"
              />
              <q-input
                v-model="form.descripcion"
                label="Descripción"
                type="textarea"
                outlined
                dense
                rows="3"
                class="q-mb-md"
              />
              <q-toggle v-model="form.activo" label="Activo" color="positive" />
            </q-form>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" flat @click="cerrarDialog" />
            <q-btn
              :label="editando ? 'Actualizar' : 'Crear'"
              color="primary"
              @click="guardar"
              :loading="guardando"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSieaMaquinariaStore } from 'src/stores/sieaMaquinaria'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useSieaMaquinariaStore()

const dialog = ref(false)
const editando = ref(false)
const guardando = ref(false)
const formRef = ref(null)
const form = ref({ codigo: '', nombre: '', tipo: '', descripcion: '', activo: true })
const filtros = ref({ categoria: null, search: '' })

const categoriasOptions = ['tractor', 'maquinaria', 'mano_obra', 'yunta']

const columns = [
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo', sortable: true },
  { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true },
  { name: 'categoria', label: 'Categoría', align: 'left', field: 'categoria', sortable: true },
  {
    name: 'unidad_medida',
    label: 'Unidad',
    align: 'center',
    field: 'unidad_medida',
  },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  { name: 'especificaciones', label: 'Especificaciones', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

const maquinaria = computed(() => store.maquinaria)
const loading = computed(() => store.loading)

function getCategoriaColor(categoria) {
  const colores = {
    tractor: 'blue',
    maquinaria: 'orange',
    mano_obra: 'green',
    yunta: 'brown',
  }
  return colores[categoria?.toLowerCase()] || 'grey'
}

function formatCategoria(categoria) {
  if (!categoria) return ''
  return categoria.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function parseEspecificaciones(especificaciones) {
  try {
    if (typeof especificaciones === 'string') {
      return JSON.parse(especificaciones)
    }
    return especificaciones || {}
  } catch {
    return {}
  }
}

async function cargar() {
  try {
    await store.fetchMaquinaria()
    // Los tipos se pueden extraer de los datos cargados si es necesario
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar maquinaria' })
  }
}

function aplicarFiltros() {
  store.setFiltros(filtros.value)
  cargar()
}

function abrirDialog() {
  editando.value = false
  form.value = { codigo: '', nombre: '', tipo: '', descripcion: '', activo: true }
  dialog.value = true
}

function editar(item) {
  editando.value = true
  form.value = { ...item }
  dialog.value = true
}

function cerrarDialog() {
  dialog.value = false
  formRef.value?.resetValidation()
}

async function guardar() {
  const valido = await formRef.value?.validate()
  if (!valido) return

  guardando.value = true
  try {
    if (editando.value) {
      await store.updateMaquinaria(form.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Maquinaria actualizada', icon: 'check_circle' })
    } else {
      await store.createMaquinaria(form.value)
      $q.notify({ type: 'positive', message: 'Maquinaria creada', icon: 'check_circle' })
    }
    cerrarDialog()
  } catch {
    $q.notify({
      type: 'negative',
      message: `Error al ${editando.value ? 'actualizar' : 'crear'} maquinaria`,
    })
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(item) {
  try {
    await store.updateMaquinaria(item.id, { ...item, activo: !item.activo })
    $q.notify({
      type: 'positive',
      message: `Maquinaria ${!item.activo ? 'activada' : 'desactivada'}`,
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(() => cargar())
</script>
