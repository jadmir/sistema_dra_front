<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-primary">
          <q-icon name="verified" size="md" class="q-mr-sm" />
          Validación de Muestras
        </div>
        <div class="text-caption text-grey-7">
          Revise y valide las muestras pendientes de aprobación
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Filtros</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Fecha -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fecha"
              type="date"
              label="Fecha"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Producto -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.producto_id"
              :options="productosOptions"
              option-value="id"
              label="Producto"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="inventory_2" color="primary" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.nombre }}</span>
              </template>
            </q-select>
          </div>

          <!-- Mercado -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.mercado_id"
              :options="mercadosOptions"
              option-value="id"
              label="Mercado"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.tipo }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.nombre }}</span>
              </template>
            </q-select>
          </div>

          <!-- Estado -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.validado"
              :options="estadoOptions"
              label="Estado"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" color="primary" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de muestras -->
    <q-card flat bordered>
      <q-card-section class="bg-gradient-green text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">
              Muestras Registradas
              <q-badge color="white" text-color="primary" class="q-ml-sm">
                {{ muestrasPendientes }} pendientes
              </q-badge>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              v-if="seleccionadas.length > 0"
              :label="`Validar ${seleccionadas.length} seleccionadas`"
              icon="verified"
              color="white"
              text-color="primary"
              unelevated
              @click="validarLote"
              :loading="validando"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section
        v-if="muestras.length === 0 && !loading"
        class="text-center text-grey-7 q-pa-lg"
      >
        <q-icon name="inbox" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">No hay muestras disponibles</div>
        <div class="text-caption">Cambie los filtros o registre nuevas muestras</div>
      </q-card-section>

      <q-table
        v-else
        :rows="muestras"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        flat
        bordered
        class="sticky-header-table"
        :selected="seleccionadas"
        @update:selected="(val) => (seleccionadas = val)"
        selection="multiple"
      >
        <template v-slot:body-selection="scope">
          <q-checkbox v-model="scope.selected" :disable="scope.row.validado" color="primary" />
        </template>

        <template v-slot:header-selection>
          <q-checkbox
            v-model="seleccionarTodas"
            color="primary"
            @update:model-value="toggleSeleccionarTodas"
          />
        </template>

        <template v-slot:body-cell-producto="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.producto?.nombre }}</div>
            <div class="text-caption text-grey-7">{{ props.row.producto?.categoria?.nombre }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-mercado="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.mercado?.nombre }}</div>
            <q-badge
              :color="props.row.mercado?.tipo === 'MAYORISTA' ? 'orange' : 'blue'"
              :label="props.row.mercado?.tipo"
              class="q-mt-xs"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-muestra="props">
          <q-td :props="props">
            <q-badge color="primary" :label="`M${props.row.muestra_nro}`" />
            <span v-if="props.row.punto_nro" class="q-ml-xs text-caption text-grey-7">
              P{{ props.row.punto_nro }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-calidad="props">
          <q-td :props="props">
            <q-badge
              v-if="props.row.calidad"
              :color="getCalidadColor(props.row.calidad)"
              :label="getCalidadTexto(props.row.calidad)"
            />
            <span v-else class="text-grey-6">-</span>
          </q-td>
        </template>

        <template v-slot:body-cell-precio="props">
          <q-td :props="props">
            <div class="text-weight-bold text-positive">
              S/ {{ Number(props.row.precio).toFixed(2) }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-encuestador="props">
          <q-td :props="props">
            <div>{{ props.row.encuestador?.nombre }}</div>
            <div class="text-caption text-grey-7">{{ props.row.encuestador?.codigo }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-validado="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.validado ? 'positive' : 'warning'"
              :label="props.row.validado ? 'Validado' : 'Pendiente'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              v-if="!props.row.validado"
              icon="check"
              color="positive"
              size="sm"
              flat
              round
              dense
              @click="validarMuestra(props.row.id)"
            >
              <q-tooltip>Validar</q-tooltip>
            </q-btn>

            <q-btn
              icon="visibility"
              color="primary"
              size="sm"
              flat
              round
              dense
              @click="verDetalle(props.row)"
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>

            <q-btn
              v-if="!props.row.validado"
              icon="edit"
              color="blue"
              size="sm"
              flat
              round
              dense
              @click="editarMuestra(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="!props.row.validado"
              icon="delete"
              color="negative"
              size="sm"
              flat
              round
              dense
              @click="eliminarMuestra(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de detalle -->
    <q-dialog v-model="showDetalle" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalle de Muestra</div>
        </q-card-section>

        <q-card-section v-if="muestraSeleccionada">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-7">Fecha</div>
              <div class="text-weight-medium">{{ muestraSeleccionada.fecha }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-7">Muestra Nº</div>
              <div class="text-weight-medium">{{ muestraSeleccionada.muestra_nro }}</div>
            </div>
            <div class="col-12 q-mt-sm">
              <div class="text-caption text-grey-7">Producto</div>
              <div class="text-weight-medium">{{ muestraSeleccionada.producto?.nombre }}</div>
            </div>
            <div class="col-12 q-mt-sm">
              <div class="text-caption text-grey-7">Mercado</div>
              <div class="text-weight-medium">
                {{ muestraSeleccionada.mercado?.nombre }} ({{ muestraSeleccionada.mercado?.tipo }})
              </div>
            </div>
            <div class="col-6 q-mt-sm">
              <div class="text-caption text-grey-7">Precio</div>
              <div class="text-h6 text-positive">
                S/ {{ Number(muestraSeleccionada.precio).toFixed(2) }}
              </div>
            </div>
            <div class="col-6 q-mt-sm">
              <div class="text-caption text-grey-7">Calidad</div>
              <div class="text-weight-medium">
                {{ getCalidadTexto(muestraSeleccionada.calidad) || '-' }}
              </div>
            </div>
            <div class="col-12 q-mt-sm" v-if="muestraSeleccionada.procedencia_principal">
              <div class="text-caption text-grey-7">Procedencia Principal</div>
              <div class="text-weight-medium">{{ muestraSeleccionada.procedencia_principal }}</div>
            </div>
            <div class="col-12 q-mt-sm" v-if="muestraSeleccionada.procedencia_secundaria">
              <div class="text-caption text-grey-7">Procedencia Secundaria</div>
              <div class="text-weight-medium">{{ muestraSeleccionada.procedencia_secundaria }}</div>
            </div>
            <div class="col-12 q-mt-sm" v-if="muestraSeleccionada.observaciones">
              <div class="text-caption text-grey-7">Observaciones</div>
              <div class="text-weight-medium">{{ muestraSeleccionada.observaciones }}</div>
            </div>
            <div class="col-12 q-mt-sm">
              <div class="text-caption text-grey-7">Encuestador</div>
              <div class="text-weight-medium">
                {{ muestraSeleccionada.encuestador?.nombre }} ({{
                  muestraSeleccionada.encuestador?.codigo
                }})
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="grey-7" flat @click="showDetalle = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePreciosStore } from 'stores/precios'

// Store y utilidades
const $q = useQuasar()
const preciosStore = usePreciosStore()

// Estados
const loading = ref(false)
const validando = ref(false)
const showDetalle = ref(false)
const muestraSeleccionada = ref(null)
const seleccionadas = ref([])
const seleccionarTodas = ref(false)

// Filtros
const filtros = ref({
  fecha: new Date().toISOString().split('T')[0],
  producto_id: null,
  mercado_id: null,
  validado: 0, // 0 = pendientes, 1 = validadas
})

const estadoOptions = [
  { label: 'Pendientes', value: 0 },
  { label: 'Validadas', value: 1 },
]

// Paginación
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 50,
  rowsNumber: 0,
})

// Columnas de la tabla
const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'mercado', label: 'Mercado', field: 'mercado', align: 'left' },
  { name: 'muestra', label: 'Muestra', field: 'muestra_nro', align: 'center' },
  { name: 'calidad', label: 'Calidad', field: 'calidad', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true },
  { name: 'encuestador', label: 'Encuestador', field: 'encuestador', align: 'left' },
  { name: 'validado', label: 'Estado', field: 'validado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const muestras = computed(() => preciosStore.muestras?.data || preciosStore.muestras || [])
const muestrasPendientes = computed(() => muestras.value.filter((m) => !m.validado).length)
const productosOptions = computed(() => preciosStore.productos || [])
const mercadosOptions = computed(() => preciosStore.mercados || [])

// Funciones de utilidad
const getCalidadTexto = (calidad) => {
  const opciones = {
    1: 'Extra',
    2: 'Primera',
    3: 'Segunda',
    4: 'Tercera',
    5: 'Descarte',
  }
  return opciones[calidad] || ''
}

const getCalidadColor = (calidad) => {
  const colores = {
    1: 'green',
    2: 'blue',
    3: 'orange',
    4: 'deep-orange',
    5: 'red',
  }
  return colores[calidad] || 'grey'
}

// Cargar muestras
const fetchMuestras = async (params = {}) => {
  loading.value = true
  try {
    await preciosStore.fetchMuestras({
      ...filtros.value,
      ...params,
      per_page: pagination.value.rowsPerPage,
    })

    // Actualizar paginación si viene data
    if (preciosStore.muestras?.total) {
      pagination.value.rowsNumber = preciosStore.muestras.total
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar muestras',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}

// Aplicar filtros
const aplicarFiltros = () => {
  seleccionadas.value = []
  seleccionarTodas.value = false
  fetchMuestras()
}

// Paginación
const onRequest = (props) => {
  pagination.value = props.pagination
  fetchMuestras()
}

// Toggle seleccionar todas
const toggleSeleccionarTodas = (val) => {
  if (val) {
    seleccionadas.value = muestras.value.filter((m) => !m.validado)
  } else {
    seleccionadas.value = []
  }
}

// Validar muestra individual
const validarMuestra = async (id) => {
  $q.dialog({
    title: 'Confirmar validación',
    message: '¿Desea validar esta muestra?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Validar', color: 'positive', unelevated: true },
  }).onOk(async () => {
    const success = await preciosStore.validarMuestra(id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Muestra validada exitosamente',
        icon: 'check_circle',
      })
      fetchMuestras()
    }
  })
}

// Validar lote
const validarLote = async () => {
  if (seleccionadas.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar al menos una muestra' })
    return
  }

  $q.dialog({
    title: 'Confirmar validación',
    message: `¿Desea validar ${seleccionadas.value.length} muestra(s)?`,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Validar', color: 'positive', unelevated: true },
  }).onOk(async () => {
    validando.value = true
    const ids = seleccionadas.value.map((m) => m.id)
    const success = await preciosStore.validarMuestrasLote(ids)

    if (success) {
      $q.notify({
        type: 'positive',
        message: `Se validaron ${ids.length} muestra(s) exitosamente`,
        icon: 'check_circle',
      })
      seleccionadas.value = []
      seleccionarTodas.value = false
      fetchMuestras()
    }
    validando.value = false
  })
}

// Ver detalle
const verDetalle = (muestra) => {
  muestraSeleccionada.value = muestra
  showDetalle.value = true
}

// Editar muestra (placeholder)
const editarMuestra = () => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de edición en desarrollo',
  })
}

// Eliminar muestra
const eliminarMuestra = async (id) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro de eliminar esta muestra? Esta acción no se puede deshacer.',
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
  }).onOk(async () => {
    const success = await preciosStore.deleteMuestra(id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Muestra eliminada exitosamente',
        icon: 'delete',
      })
      fetchMuestras()
    }
  })
}

// Cargar datos iniciales
const loadInitialData = async () => {
  await Promise.all([preciosStore.fetchProductos(), preciosStore.fetchMercados()])
  fetchMuestras()
}

// Lifecycle
onMounted(() => {
  loadInitialData()
})
</script>

<style scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #4a7c39 100%);
}

.sticky-header-table {
  max-height: calc(100vh - 350px);
}

.sticky-header-table >>> thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
}
</style>
