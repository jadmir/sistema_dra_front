<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="eco" size="md" class="q-mr-sm" />
            Reportes de Fertilizantes (F-4)
          </div>
          <div class="text-subtitle2 text-grey-7">
            Consulta y exporta reportes de precios de fertilizantes y abonos
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="filter_list" />
            Filtros de Búsqueda
          </div>
          <div class="row q-col-gutter-md">
            <!-- Fila 1: Año y Mes (más prominentes) -->
            <div class="col-12">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-select
                    v-model.number="filtros.ano"
                    :options="anosOptions"
                    label="Año *"
                    outlined
                    dense
                    emit-value
                    map-options
                    :rules="[(val) => !!val || 'Año es requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    v-model.number="filtros.mes"
                    :options="mesesOptions"
                    label="Mes *"
                    outlined
                    dense
                    clearable
                    emit-value
                    map-options
                    :rules="[(val) => val !== null || 'Mes es requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_month" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <q-btn
                    label="Consultar"
                    icon="search"
                    color="primary"
                    @click="consultarPrecios()"
                    class="full-width"
                    size="md"
                    :loading="loading"
                    :disable="!filtros.ano || filtros.mes === null"
                  />
                </div>
              </div>
            </div>

            <!-- Fila 2: Filtros adicionales -->
            <div class="col-12">
              <q-separator class="q-my-md" />
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input v-model="filtros.region" label="Región" outlined dense clearable>
                    <template v-slot:prepend>
                      <q-icon name="location_on" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="filtros.provincia" label="Provincia" outlined dense clearable>
                    <template v-slot:prepend>
                      <q-icon name="place" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="filtros.tipo"
                    :options="tiposOptions"
                    label="Categoría"
                    outlined
                    dense
                    clearable
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="filtros.producto" label="Producto" outlined dense clearable>
                    <template v-slot:prepend>
                      <q-icon name="eco" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Botones de Exportación -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-btn
                label="Exportar a Excel"
                icon="description"
                color="positive"
                @click="exportarExcel()"
                class="full-width"
                :loading="exportandoExcel"
                :disable="!hayDatos"
              >
                <q-tooltip v-if="!hayDatos">Consulta primero los datos para exportar</q-tooltip>
              </q-btn>
            </div>
            <div class="col-12 col-md-6">
              <q-btn
                label="Exportar a PDF"
                icon="picture_as_pdf"
                color="red"
                @click="exportarPDF()"
                class="full-width"
                :loading="exportandoPDF"
                :disable="!hayDatos"
              >
                <q-tooltip v-if="!hayDatos">Consulta primero los datos para exportar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Resumen -->
      <q-card v-if="meta" flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="summarize" />
            Resumen General
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-primary">{{ meta.total }}</div>
                  <div class="text-caption text-grey-7">Total Registros</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-positive">{{ meta.productos_distintos }}</div>
                  <div class="text-caption text-grey-7">Productos Distintos</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h5 text-orange">
                    S/ {{ Number(meta.precio_promedio_general || 0).toFixed(2) }}
                  </div>
                  <div class="text-caption text-grey-7">Precio Promedio</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-caption text-grey-7">Rango de Precios</div>
                  <div class="text-body2">
                    S/ {{ Number(meta.precio_minimo_general || 0).toFixed(2) }} - S/
                    {{ Number(meta.precio_maximo_general || 0).toFixed(2) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Datos -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="table_chart" />
            Detalle de Precios
          </div>
          <q-table
            :rows="datos"
            :columns="columns"
            :loading="loading"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[10, 25, 50, 100]"
          >
            <template v-slot:body-cell-periodo="props">
              <q-td :props="props">
                <q-badge color="blue-grey" :label="`${props.row.mes_nombre} ${props.row.ano}`" />
              </q-td>
            </template>
            <template v-slot:body-cell-categoria="props">
              <q-td :props="props">
                <q-chip
                  :color="getCategoriaColor(props.row.producto_categoria)"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.producto_categoria }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-producto="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.producto_nombre }}</div>
                <div class="text-caption text-grey-7" v-if="props.row.envase_presentacion">
                  {{ props.row.envase_presentacion }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-precio_minimo="props">
              <q-td :props="props">
                <div class="text-negative">S/ {{ Number(props.row.precio_minimo).toFixed(2) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-precio_promedio="props">
              <q-td :props="props">
                <div class="text-weight-bold text-primary">
                  S/ {{ Number(props.row.precio_promedio).toFixed(2) }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-precio_maximo="props">
              <q-td :props="props">
                <div class="text-positive">S/ {{ Number(props.row.precio_maximo).toFixed(2) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-observaciones="props">
              <q-td :props="props">
                <div class="text-caption" style="max-width: 200px">
                  {{ props.row.observaciones || '—' }}
                </div>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-gutter-sm q-pa-lg">
                <q-icon size="2em" name="info" />
                <span>No hay datos disponibles. Usa los filtros para consultar.</span>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useReportesSIEA } from 'src/composables/useReportesSIEA'

// Usar composable con nombre de formulario
const {
  loading,
  exportandoExcel,
  exportandoPDF,
  datos,
  meta,
  filtros,
  consultarPrecios,
  exportarExcel,
  exportarPDF,
} = useReportesSIEA('fertilizantes')

// Categorías F-4: Fertilizantes y Abonos
const tiposOptions = ['NITROGENADOS', 'FOSFATADOS', 'POTÁSICOS', 'COMPUESTOS', 'ORGÁNICOS']

// Generar opciones de años (últimos 5 años + próximos 2)
const currentYear = new Date().getFullYear()
const anosOptions = []
for (let i = currentYear + 2; i >= currentYear - 5; i--) {
  anosOptions.push({ label: i.toString(), value: i })
}

const mesesOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]

// Columnas de la tabla
const columns = [
  {
    name: 'region',
    label: 'Región',
    align: 'left',
    field: 'region',
    sortable: true,
  },
  {
    name: 'provincia',
    label: 'Provincia',
    align: 'left',
    field: 'provincia',
    sortable: true,
  },
  {
    name: 'periodo',
    label: 'Período',
    align: 'center',
    field: 'mes_nombre',
  },
  {
    name: 'categoria',
    label: 'Categoría',
    align: 'center',
    field: 'producto_categoria',
  },
  {
    name: 'producto',
    label: 'Producto',
    align: 'left',
    field: 'producto_nombre',
  },
  {
    name: 'precio_minimo',
    label: 'Precio Mínimo',
    align: 'right',
    field: 'precio_minimo',
    sortable: true,
  },
  {
    name: 'precio_promedio',
    label: 'Precio Promedio',
    align: 'right',
    field: 'precio_promedio',
    sortable: true,
  },
  {
    name: 'precio_maximo',
    label: 'Precio Máximo',
    align: 'right',
    field: 'precio_maximo',
    sortable: true,
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    align: 'left',
    field: 'observaciones',
  },
]

const hayDatos = computed(() => datos.value.length > 0)

// Función para asignar color a cada categoría
function getCategoriaColor(categoria) {
  const colores = {
    NITROGENADOS: 'blue',
    FOSFATADOS: 'purple',
    POTÁSICOS: 'orange',
    COMPUESTOS: 'green',
    ORGÁNICOS: 'brown',
  }
  return colores[categoria] || 'grey'
}
</script>

<style scoped>
.q-card {
  transition: all 0.3s;
}
</style>
