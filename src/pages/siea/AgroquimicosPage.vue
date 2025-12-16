<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="warning" size="md" class="q-mr-sm" />
            Agroquímicos
          </div>
          <div class="text-subtitle2 text-grey-7">Catálogo de plaguicidas y agroquímicos</div>
        </div>
        <div class="col-auto">
          <q-btn label="Nuevo Agroquímico" icon="add" color="primary" @click="abrirDialog" />
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
                label="Tipo"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-3">
              <q-select
                v-model="filtros.categoria_toxicologica"
                :options="toxicologicasOptions"
                label="Toxicidad"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-3">
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
          :rows="agroquimicos"
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
          <template v-slot:body-cell-nombre_comercial="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.nombre_comercial }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-chip :color="getTipoColor(props.row.tipo)" text-color="white" dense>
                {{ formatTipo(props.row.tipo) }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-concentracion="props">
            <q-td :props="props">
              <div class="text-weight-bold text-primary">
                {{ props.row.concentracion || 'N/A' }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-formulacion="props">
            <q-td :props="props">
              <q-badge color="teal" :label="props.row.formulacion || 'N/A'" />
            </q-td>
          </template>
          <template v-slot:body-cell-presentacion="props">
            <q-td :props="props">
              <div v-if="props.row.presentacion">
                <q-badge color="orange" :label="props.row.presentacion" />
                <div
                  v-if="props.row.cantidad_presentacion"
                  class="text-caption text-grey-7 q-mt-xs"
                >
                  {{ props.row.cantidad_presentacion }} {{ props.row.presentacion }}
                </div>
              </div>
              <span v-else class="text-grey-5">N/A</span>
            </q-td>
          </template>
          <template v-slot:body-cell-toxicidad="props">
            <q-td :props="props">
              <q-badge
                :color="getColorToxicidad(props.row.categoria_toxicologica)"
                :label="props.row.categoria_toxicologica || 'N/A'"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-registro="props">
            <q-td :props="props">
              <div class="text-caption">
                {{ props.row.registro_senasa || '—' }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-descripcion="props">
            <q-td :props="props">
              <div class="text-caption" style="max-width: 200px">
                {{ props.row.descripcion || '—' }}
              </div>
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
              {{ editando ? 'Editar' : 'Nuevo' }} Agroquímico
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
                v-model="form.categoria"
                :options="categoriasOptions"
                label="Categoría *"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Requerido']"
              />
              <q-select
                v-model="form.categoria_toxicologica"
                :options="toxicologicasOptions"
                label="Categoría Toxicológica *"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Requerido']"
              />
              <q-input
                v-model="form.ingrediente_activo"
                label="Ingrediente Activo"
                outlined
                dense
                class="q-mb-md"
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
import { useSieaAgroquimicosStore } from 'src/stores/sieaAgroquimicos'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useSieaAgroquimicosStore()

const dialog = ref(false)
const editando = ref(false)
const guardando = ref(false)
const formRef = ref(null)
const form = ref({
  codigo: '',
  nombre: '',
  categoria: '',
  categoria_toxicologica: '',
  ingrediente_activo: '',
  descripcion: '',
  activo: true,
})
const filtros = ref({ categoria: null, categoria_toxicologica: null, search: '' })

const categoriasOptions = [
  'acaricida',
  'adherente',
  'fungicida',
  'herbicida',
  'insecticida',
  'nutriente_foliar',
  'regulador_crecimiento',
]
const toxicologicasOptions = ['IA', 'IB', 'II', 'III', 'IV', 'U']

const columns = [
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo', sortable: true },
  {
    name: 'nombre_comercial',
    label: 'Nombre Comercial',
    align: 'left',
    field: 'nombre_comercial',
    sortable: true,
  },
  {
    name: 'ingrediente_activo',
    label: 'Ingrediente Activo',
    align: 'left',
    field: 'ingrediente_activo',
    sortable: true,
  },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo', sortable: true },
  { name: 'concentracion', label: 'Concentración', align: 'center', field: 'concentracion' },
  { name: 'formulacion', label: 'Formulación', align: 'center', field: 'formulacion' },
  { name: 'presentacion', label: 'Presentación', align: 'center', field: 'presentacion' },
  {
    name: 'toxicidad',
    label: 'Toxicidad',
    align: 'center',
    field: 'categoria_toxicologica',
  },
  { name: 'registro', label: 'Registro SENASA', align: 'center', field: 'registro_senasa' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

const agroquimicos = computed(() => store.agroquimicos)
const loading = computed(() => store.loading)

function getTipoColor(tipo) {
  const colores = {
    acaricida: 'purple',
    adherente: 'cyan',
    fungicida: 'pink',
    herbicida: 'brown',
    insecticida: 'red',
    nutriente_foliar: 'green',
    regulador_crecimiento: 'indigo',
  }
  return colores[tipo?.toLowerCase()] || 'grey'
}

function formatTipo(tipo) {
  if (!tipo) return ''
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function getColorToxicidad(cat) {
  const colores = { IA: 'red-9', IB: 'red', II: 'orange', III: 'blue', IV: 'green', U: 'grey-5' }
  return colores[cat] || 'grey'
}

async function cargar() {
  try {
    await store.fetchAgroquimicos()
    // Las categorías ya están hardcodeadas en el store
    await store.fetchCategorias()
    await store.fetchCategoriasToxico()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar agroquímicos' })
  }
}

function aplicarFiltros() {
  store.setFiltros(filtros.value)
  cargar()
}

function abrirDialog() {
  editando.value = false
  form.value = {
    codigo: '',
    nombre: '',
    categoria: '',
    categoria_toxicologica: '',
    ingrediente_activo: '',
    descripcion: '',
    activo: true,
  }
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
      await store.updateAgroquimico(form.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Agroquímico actualizado', icon: 'check_circle' })
    } else {
      await store.createAgroquimico(form.value)
      $q.notify({ type: 'positive', message: 'Agroquímico creado', icon: 'check_circle' })
    }
    cerrarDialog()
  } catch {
    $q.notify({
      type: 'negative',
      message: `Error al ${editando.value ? 'actualizar' : 'crear'} agroquímico`,
    })
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(item) {
  try {
    await store.updateAgroquimico(item.id, { ...item, activo: !item.activo })
    $q.notify({
      type: 'positive',
      message: `Agroquímico ${!item.activo ? 'activado' : 'desactivado'}`,
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(() => cargar())
</script>
