<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-primary">
          <q-icon name="category" size="md" class="q-mr-sm" />
          Gestión de Categorías
        </div>
        <div class="text-caption text-grey-7">
          Administre las categorías de productos agrícolas y pecuarios
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          label="Nueva Categoría"
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
          <div class="col-12 col-md-8">
            <q-input
              v-model="search"
              label="Buscar categoría..."
              outlined
              dense
              clearable
              @update:model-value="filtrarCategorias"
              placeholder="Nombre o código"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
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
              @update:model-value="filtrarCategorias"
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
        :rows="categoriasFiltradas"
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
          </q-td>
        </template>

        <template v-slot:body-cell-productos="props">
          <q-td :props="props">
            <q-badge color="blue" :label="`${props.row.productos_count || 0} productos`" />
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
              @click="editarCategoria(props.row)"
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
              @click="eliminarCategoria(props.row.id)"
              :disable="props.row.productos_count > 0"
            >
              <q-tooltip>
                {{
                  props.row.productos_count > 0
                    ? 'No se puede eliminar (tiene productos)'
                    : 'Eliminar'
                }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Formulario -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editMode ? 'Editar' : 'Nueva' }} Categoría</div>
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
                placeholder="TUB, HOR, FRU"
                maxlength="10"
              >
                <template v-slot:hint> 3-10 caracteres en mayúsculas </template>
              </q-input>
            </div>

            <!-- Nombre -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.nombre"
                label="Nombre *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
                placeholder="Ej: Tubérculos y Raíces"
              />
            </div>

            <!-- Descripción -->
            <div class="col-12">
              <q-input
                v-model="formData.descripcion"
                label="Descripción"
                outlined
                dense
                type="textarea"
                rows="3"
                placeholder="Descripción opcional de la categoría"
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
            @click="guardarCategoria"
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
  descripcion: '',
  estado: true,
})

// Columnas
const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Categoría', field: 'nombre', align: 'left', sortable: true },
  { name: 'productos', label: 'Productos', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const categoriasFiltradas = computed(() => {
  let categorias = preciosStore.categorias || []

  if (search.value) {
    const needle = search.value.toLowerCase()
    categorias = categorias.filter(
      (c) => c.nombre?.toLowerCase().includes(needle) || c.codigo?.toLowerCase().includes(needle),
    )
  }

  if (filtroEstado.value !== null) {
    categorias = categorias.filter((c) => c.estado === !!filtroEstado.value)
  }

  return categorias
})

// Métodos
const filtrarCategorias = () => {
  // Trigger computed
}

const abrirDialogNuevo = () => {
  editMode.value = false
  formData.value = {
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: true,
  }
  showDialog.value = true
}

const editarCategoria = (categoria) => {
  editMode.value = true
  formData.value = {
    id: categoria.id,
    codigo: categoria.codigo,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion || '',
    estado: categoria.estado,
  }
  showDialog.value = true
}

const guardarCategoria = async () => {
  // Validaciones
  if (!formData.value.codigo || !formData.value.nombre) {
    $q.notify({
      type: 'warning',
      message: 'Complete los campos obligatorios',
      icon: 'warning',
    })
    return
  }

  // Convertir código a mayúsculas
  formData.value.codigo = formData.value.codigo.toUpperCase()

  saving.value = true
  const data = { ...formData.value }
  delete data.id

  const success = editMode.value
    ? await preciosStore.updateCategoria(formData.value.id, data)
    : await preciosStore.createCategoria(data)

  if (success) {
    $q.notify({
      type: 'positive',
      message: `Categoría ${editMode.value ? 'actualizada' : 'creada'} exitosamente`,
      icon: 'check_circle',
    })
    cerrarDialog()
  } else {
    $q.notify({
      type: 'negative',
      message: preciosStore.error || 'Error al guardar categoría',
    })
  }
  saving.value = false
}

const eliminarCategoria = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.',
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    const success = await preciosStore.deleteCategoria(id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Categoría eliminada exitosamente',
        icon: 'delete',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: preciosStore.error || 'Error al eliminar categoría',
      })
    }
  })
}

const cerrarDialog = () => {
  showDialog.value = false
}

const loadData = async () => {
  loading.value = true
  await preciosStore.fetchCategorias()
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>
