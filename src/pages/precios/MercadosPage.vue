<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-primary">
          <q-icon name="store" size="md" class="q-mr-sm" />
          Gestión de Mercados
        </div>
        <div class="text-caption text-grey-7">Administre los mercados mayoristas y minoristas</div>
      </div>
      <div class="col-auto">
        <q-btn
          label="Nuevo Mercado"
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
          <div class="col-12 col-md-4">
            <q-input
              v-model="search"
              label="Buscar mercado..."
              outlined
              dense
              clearable
              @update:model-value="filtrarMercados"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Tipo -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroTipo"
              :options="tipoOptions"
              label="Tipo de mercado"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="filtrarMercados"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <!-- Estado -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroEstado"
              :options="estadoOptions"
              label="Estado"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="filtrarMercados"
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
        :rows="mercadosFiltrados"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 20 }"
        flat
        bordered
      >
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre }}</div>
            <div class="text-caption text-grey-7">{{ props.row.direccion || 'Sin dirección' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.tipo === 'MAYORISTA' ? 'orange' : 'blue'"
              :label="props.row.tipo"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-ubicacion="props">
          <q-td :props="props">
            <div v-if="props.row.ubicacion">
              <div>{{ props.row.ubicacion.departamento }}</div>
              <div class="text-caption text-grey-7">
                {{ props.row.ubicacion.provincia }} - {{ props.row.ubicacion.distrito }}
              </div>
            </div>
            <span v-else class="text-grey-6">-</span>
          </q-td>
        </template>

        <template v-slot:body-cell-zona="props">
          <q-td :props="props">
            {{ props.row.zona || '-' }}
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
              @click="editarMercado(props.row)"
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
              @click="eliminarMercado(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Formulario -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editMode ? 'Editar' : 'Nuevo' }} Mercado</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Nombre -->
            <div class="col-12">
              <q-input
                v-model="formData.nombre"
                label="Nombre del Mercado *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Tipo -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.tipo"
                :options="tipoOptions"
                label="Tipo *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Zona -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.zona"
                label="Zona"
                outlined
                dense
                placeholder="Ej: Centro, Norte, Sur"
              />
            </div>

            <!-- Dirección -->
            <div class="col-12">
              <q-input
                v-model="formData.direccion"
                label="Dirección"
                outlined
                dense
                placeholder="Ej: Jr. Arequipa 123"
              />
            </div>

            <!-- Ubicación -->
            <div class="col-12">
              <q-select
                v-model="formData.ubicacion_id"
                :options="ubicacionesOptions"
                option-value="id"
                :option-label="
                  (opt) => `${opt.departamento} - ${opt.provincia || ''} - ${opt.distrito || ''}`
                "
                label="Ubicación"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>

            <!-- Teléfono -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.telefono"
                label="Teléfono"
                outlined
                dense
                placeholder="051-123456"
              />
            </div>

            <!-- Coordenadas -->
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="formData.latitud"
                type="number"
                label="Latitud"
                outlined
                dense
                step="0.0001"
                placeholder="-15.8402"
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model.number="formData.longitud"
                type="number"
                label="Longitud"
                outlined
                dense
                step="0.0001"
                placeholder="-70.0219"
              />
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
            @click="guardarMercado"
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
const filtroTipo = ref(null)
const filtroEstado = ref(null)

// Opciones
const tipoOptions = [
  { label: 'Mayorista', value: 'MAYORISTA' },
  { label: 'Minorista', value: 'MINORISTA' },
]

const estadoOptions = [
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 0 },
]

// Formulario
const formData = ref({
  id: null,
  nombre: '',
  direccion: '',
  zona: '',
  tipo: 'MINORISTA',
  ubicacion_id: null,
  latitud: null,
  longitud: null,
  telefono: '',
  estado: true,
})

// Columnas
const columns = [
  { name: 'nombre', label: 'Mercado', field: 'nombre', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center', sortable: true },
  { name: 'ubicacion', label: 'Ubicación', align: 'left' },
  { name: 'zona', label: 'Zona', field: 'zona', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const ubicacionesOptions = computed(() => preciosStore.ubicaciones || [])

const mercadosFiltrados = computed(() => {
  let mercados = preciosStore.mercados || []

  if (search.value) {
    const needle = search.value.toLowerCase()
    mercados = mercados.filter(
      (m) =>
        m.nombre?.toLowerCase().includes(needle) || m.direccion?.toLowerCase().includes(needle),
    )
  }

  if (filtroTipo.value) {
    mercados = mercados.filter((m) => m.tipo === filtroTipo.value)
  }

  if (filtroEstado.value !== null) {
    mercados = mercados.filter((m) => m.estado === !!filtroEstado.value)
  }

  return mercados
})

// Métodos
const filtrarMercados = () => {
  // Trigger computed
}

const abrirDialogNuevo = () => {
  editMode.value = false
  formData.value = {
    id: null,
    nombre: '',
    direccion: '',
    zona: '',
    tipo: 'MINORISTA',
    ubicacion_id: null,
    latitud: null,
    longitud: null,
    telefono: '',
    estado: true,
  }
  showDialog.value = true
}

const editarMercado = (mercado) => {
  editMode.value = true
  formData.value = {
    id: mercado.id,
    nombre: mercado.nombre,
    direccion: mercado.direccion,
    zona: mercado.zona,
    tipo: mercado.tipo,
    ubicacion_id: mercado.ubicacion_id,
    latitud: mercado.latitud,
    longitud: mercado.longitud,
    telefono: mercado.telefono,
    estado: mercado.estado,
  }
  showDialog.value = true
}

const guardarMercado = async () => {
  saving.value = true
  const data = { ...formData.value }
  delete data.id

  const success = editMode.value
    ? await preciosStore.updateMercado(formData.value.id, data)
    : await preciosStore.createMercado(data)

  if (success) {
    $q.notify({
      type: 'positive',
      message: `Mercado ${editMode.value ? 'actualizado' : 'creado'} exitosamente`,
      icon: 'check_circle',
    })
    cerrarDialog()
  }
  saving.value = false
}

const eliminarMercado = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este mercado?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await preciosStore.deleteMercado(id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Mercado eliminado exitosamente',
      })
    }
  })
}

const cerrarDialog = () => {
  showDialog.value = false
}

const loadData = async () => {
  loading.value = true
  await Promise.all([preciosStore.fetchMercados(), preciosStore.fetchUbicaciones()])
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>
