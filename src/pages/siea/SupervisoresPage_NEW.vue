<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="supervisor_account" size="md" class="q-mr-sm" />
            Supervisores SIEA
          </div>
          <div class="text-subtitle2 text-grey-7">Gestión de personal supervisor</div>
        </div>
        <div class="col-12 col-md-6 text-right q-mt-sm q-mt-md-none">
          <q-btn
            label="Nuevo Supervisor"
            icon="add"
            color="primary"
            @click="abrirDialogNuevo"
            :loading="loading"
          />
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="secondary"
            @click="cargarSupervisores"
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
              <q-select
                v-model="filtros.region"
                :options="regionesOptions"
                label="Región"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="filtros.estado"
                :options="estadosOptions"
                label="Estado"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-12 col-md-4">
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
          </div>
          <div class="row q-mt-sm">
            <div class="col-12 text-right">
              <q-btn
                label="Filtrar"
                icon="search"
                color="primary"
                @click="aplicarFiltros"
                :loading="loading"
              />
              <q-btn
                label="Limpiar"
                icon="clear"
                color="grey"
                flat
                @click="limpiarFiltros"
                class="q-ml-sm"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card flat bordered>
        <q-table
          :rows="supervisores"
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

          <template v-slot:body-cell-region="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.region_supervisada }}</div>
              <div class="text-caption text-grey-7">
                {{ props.row.provincias_asignadas?.length || 0 }} provincias
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-provincias="props">
            <q-td :props="props">
              <q-badge
                v-for="(prov, idx) in props.row.provincias_asignadas?.slice(0, 3)"
                :key="idx"
                color="indigo"
                :label="prov"
                class="q-mr-xs q-mb-xs"
              />
              <q-badge
                v-if="props.row.provincias_asignadas?.length > 3"
                color="grey"
                :label="`+${props.row.provincias_asignadas.length - 3}`"
                class="q-mr-xs q-mb-xs"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                :color="
                  props.row.estado === 'activo'
                    ? 'positive'
                    : props.row.estado === 'suspendido'
                      ? 'warning'
                      : 'grey'
                "
                :label="props.row.estado"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn icon="edit" color="primary" size="sm" flat round @click="editar(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                icon="visibility"
                color="info"
                size="sm"
                flat
                round
                @click="verDetalle(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn
                icon="delete"
                color="negative"
                size="sm"
                flat
                round
                @click="confirmarEliminar(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Dialog: Crear/Editar -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 700px; max-width: 900px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ editando ? 'Editar' : 'Nuevo' }} Supervisor</div>
          </q-card-section>

          <q-card-section class="q-pt-none" style="max-height: 70vh; overflow-y: auto">
            <q-form ref="formRef">
              <div class="row q-col-gutter-md q-mt-sm">
                <!-- Nombres -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.nombres"
                    label="Nombres *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>

                <!-- Apellido Paterno -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.apellido_paterno"
                    label="Apellido Paterno *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>

                <!-- Apellido Materno -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.apellido_materno"
                    label="Apellido Materno *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>

                <!-- DNI -->
                <div class="col-12 col-md-4">
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

                <!-- Email -->
                <div class="col-12 col-md-4">
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

                <!-- Teléfono -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.telefono"
                    label="Teléfono *"
                    outlined
                    dense
                    mask="### ### ###"
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>

                <!-- Región Supervisada -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.region_supervisada"
                    label="Región Supervisada *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>

                <!-- Fecha Asignación -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.fecha_asignacion"
                    label="Fecha Asignación *"
                    type="date"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>

                <!-- Nivel Supervisor -->
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.nivel_supervisor"
                    :options="nivelesOptions"
                    label="Nivel Supervisor"
                    outlined
                    dense
                  />
                </div>

                <!-- Ámbito Supervisión -->
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.ambito_supervision"
                    :options="ambitosOptions"
                    label="Ámbito Supervisión"
                    outlined
                    dense
                  />
                </div>

                <!-- Estado -->
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.estado"
                    :options="estadosOptions"
                    label="Estado"
                    outlined
                    dense
                  />
                </div>

                <!-- Provincias Asignadas -->
                <div class="col-12">
                  <q-select
                    v-model="form.provincias_asignadas"
                    :options="provinciasOptions"
                    label="Provincias Asignadas"
                    outlined
                    dense
                    multiple
                    use-chips
                    hint="Seleccione las provincias a supervisar"
                  />
                </div>

                <!-- Observaciones -->
                <div class="col-12">
                  <q-input
                    v-model="form.observaciones"
                    label="Observaciones"
                    outlined
                    type="textarea"
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
import { useSieaSupervisoresStore } from 'src/stores/sieaSupervisores'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useSieaSupervisoresStore()

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
  region_supervisada: '',
  provincias_asignadas: [],
  fecha_asignacion: '',
  nivel_supervisor: 'intermedio',
  ambito_supervision: 'provincial',
  estado: 'activo',
  observaciones: '',
})

const filtros = ref({
  region: '',
  estado: '',
  search: '',
})

// Opciones
const regionesOptions = [
  'AMAZONAS',
  'ANCASH',
  'APURIMAC',
  'AREQUIPA',
  'AYACUCHO',
  'CAJAMARCA',
  'CALLAO',
  'CUSCO',
  'HUANCAVELICA',
  'HUANUCO',
  'ICA',
  'JUNIN',
  'LA LIBERTAD',
  'LAMBAYEQUE',
  'LIMA',
  'LORETO',
  'MADRE DE DIOS',
  'MOQUEGUA',
  'PASCO',
  'PIURA',
  'PUNO',
  'SAN MARTIN',
  'TACNA',
  'TUMBES',
  'UCAYALI',
]

const provinciasOptions = [
  'LIMA',
  'CALLAO',
  'AREQUIPA',
  'CUSCO',
  'LA LIBERTAD',
  'PIURA',
  'LAMBAYEQUE',
  'JUNIN',
  'ICA',
  'ANCASH',
  'CAJAMARCA',
  'PUNO',
  'LORETO',
  'HUANUCO',
  'SAN MARTIN',
  'UCAYALI',
  'AYACUCHO',
  'APURIMAC',
  'AMAZONAS',
  'TACNA',
  'MOQUEGUA',
  'TUMBES',
  'MADRE DE DIOS',
  'PASCO',
  'HUANCAVELICA',
  'HUANCAYO',
  'CONCEPCION',
  'JAUJA',
  'CAÑETE',
  'URUBAMBA',
  'CALCA',
  'ANTA',
  'CAYLLOMA',
]

const nivelesOptions = ['junior', 'intermedio', 'senior']

const ambitosOptions = ['local', 'provincial', 'regional', 'nacional']

const estadosOptions = ['activo', 'inactivo', 'suspendido']

// Columnas
const columns = [
  { name: 'nombre', label: 'Nombre Completo', align: 'left', field: 'nombres' },
  { name: 'contacto', label: 'Contacto', align: 'left', field: 'email' },
  { name: 'region', label: 'Región', align: 'left', field: 'region_supervisada' },
  { name: 'provincias', label: 'Provincias', align: 'left', field: 'provincias_asignadas' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const supervisores = computed(() => store.supervisores)
const loading = computed(() => store.loading)

const paginacion = computed(() => ({
  page: store.currentPage,
  rowsPerPage: store.perPage,
  rowsNumber: store.total,
}))

// Métodos
async function cargarSupervisores() {
  try {
    await store.fetchSupervisores()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar supervisores',
      caption: error.message,
    })
  }
}

function aplicarFiltros() {
  store.setFiltros(filtros.value)
  cargarSupervisores()
}

function limpiarFiltros() {
  filtros.value = {
    region: '',
    estado: '',
    search: '',
  }
  store.limpiarFiltros()
  cargarSupervisores()
}

function onRequest(props) {
  store.fetchSupervisores(props.pagination.page)
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
    region_supervisada: '',
    provincias_asignadas: [],
    fecha_asignacion: new Date().toISOString().split('T')[0],
    nivel_supervisor: 'intermedio',
    ambito_supervision: 'provincial',
    estado: 'activo',
    observaciones: '',
  }
  dialog.value = true
}

function editar(supervisor) {
  editando.value = true
  form.value = { ...supervisor }
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
      await store.updateSupervisor(form.value.id, form.value)
      $q.notify({
        type: 'positive',
        message: 'Supervisor actualizado exitosamente',
        icon: 'check_circle',
      })
    } else {
      await store.createSupervisor(form.value)
      $q.notify({
        type: 'positive',
        message: 'Supervisor creado exitosamente',
        icon: 'check_circle',
      })
    }
    cerrarDialog()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al ${editando.value ? 'actualizar' : 'crear'} supervisor`,
      caption: error.message,
    })
  } finally {
    guardando.value = false
  }
}

function verDetalle(supervisor) {
  $q.dialog({
    title: 'Detalle del Supervisor',
    message: `
      <div class="q-pa-md">
        <p><strong>Nombre:</strong> ${supervisor.nombre_completo || `${supervisor.nombres} ${supervisor.apellido_paterno} ${supervisor.apellido_materno}`}</p>
        <p><strong>DNI:</strong> ${supervisor.dni}</p>
        <p><strong>Email:</strong> ${supervisor.email}</p>
        <p><strong>Teléfono:</strong> ${supervisor.telefono || 'N/A'}</p>
        <p><strong>Región:</strong> ${supervisor.region_supervisada}</p>
        <p><strong>Provincias:</strong> ${supervisor.provincias_texto || (supervisor.provincias_asignadas || []).join(', ')}</p>
        <p><strong>Nivel:</strong> ${supervisor.nivel_supervisor}</p>
        <p><strong>Ámbito:</strong> ${supervisor.ambito_supervision}</p>
        <p><strong>Estado:</strong> ${supervisor.estado}</p>
        ${supervisor.observaciones ? `<p><strong>Observaciones:</strong> ${supervisor.observaciones}</p>` : ''}
      </div>
    `,
    html: true,
  })
}

function confirmarEliminar(supervisor) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar al supervisor ${supervisor.nombre_completo || `${supervisor.nombres} ${supervisor.apellido_paterno}`}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.deleteSupervisor(supervisor.id)
      $q.notify({
        type: 'positive',
        message: 'Supervisor eliminado exitosamente',
        icon: 'delete',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar supervisor',
        caption: error.message,
      })
    }
  })
}

// Lifecycle
onMounted(() => {
  cargarSupervisores()
})
</script>

<style scoped>
.q-card {
  transition: all 0.3s;
}
</style>
