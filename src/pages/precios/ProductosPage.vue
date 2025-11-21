<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-primary">
          <q-icon name="inventory_2" size="md" class="q-mr-sm" />
          Gestión de Productos
        </div>
        <div class="text-caption text-grey-7">
          Administre el catálogo de productos agrícolas y pecuarios
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          label="Nuevo Producto"
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
              label="Buscar producto..."
              outlined
              dense
              clearable
              @update:model-value="filtrarProductos"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Categoría -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroCategoria"
              :options="categoriasOptions"
              option-value="id"
              option-label="nombre"
              label="Filtrar por categoría"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="filtrarProductos"
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
              @update:model-value="filtrarProductos"
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
        :rows="productosFiltrados"
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
            <div class="text-caption text-grey-7">{{ props.row.categoria?.nombre }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-unidad="props">
          <q-td :props="props">
            <div>{{ props.row.unidad_medida }}</div>
            <div class="text-caption text-grey-7">Equiv: {{ props.row.equivalencia_kg }} kg</div>
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
              @click="editarProducto(props.row)"
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
              @click="eliminarProducto(props.row.id)"
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
          <div class="text-h6">{{ editMode ? 'Editar' : 'Nuevo' }} Producto</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Categoría -->
            <div class="col-12">
              <q-select
                v-model="formData.categoria_id"
                :options="categoriasOptions"
                option-value="id"
                option-label="nombre"
                label="Categoría *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Código -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.codigo"
                label="Código *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Nombre -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.nombre"
                label="Nombre *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Unidad de medida -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.unidad_medida"
                :options="unidadOptions"
                label="Unidad de Medida *"
                outlined
                dense
                :rules="[(val) => !!val || 'Requerido']"
              />
            </div>

            <!-- Equivalencia en kg -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.equivalencia_kg"
                type="number"
                label="Equivalencia en Kg *"
                outlined
                dense
                step="0.01"
                :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
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
            @click="guardarProducto"
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
const filtroCategoria = ref(null)
const filtroEstado = ref(null)

// Opciones
const estadoOptions = [
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 0 },
]

const unidadOptions = [
  'Kilogramo',
  'Gramo',
  'Tonelada',
  'Unidad',
  'Docena',
  'Litro',
  'Mililitro',
  'Arroba',
  'Quintal',
  'Saco',
]

// Formulario
const formData = ref({
  id: null,
  categoria_id: null,
  codigo: '',
  nombre: '',
  unidad_medida: 'Kilogramo',
  equivalencia_kg: 1,
  estado: true,
})

// Columnas
const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
  { name: 'unidad', label: 'Unidad', field: 'unidad_medida', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const categoriasOptions = computed(() => preciosStore.categorias || [])

const productosFiltrados = computed(() => {
  let productos = preciosStore.productos || []

  if (search.value) {
    const needle = search.value.toLowerCase()
    productos = productos.filter(
      (p) => p.nombre?.toLowerCase().includes(needle) || p.codigo?.toLowerCase().includes(needle),
    )
  }

  if (filtroCategoria.value) {
    productos = productos.filter((p) => p.categoria_id === filtroCategoria.value)
  }

  if (filtroEstado.value !== null) {
    productos = productos.filter((p) => p.estado === !!filtroEstado.value)
  }

  return productos
})

// Métodos
const filtrarProductos = () => {
  // Trigger computed
}

const abrirDialogNuevo = () => {
  editMode.value = false
  formData.value = {
    id: null,
    categoria_id: null,
    codigo: '',
    nombre: '',
    unidad_medida: 'Kilogramo',
    equivalencia_kg: 1,
    estado: true,
  }
  showDialog.value = true
}

const editarProducto = (producto) => {
  editMode.value = true
  formData.value = {
    id: producto.id,
    categoria_id: producto.categoria_id,
    codigo: producto.codigo,
    nombre: producto.nombre,
    unidad_medida: producto.unidad_medida,
    equivalencia_kg: producto.equivalencia_kg,
    estado: producto.estado,
  }
  showDialog.value = true
}

const guardarProducto = async () => {
  saving.value = true
  const data = { ...formData.value }
  delete data.id

  const success = editMode.value
    ? await preciosStore.updateProducto(formData.value.id, data)
    : await preciosStore.createProducto(data)

  if (success) {
    $q.notify({
      type: 'positive',
      message: `Producto ${editMode.value ? 'actualizado' : 'creado'} exitosamente`,
      icon: 'check_circle',
    })
    cerrarDialog()
  }
  saving.value = false
}

const eliminarProducto = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este producto?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await preciosStore.deleteProducto(id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Producto eliminado exitosamente',
      })
    }
  })
}

const cerrarDialog = () => {
  showDialog.value = false
}

const loadData = async () => {
  loading.value = true
  await Promise.all([preciosStore.fetchProductos(), preciosStore.fetchCategorias()])
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>
