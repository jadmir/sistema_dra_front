<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="science" size="md" class="q-mr-sm" />
            Fertilizantes
          </div>
          <div class="text-subtitle2 text-grey-7">Catálogo de fertilizantes agrícolas</div>
        </div>
        <div class="col-auto">
          <q-btn label="Nuevo Fertilizante" icon="add" color="primary" @click="abrirDialog" />
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
                v-model="filtros.tipo"
                :options="tiposOptions"
                label="Tipo"
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
          :rows="fertilizantes"
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
                {{ props.row.tipo }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-formula="props">
            <q-td :props="props">
              <div v-if="props.row.formula" class="text-weight-bold text-primary text-h6">
                {{ props.row.formula }}
              </div>
              <span v-else class="text-grey-5">N/A</span>
            </q-td>
          </template>
          <template v-slot:body-cell-porcentajes="props">
            <q-td :props="props">
              <div
                v-if="
                  props.row.porcentaje_nitrogeno ||
                  props.row.porcentaje_fosforo ||
                  props.row.porcentaje_potasio
                "
                class="text-caption"
              >
                <div
                  v-if="
                    props.row.porcentaje_nitrogeno && parseFloat(props.row.porcentaje_nitrogeno) > 0
                  "
                  class="text-blue"
                >
                  <strong>N:</strong> {{ props.row.porcentaje_nitrogeno }}%
                </div>
                <div
                  v-if="
                    props.row.porcentaje_fosforo && parseFloat(props.row.porcentaje_fosforo) > 0
                  "
                  class="text-orange"
                >
                  <strong>P:</strong> {{ props.row.porcentaje_fosforo }}%
                </div>
                <div
                  v-if="
                    props.row.porcentaje_potasio && parseFloat(props.row.porcentaje_potasio) > 0
                  "
                  class="text-purple"
                >
                  <strong>K:</strong> {{ props.row.porcentaje_potasio }}%
                </div>
              </div>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>
          <template v-slot:body-cell-presentacion="props">
            <q-td :props="props">
              <div v-if="props.row.presentacion">
                <q-badge color="orange" :label="props.row.presentacion" />
                <div v-if="props.row.peso_presentacion" class="text-caption text-grey-7 q-mt-xs">
                  {{ props.row.peso_presentacion }} kg
                </div>
              </div>
              <span v-else class="text-grey-5">N/A</span>
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
              {{ editando ? 'Editar' : 'Nuevo' }} Fertilizante
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
                v-model="form.composicion"
                label="Composición (N-P-K)"
                outlined
                dense
                class="q-mb-md"
                hint="Ejemplo: 20-20-20"
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
import { useSieaFertilizantesStore } from 'src/stores/sieaFertilizantes'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useSieaFertilizantesStore()

const dialog = ref(false)
const editando = ref(false)
const guardando = ref(false)
const formRef = ref(null)
const form = ref({
  codigo: '',
  nombre: '',
  tipo: '',
  composicion: '',
  descripcion: '',
  activo: true,
})
const filtros = ref({ tipo: null, search: '' })

const tiposOptions = ['nitrogenado', 'fosfatado', 'potasico', 'compuesto', 'organico']
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
    name: 'nombre_generico',
    label: 'Nombre Genérico',
    align: 'left',
    field: 'nombre_generico',
    sortable: true,
  },
  { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo', sortable: true },
  { name: 'formula', label: 'Fórmula NPK', align: 'center', field: 'formula' },
  { name: 'porcentajes', label: 'Composición %', align: 'center' },
  { name: 'presentacion', label: 'Presentación', align: 'center', field: 'presentacion' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

const fertilizantes = computed(() => store.fertilizantes)
const loading = computed(() => store.loading)

function getTipoColor(tipo) {
  const colores = {
    nitrogenado: 'blue',
    fosfatado: 'orange',
    potasico: 'purple',
    compuesto: 'teal',
    organico: 'green',
  }
  return colores[tipo?.toLowerCase()] || 'grey'
}

async function cargar() {
  try {
    await store.fetchFertilizantes()
    await store.fetchTipos() // Extrae tipos de los fertilizantes ya cargados
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar fertilizantes' })
  }
}

function aplicarFiltros() {
  store.setFiltros(filtros.value)
  cargar()
}

function abrirDialog() {
  editando.value = false
  form.value = { codigo: '', nombre: '', tipo: '', composicion: '', descripcion: '', activo: true }
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
      await store.updateFertilizante(form.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Fertilizante actualizado', icon: 'check_circle' })
    } else {
      await store.createFertilizante(form.value)
      $q.notify({ type: 'positive', message: 'Fertilizante creado', icon: 'check_circle' })
    }
    cerrarDialog()
  } catch {
    $q.notify({
      type: 'negative',
      message: `Error al ${editando.value ? 'actualizar' : 'crear'} fertilizante`,
    })
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(item) {
  try {
    await store.updateFertilizante(item.id, { ...item, activo: !item.activo })
    $q.notify({
      type: 'positive',
      message: `Fertilizante ${!item.activo ? 'activado' : 'desactivado'}`,
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(() => cargar())
</script>
