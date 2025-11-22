<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-primary">
          <q-icon name="edit_note" size="md" class="q-mr-sm" />
          Registro de Muestras de Precios
        </div>
        <div class="text-caption text-grey-7">
          Registre 4 muestras de precios por producto y mercado
        </div>
      </div>
    </div>

    <!-- Tabs Mayorista/Minorista -->
    <q-card flat bordered class="q-mb-md">
      <q-tabs
        v-model="tipoMercado"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="mayorista" icon="store" label="Mercados Mayoristas" />
        <q-tab name="minorista" icon="shopping_cart" label="Mercados Minoristas" />
      </q-tabs>
    </q-card>

    <!-- Formulario principal -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Datos Generales</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Fecha -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="formData.fecha"
              type="date"
              label="Fecha *"
              outlined
              dense
              :max="maxDate"
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Mercado -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="formData.mercado_id"
              :options="mercadosOptions"
              option-value="id"
              label="Mercado *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || 'Requerido']"
              :loading="loadingMercados"
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
                <span>{{ scope.opt.nombre }} ({{ scope.opt.tipo }})</span>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay mercados disponibles </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Producto -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="formData.producto_id"
              :options="productosOptions"
              option-value="id"
              label="Producto *"
              outlined
              dense
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterProductos"
              :rules="[(val) => !!val || 'Requerido']"
              :loading="loadingProductos"
            >
              <template v-slot:prepend>
                <q-icon name="inventory_2" color="primary" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption
                      >{{ scope.opt.codigo }} - {{ scope.opt.unidad_medida }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.nombre }} ({{ scope.opt.unidad_medida }})</span>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay productos disponibles </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Encuestador -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="formData.encuestador_id"
              :options="encuestadoresOptions"
              option-value="id"
              label="Encuestador *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || 'Requerido']"
              :loading="loadingEncuestadores"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
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
                <span>{{ scope.opt.nombre }} ({{ scope.opt.codigo }})</span>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay encuestadores disponibles
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 4 Muestras -->
    <div class="row q-col-gutter-md">
      <div v-for="num in 4" :key="num" class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="bg-gradient-green text-white">
            <div class="text-subtitle1 text-weight-medium">
              <q-icon name="science" class="q-mr-xs" />
              Muestra {{ num }}
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <!-- Punto Nro -->
              <div class="col-6">
                <q-input
                  v-model.number="muestras[num - 1].punto_nro"
                  type="number"
                  label="Punto Nº"
                  outlined
                  dense
                  min="1"
                >
                  <template v-slot:prepend>
                    <q-icon name="pin_drop" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Calidad -->
              <div class="col-6">
                <q-select
                  v-model="muestras[num - 1].calidad"
                  :options="calidadOptions"
                  label="Calidad"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="grade" size="xs" />
                  </template>
                </q-select>
              </div>

              <!-- Precio -->
              <div class="col-12">
                <q-input
                  v-model.number="muestras[num - 1].precio"
                  type="number"
                  label="Precio (S/) *"
                  outlined
                  dense
                  min="0.01"
                  step="0.01"
                  :rules="[
                    (val) => val > 0 || 'El precio debe ser mayor a 0',
                    (val) => !!val || 'Requerido',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="payments" color="positive" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Procedencia Principal -->
              <div class="col-12">
                <q-input
                  v-model="muestras[num - 1].procedencia_principal"
                  label="Procedencia Principal"
                  outlined
                  dense
                  placeholder="Ej: Puno, Ilave"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Procedencia Secundaria -->
              <div class="col-12">
                <q-input
                  v-model="muestras[num - 1].procedencia_secundaria"
                  label="Procedencia Secundaria"
                  outlined
                  dense
                  placeholder="Ej: Puno, Juli"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Observaciones -->
              <div class="col-12">
                <q-input
                  v-model="muestras[num - 1].observaciones"
                  label="Observaciones"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  placeholder="Comentarios adicionales..."
                >
                  <template v-slot:prepend>
                    <q-icon name="comment" size="xs" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="row q-mt-md q-gutter-sm justify-end">
      <q-btn
        label="Limpiar"
        icon="refresh"
        color="grey-7"
        outline
        @click="resetForm"
        :disable="saving"
      />
      <q-btn
        label="Guardar Muestras"
        icon="save"
        color="primary"
        unelevated
        @click="guardarMuestras"
        :loading="saving"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePreciosStore } from 'stores/precios'

// Store y utilidades
const $q = useQuasar()
const preciosStore = usePreciosStore()

// Tipo de mercado (mayorista/minorista)
const tipoMercado = ref('mayorista')

// Estados de carga
const loadingMercados = ref(false)
const loadingProductos = ref(false)
const loadingEncuestadores = ref(false)
const saving = ref(false)

// Fecha máxima (hoy)
const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Datos del formulario
const formData = ref({
  fecha: new Date().toISOString().split('T')[0],
  mercado_id: null,
  producto_id: null,
  encuestador_id: null,
})

// 4 muestras
const muestras = ref([
  {
    muestra_nro: 1,
    punto_nro: null,
    calidad: null,
    precio: null,
    procedencia_principal: '',
    procedencia_secundaria: '',
    observaciones: '',
  },
  {
    muestra_nro: 2,
    punto_nro: null,
    calidad: null,
    precio: null,
    procedencia_principal: '',
    procedencia_secundaria: '',
    observaciones: '',
  },
  {
    muestra_nro: 3,
    punto_nro: null,
    calidad: null,
    precio: null,
    procedencia_principal: '',
    procedencia_secundaria: '',
    observaciones: '',
  },
  {
    muestra_nro: 4,
    punto_nro: null,
    calidad: null,
    precio: null,
    procedencia_principal: '',
    procedencia_secundaria: '',
    observaciones: '',
  },
])

// Opciones de calidad
const calidadOptions = [
  { label: 'Extra', value: 1 },
  { label: 'Primera', value: 2 },
  { label: 'Segunda', value: 3 },
  { label: 'Tercera', value: 4 },
  { label: 'Descarte', value: 5 },
]

// Productos filtrados
const productosFiltered = ref([])

// Computed para opciones
const mercadosOptions = computed(() => {
  const mercados = preciosStore.mercados || []
  // Filtrar por tipo de mercado (mayorista/minorista)
  return mercados.filter((m) => m.tipo?.toLowerCase() === tipoMercado.value)
})
const productosOptions = computed(() =>
  productosFiltered.value.length > 0 ? productosFiltered.value : preciosStore.productos || [],
)
const encuestadoresOptions = computed(() => preciosStore.encuestadores || [])

// Filtrar productos
const filterProductos = (val, update) => {
  update(() => {
    if (val === '') {
      productosFiltered.value = preciosStore.productos || []
    } else {
      const needle = val.toLowerCase()
      productosFiltered.value = (preciosStore.productos || []).filter(
        (p) => p.nombre?.toLowerCase().includes(needle) || p.codigo?.toLowerCase().includes(needle),
      )
    }
  })
}

// Cargar datos iniciales
const loadInitialData = async () => {
  try {
    loadingMercados.value = true
    loadingProductos.value = true
    loadingEncuestadores.value = true

    await Promise.all([
      preciosStore.fetchMercados(),
      preciosStore.fetchProductos(),
      preciosStore.fetchEncuestadores(),
    ])

    productosFiltered.value = preciosStore.productos || []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos iniciales',
      caption: error.message,
    })
  } finally {
    loadingMercados.value = false
    loadingProductos.value = false
    loadingEncuestadores.value = false
  }
}

// Validar formulario
const validarFormulario = () => {
  if (!formData.value.fecha) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar una fecha' })
    return false
  }

  if (!formData.value.mercado_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar un mercado' })
    return false
  }

  if (!formData.value.producto_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar un producto' })
    return false
  }

  if (!formData.value.encuestador_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar un encuestador' })
    return false
  }

  // Validar que al menos una muestra tenga precio
  const muestrasConPrecio = muestras.value.filter((m) => m.precio && m.precio > 0)
  if (muestrasConPrecio.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe ingresar al menos un precio válido' })
    return false
  }

  return true
}

// Guardar muestras
const guardarMuestras = async () => {
  if (!validarFormulario()) return

  $q.dialog({
    title: 'Confirmar',
    message: '¿Desea guardar las muestras registradas?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Guardar', color: 'primary', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    saving.value = true

    try {
      let guardadas = 0
      let errores = 0

      // Guardar solo las muestras con precio
      for (const muestra of muestras.value) {
        if (muestra.precio && muestra.precio > 0) {
          const data = {
            mercado_id: formData.value.mercado_id,
            producto_id: formData.value.producto_id,
            encuestador_id: formData.value.encuestador_id,
            fecha: formData.value.fecha,
            muestra_nro: muestra.muestra_nro,
            punto_nro: muestra.punto_nro,
            calidad: muestra.calidad,
            precio: parseFloat(muestra.precio),
            moneda: 'PEN',
            procedencia_principal: muestra.procedencia_principal || null,
            procedencia_secundaria: muestra.procedencia_secundaria || null,
            observaciones: muestra.observaciones || null,
          }

          const success = await preciosStore.createMuestra(data)
          if (success) {
            guardadas++
          } else {
            errores++
          }
        }
      }

      if (guardadas > 0) {
        $q.notify({
          type: 'positive',
          message: `Se guardaron ${guardadas} muestra(s) exitosamente`,
          icon: 'check_circle',
          position: 'top',
        })

        resetForm()
      }

      if (errores > 0) {
        $q.notify({
          type: 'warning',
          message: `${errores} muestra(s) no se pudieron guardar`,
          icon: 'warning',
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al guardar muestras',
        caption: error.message,
      })
    } finally {
      saving.value = false
    }
  })
}

// Resetear formulario
const resetForm = () => {
  formData.value = {
    fecha: new Date().toISOString().split('T')[0],
    mercado_id: null,
    producto_id: null,
    encuestador_id: null,
  }

  muestras.value = [
    {
      muestra_nro: 1,
      punto_nro: null,
      calidad: null,
      precio: null,
      procedencia_principal: '',
      procedencia_secundaria: '',
      observaciones: '',
    },
    {
      muestra_nro: 2,
      punto_nro: null,
      calidad: null,
      precio: null,
      procedencia_principal: '',
      procedencia_secundaria: '',
      observaciones: '',
    },
    {
      muestra_nro: 3,
      punto_nro: null,
      calidad: null,
      precio: null,
      procedencia_principal: '',
      procedencia_secundaria: '',
      observaciones: '',
    },
    {
      muestra_nro: 4,
      punto_nro: null,
      calidad: null,
      precio: null,
      procedencia_principal: '',
      procedencia_secundaria: '',
      observaciones: '',
    },
  ]
}

// Watch para limpiar mercado cuando cambie el tipo
watch(tipoMercado, () => {
  // Si el mercado seleccionado no pertenece al nuevo tipo, limpiarlo
  if (formData.value.mercado_id) {
    const mercadoActual = preciosStore.mercados?.find((m) => m.id === formData.value.mercado_id)
    if (mercadoActual && mercadoActual.tipo?.toLowerCase() !== tipoMercado.value) {
      formData.value.mercado_id = null
      $q.notify({
        type: 'info',
        message: `Cambiado a mercados ${tipoMercado.value}s`,
        caption: 'Seleccione un nuevo mercado',
        timeout: 2000,
      })
    }
  }
})

// Lifecycle
onMounted(() => {
  loadInitialData()
})
</script>

<style scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #4a7c39 100%);
}
</style>
