<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="person" size="md" class="q-mr-sm" />
            Encuestadores SIEA
          </div>
          <div class="text-subtitle2 text-grey-7">Gestión de personal de campo</div>
        </div>
        <div class="col-12 col-md-6 text-right q-mt-sm q-mt-md-none">
          <q-btn
            label="Nuevo Encuestador"
            icon="add"
            color="primary"
            @click="abrirDialogNuevo"
            :loading="loading"
          />
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="secondary"
            @click="cargarEncuestadores"
            :loading="loading"
            class="q-ml-sm"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="filtros.provincia" label="Provincia" outlined dense clearable />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="filtros.search"
                label="Buscar (nombre, DNI)"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                label="Filtrar"
                icon="search"
                color="primary"
                @click="aplicarFiltros"
                :loading="loading"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card flat bordered>
        <q-table
          :rows="encuestadores"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          :pagination="paginacion"
          @request="onRequest"
        >
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="text-weight-medium">
                {{
                  props.row.nombre_completo ||
                  `${props.row.nombres} ${props.row.apellido_paterno} ${props.row.apellido_materno}`
                }}
              </div>
              <div class="text-caption text-grey-7">DNI: {{ props.row.dni }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-contacto="props">
            <q-td :props="props">
              <div>
                <q-icon name="email" size="xs" class="q-mr-xs" />
                {{ props.row.email }}
              </div>
              <div v-if="props.row.telefono">
                <q-icon name="phone" size="xs" class="q-mr-xs" />
                {{ props.row.telefono }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-ubicacion="props">
            <q-td :props="props">
              <div class="text-weight-medium">
                {{ props.row.provincia_asignada || props.row.provincia }}
              </div>
              <div class="text-caption text-grey-7">{{ props.row.distrito }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-especializaciones="props">
            <q-td :props="props">
              <q-badge
                v-for="(esp, idx) in props.row.especializacion || props.row.especializaciones || []"
                :key="idx"
                color="blue-grey"
                :label="esp"
                class="q-mr-xs q-mb-xs"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn icon="edit" color="primary" size="sm" flat round @click="editar(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                :icon="props.row.activo ? 'block' : 'check_circle'"
                :color="props.row.activo ? 'negative' : 'positive'"
                size="sm"
                flat
                round
                @click="toggleEstado(props.row)"
              >
                <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Dialog: Crear/Editar -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 600px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ editando ? 'Editar' : 'Nuevo' }} Encuestador</div>
          </q-card-section>

          <q-card-section>
            <q-form ref="formRef">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.nombres"
                    label="Nombres *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="form.apellido_paterno"
                    label="Apellido Paterno *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="form.apellido_materno"
                    label="Apellido Materno *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.dni"
                    label="DNI *"
                    outlined
                    dense
                    mask="########"
                    :rules="[
                      (val) => !!val || 'Requerido',
                      (val) => val.length === 8 || 'Debe tener 8 dígitos',
                    ]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.email"
                    label="Email *"
                    type="email"
                    outlined
                    dense
                    :rules="[
                      (val) => !!val || 'Requerido',
                      (val) => /.+@.+\..+/.test(val) || 'Email inválido',
                    ]"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.telefono"
                    label="Teléfono"
                    outlined
                    dense
                    mask="### ### ###"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.provincia_asignada"
                    label="Provincia Asignada *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.distrito" label="Distrito" outlined dense />
                </div>
                <div class="col-12">
                  <q-input v-model="form.direccion" label="Dirección" outlined dense />
                </div>
                <div class="col-12">
                  <q-select
                    v-model="form.especializacion"
                    :options="especializacionesOptions"
                    label="Especializaciones SIEA"
                    outlined
                    dense
                    multiple
                    use-chips
                    hint="Formularios SIEA: F-1 (Maquinaria), F-4 (Fertilizantes), F-6 (Agroquímicos), F-14 (Transporte)"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.fecha_contratacion"
                    label="Fecha de Contratación"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.estado"
                    :options="['activo', 'inactivo', 'suspendido']"
                    label="Estado"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.observaciones"
                    label="Observaciones"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                  />
                </div>
              </div>
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
import { useSieaEncuestadoresStore } from 'src/stores/sieaEncuestadores'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useSieaEncuestadoresStore()

// Estado
const dialog = ref(false)
const editando = ref(false)
const guardando = ref(false)
const formRef = ref(null)

const form = ref({
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  provincia_asignada: '',
  distrito: '',
  especializacion: [],
  fecha_contratacion: '',
  estado: 'activo',
  observaciones: '',
})

const filtros = ref({
  provincia: '',
  search: '',
})

// Opciones
const especializacionesOptions = [
  'F-1', // Maquinaria Agrícola
  'F-4', // Fertilizantes y Abonos
  'F-6', // Agroquímicos
  'F-14', // Transporte de Carga
]

// Columnas
const columns = [
  { name: 'nombre', label: 'Nombre Completo', align: 'left', field: 'nombres' },
  { name: 'contacto', label: 'Contacto', align: 'left', field: 'email' },
  { name: 'ubicacion', label: 'Ubicación', align: 'left', field: 'provincia' },
  {
    name: 'especializaciones',
    label: 'Especializaciones',
    align: 'left',
    field: 'especializaciones',
  },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const encuestadores = computed(() => store.encuestadores)
const loading = computed(() => store.loading)

const paginacion = computed(() => ({
  page: store.currentPage,
  rowsPerPage: store.perPage,
  rowsNumber: store.total,
}))

// Métodos
async function cargarEncuestadores() {
  try {
    await store.fetchEncuestadores()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar encuestadores',
      caption: error.message,
    })
  }
}

function aplicarFiltros() {
  store.setFiltros(filtros.value)
  cargarEncuestadores()
}

function onRequest(props) {
  store.irAPagina(props.pagination.page)
}

function abrirDialogNuevo() {
  editando.value = false
  form.value = {
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    provincia_asignada: '',
    distrito: '',
    especializacion: [],
    fecha_contratacion: '',
    estado: 'activo',
    observaciones: '',
  }
  dialog.value = true
}

function editar(encuestador) {
  editando.value = true
  form.value = { ...encuestador }
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
      await store.updateEncuestador(form.value.id, form.value)
      $q.notify({
        type: 'positive',
        message: 'Encuestador actualizado exitosamente',
        icon: 'check_circle',
      })
    } else {
      await store.createEncuestador(form.value)
      $q.notify({
        type: 'positive',
        message: 'Encuestador creado exitosamente',
        icon: 'check_circle',
      })
    }
    cerrarDialog()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al ${editando.value ? 'actualizar' : 'crear'} encuestador`,
      caption: error.message,
    })
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(encuestador) {
  try {
    await store.updateEncuestador(encuestador.id, {
      ...encuestador,
      activo: !encuestador.activo,
    })
    $q.notify({
      type: 'positive',
      message: `Encuestador ${!encuestador.activo ? 'activado' : 'desactivado'}`,
      icon: 'info',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado',
      caption: error.message,
    })
  }
}

// Lifecycle
onMounted(() => {
  cargarEncuestadores()
})
</script>

<style scoped>
.q-card {
  transition: all 0.3s;
}
</style>
