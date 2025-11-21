<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-primary">
          <q-icon name="badge" size="md" class="q-mr-sm" />
          Gestión de Encuestadores
        </div>
        <div class="text-caption text-grey-7">
          Administre el personal encargado del registro de precios
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          label="Nuevo Encuestador"
          icon="add"
          color="primary"
          unelevated
          @click="abrirDialogNuevo"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Búsqueda -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              label="Buscar encuestador..."
              outlined
              dense
              clearable
              @update:model-value="filtrarEncuestadores"
              placeholder="Nombre, código o DNI"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Estado -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="filtroEstado"
              :options="estadoOptions"
              label="Estado"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="filtrarEncuestadores"
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card flat bordered>
      <q-table
        :rows="encuestadoresFiltrados"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 20 }"
        flat
        bordered
      >
        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-badge color="primary" :label="props.row.codigo" />
          </q-td>
        </template>

        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre }}</div>
            <div class="text-caption text-grey-7">DNI: {{ props.row.dni }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-contacto="props">
          <q-td :props="props">
            <div v-if="props.row.telefono">
              <q-icon name="phone" size="xs" class="q-mr-xs" />
              {{ props.row.telefono }}
            </div>
            <div v-if="props.row.email" class="text-caption">
              <q-icon name="email" size="xs" class="q-mr-xs" />
              {{ props.row.email }}
            </div>
            <span v-if="!props.row.telefono && !props.row.email" class="text-grey-6">-</span>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.estado ? 'positive' : 'negative'"
              :label="props.row.estado ? 'Activo' : 'Inactivo'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              icon="edit"
              color="primary"
              size="sm"
              flat
              round
              dense
              @click="editarEncuestador(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              icon="delete"
              color="negative"
              size="sm"
              flat
              round
              dense
              @click="eliminarEncuestador(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Formulario -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editMode ? 'Editar' : 'Nuevo' }} Encuestador</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Código -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.codigo"
                label="Código *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
                placeholder="ENC001"
              />
            </div>

            <!-- DNI -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.dni"
                label="DNI *"
                outlined
                dense
                mask="########"
                :rules="[
                  (val) => !!val || 'Requerido',
                  (val) => val.length === 8 || 'Debe tener 8 dígitos',
                ]"
                placeholder="12345678"
              />
            </div>

            <!-- Nombre completo -->
            <div class="col-12">
              <q-input
                v-model="formData.nombre"
                label="Nombre Completo *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
                placeholder="Juan Pérez López"
              />
            </div>

            <!-- Teléfono -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.telefono"
                label="Teléfono"
                outlined
                dense
                placeholder="987654321"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>

            <!-- Email -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.email"
                label="Email"
                type="email"
                outlined
                dense
                placeholder="encuestador@example.com"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <!-- Estado -->
            <div class="col-12">
              <q-toggle v-model="formData.estado" label="Activo" color="positive" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="grey-7" flat @click="cerrarDialog" />
          <q-btn
            :label="editMode ? 'Actualizar' : 'Guardar'"
            color="primary"
            unelevated
            @click="guardarEncuestador"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePreciosStore } from 'stores/precios'

const $q = useQuasar()
const preciosStore = usePreciosStore()

// Estados
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editMode = ref(false)
const search = ref('')
const filtroEstado = ref(null)

// Opciones
const estadoOptions = [
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 0 },
]

// Formulario
const formData = ref({
  id: null,
  codigo: '',
  nombre: '',
  dni: '',
  telefono: '',
  email: '',
  estado: true,
})

// Columnas
const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Encuestador', field: 'nombre', align: 'left', sortable: true },
  { name: 'contacto', label: 'Contacto', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const encuestadoresFiltrados = computed(() => {
  let encuestadores = preciosStore.encuestadores || []

  if (search.value) {
    const needle = search.value.toLowerCase()
    encuestadores = encuestadores.filter(
      (e) =>
        e.nombre?.toLowerCase().includes(needle) ||
        e.codigo?.toLowerCase().includes(needle) ||
        e.dni?.includes(needle),
    )
  }

  if (filtroEstado.value !== null) {
    encuestadores = encuestadores.filter((e) => e.estado === !!filtroEstado.value)
  }

  return encuestadores
})

// Métodos
const filtrarEncuestadores = () => {
  // Trigger computed
}

const abrirDialogNuevo = () => {
  editMode.value = false
  formData.value = {
    id: null,
    codigo: '',
    nombre: '',
    dni: '',
    telefono: '',
    email: '',
    estado: true,
  }
  showDialog.value = true
}

const editarEncuestador = (encuestador) => {
  editMode.value = true
  formData.value = {
    id: encuestador.id,
    codigo: encuestador.codigo,
    nombre: encuestador.nombre,
    dni: encuestador.dni,
    telefono: encuestador.telefono,
    email: encuestador.email,
    estado: encuestador.estado,
  }
  showDialog.value = true
}

const guardarEncuestador = async () => {
  // Validaciones básicas
  if (!formData.value.codigo || !formData.value.nombre || !formData.value.dni) {
    $q.notify({
      type: 'warning',
      message: 'Complete los campos obligatorios',
      icon: 'warning',
    })
    return
  }

  if (formData.value.dni.length !== 8) {
    $q.notify({
      type: 'warning',
      message: 'El DNI debe tener 8 dígitos',
      icon: 'warning',
    })
    return
  }

  saving.value = true
  const data = { ...formData.value }
  delete data.id

  const success = editMode.value
    ? await preciosStore.updateEncuestador(formData.value.id, data)
    : await preciosStore.createEncuestador(data)

  if (success) {
    $q.notify({
      type: 'positive',
      message: `Encuestador ${editMode.value ? 'actualizado' : 'creado'} exitosamente`,
      icon: 'check_circle',
    })
    cerrarDialog()
  }
  saving.value = false
}

const eliminarEncuestador = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este encuestador?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await preciosStore.deleteEncuestador(id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Encuestador eliminado exitosamente',
      })
    }
  })
}

const cerrarDialog = () => {
  showDialog.value = false
}

const loadData = async () => {
  loading.value = true
  await preciosStore.fetchEncuestadores()
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>
