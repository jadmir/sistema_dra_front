<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="assessment" size="md" class="q-mr-sm" />
            Productividad de Encuestadores
          </div>
          <div class="text-subtitle2 text-grey-7">Monitoreo de actividad y desempeño</div>
        </div>
        <div class="col-12 col-md-6 text-right q-mt-sm q-mt-md-none">
          <q-btn
            label="Exportar Excel"
            icon="description"
            color="positive"
            @click="exportar"
            :loading="loading"
            class="q-mr-sm"
          />
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="primary"
            @click="actualizarReporte"
            :loading="loading"
          />
        </div>
      </div>

      <!-- Tabs -->
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="productividad" icon="trending_up" label="Productividad" />
        <q-tab name="dia" icon="today" label="Hoy" />
        <q-tab name="mes" icon="calendar_month" label="Mensual" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Panel: Productividad por Período -->
        <q-tab-panel name="productividad">
          <!-- Filtros -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="filtrosProductividad.fecha_inicio"
                    label="Fecha Inicio"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="filtrosProductividad.fecha_fin"
                    label="Fecha Fin"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="filtrosProductividad.encuestador_id"
                    :options="encuestadoresOptions"
                    option-value="id"
                    option-label="nombre"
                    emit-value
                    map-options
                    label="Encuestador (Todos)"
                    outlined
                    dense
                    clearable
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    label="Filtrar"
                    icon="search"
                    color="primary"
                    @click="consultarProductividad"
                    :loading="loadingProductividad"
                    class="full-width"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- KPIs Generales -->
          <div v-if="productividad" class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-primary">
                    {{ productividad.totales.total_encuestadores }}
                  </div>
                  <div class="text-caption text-grey-7">Encuestadores Activos</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-orange">
                    {{ productividad.totales.total_muestras }}
                  </div>
                  <div class="text-caption text-grey-7">Muestras Totales</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ productividad.totales.total_validadas }}
                  </div>
                  <div class="text-caption text-grey-7">Validadas</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-blue">
                    {{
                      Number(productividad.totales.promedio_muestras_por_encuestador || 0).toFixed(
                        2,
                      )
                    }}
                  </div>
                  <div class="text-caption text-grey-7">Promedio por Encuestador</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Tabla de Encuestadores -->
          <q-card flat bordered v-if="productividad">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="leaderboard" class="q-mr-sm" />
                Ranking de Productividad
              </div>
              <q-table
                :rows="rankingEncuestadores"
                :columns="columnasProductividad"
                row-key="encuestador_id"
                flat
                bordered
                :pagination="{ rowsPerPage: 20 }"
              >
                <template v-slot:body-cell-ranking="props">
                  <q-td :props="props">
                    <div class="text-h6">
                      <span v-if="props.rowIndex === 0">🥇</span>
                      <span v-else-if="props.rowIndex === 1">🥈</span>
                      <span v-else-if="props.rowIndex === 2">🥉</span>
                      <span v-else class="text-grey-7">{{ props.rowIndex + 1 }}</span>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-encuestador="props">
                  <q-td :props="props">
                    <div class="text-weight-medium">{{ props.row.nombre }}</div>
                    <div class="text-caption text-grey-7">
                      DNI: {{ props.row.dni }} | {{ props.row.celular }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-muestras="props">
                  <q-td :props="props">
                    <div class="text-h6 text-weight-bold text-primary">
                      {{ props.row.total_muestras }}
                    </div>
                    <div class="text-caption">
                      <q-badge
                        color="positive"
                        :label="`${props.row.muestras_validadas} validadas`"
                        class="q-mr-xs"
                      />
                      <q-badge
                        color="warning"
                        :label="`${props.row.muestras_pendientes} pendientes`"
                      />
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-promedio="props">
                  <q-td :props="props">
                    <div class="text-weight-bold">
                      {{ Number(props.row.promedio_muestras_por_dia || 0).toFixed(2) }}
                    </div>
                    <div class="text-caption text-grey-7">muestras/día</div>
                  </q-td>
                </template>

                <template v-slot:body-cell-alcance="props">
                  <q-td :props="props">
                    <div>
                      <q-icon name="store" color="orange" />
                      {{ props.row.mercados_visitados }} mercados
                    </div>
                    <div>
                      <q-icon name="inventory_2" color="blue" />
                      {{ props.row.productos_registrados }} productos
                    </div>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Panel: Actividad del Día -->
        <q-tab-panel name="dia">
          <!-- Filtro de Fecha -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input v-model="filtrosDia.fecha" label="Fecha" type="date" outlined dense />
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    label="Consultar"
                    icon="search"
                    color="primary"
                    @click="consultarDia"
                    :loading="loadingDia"
                    class="full-width"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Resumen del Día -->
          <div v-if="reporteDia" class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-card flat bordered class="bg-blue-1">
                <q-card-section>
                  <div class="text-h6 text-weight-bold">
                    📅 {{ formatearFecha(reporteDia.fecha) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-primary">
                    {{ reporteDia.resumen.total_encuestadores }}
                  </div>
                  <div class="text-caption text-grey-7">Encuestadores</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-orange">
                    {{ reporteDia.resumen.total_muestras }}
                  </div>
                  <div class="text-caption text-grey-7">Muestras</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ reporteDia.resumen.muestras_validadas }}
                  </div>
                  <div class="text-caption text-grey-7">Validadas</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-warning">
                    {{ reporteDia.resumen.muestras_pendientes }}
                  </div>
                  <div class="text-caption text-grey-7">Pendientes</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Detalle por Encuestador -->
          <q-card flat bordered v-if="reporteDia">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="person" class="q-mr-sm" />
                Detalle de Actividad
              </div>
              <div
                v-for="enc in reporteDia.encuestadores"
                :key="enc.encuestador_id"
                class="q-mb-md"
              >
                <q-card flat bordered>
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col-12 col-md-6">
                        <div class="text-h6 text-weight-bold">{{ enc.encuestador }}</div>
                        <div class="text-caption text-grey-7">DNI: {{ enc.dni }}</div>
                      </div>
                      <div class="col-12 col-md-6 text-right q-mt-sm q-mt-md-none">
                        <q-badge
                          color="primary"
                          :label="`${enc.total_muestras} muestras`"
                          class="q-mr-xs"
                        />
                        <q-badge color="positive" :label="`${enc.validadas} ✓`" class="q-mr-xs" />
                        <q-badge color="warning" :label="`${enc.pendientes} ⏳`" />
                      </div>
                    </div>
                    <q-separator class="q-my-sm" />
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="text-caption text-grey-7">
                          <q-icon name="schedule" />
                          {{ formatearHora(enc.primera_muestra) }} -
                          {{ formatearHora(enc.ultima_muestra) }}
                        </div>
                      </div>
                      <div class="col-12 col-md-6">
                        <div class="text-caption text-grey-7">
                          <q-icon name="store" color="orange" />
                          {{ enc.mercados_visitados }} mercados |
                          <q-icon name="inventory_2" color="blue" />
                          {{ enc.productos_registrados }} productos
                        </div>
                      </div>
                    </div>

                    <!-- Detalle de Mercados -->
                    <div v-if="reporteDia.detalle_mercados[enc.encuestador_id]" class="q-mt-md">
                      <div class="text-subtitle2 text-grey-8 q-mb-xs">Mercados visitados:</div>
                      <div
                        v-for="mercado in reporteDia.detalle_mercados[enc.encuestador_id]"
                        :key="mercado.mercado_id"
                        class="q-ml-md"
                      >
                        <q-chip
                          :color="mercado.tipo_mercado === 'MAYORISTA' ? 'orange' : 'blue'"
                          text-color="white"
                          size="sm"
                        >
                          {{ mercado.mercado }} ({{ mercado.muestras_en_mercado }} muestras)
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Panel: Reporte Mensual -->
        <q-tab-panel name="mes">
          <!-- Filtros -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="filtrosMes.año"
                    :options="añosOptions"
                    label="Año"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="filtrosMes.mes"
                    :options="mesesOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    label="Mes"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    label="Consultar"
                    icon="search"
                    color="primary"
                    @click="consultarMes"
                    :loading="loadingMes"
                    class="full-width"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Resumen Mensual -->
          <div v-if="reporteMes" class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-card flat bordered class="bg-blue-1">
                <q-card-section>
                  <div class="text-h6 text-weight-bold">
                    📊 {{ reporteMes.periodo.mes_nombre }} {{ reporteMes.periodo.año }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ reporteMes.periodo.fecha_inicio }} al {{ reporteMes.periodo.fecha_fin }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-primary">
                    {{ reporteMes.resumen_mes.total_encuestadores }}
                  </div>
                  <div class="text-caption text-grey-7">Encuestadores</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-orange">
                    {{ reporteMes.resumen_mes.total_muestras }}
                  </div>
                  <div class="text-caption text-grey-7">Muestras Totales</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ reporteMes.resumen_mes.muestras_validadas }}
                  </div>
                  <div class="text-caption text-grey-7">Validadas</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h6 text-weight-bold text-blue">
                    {{
                      Number(reporteMes.resumen_mes.promedio_muestras_por_encuestador || 0).toFixed(
                        2,
                      )
                    }}
                  </div>
                  <div class="text-caption text-grey-7">Promedio por Encuestador</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Tabla de Encuestadores del Mes -->
          <q-card flat bordered v-if="reporteMes" class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="people" class="q-mr-sm" />
                Productividad Mensual
              </div>
              <q-table
                :rows="reporteMes.encuestadores"
                :columns="columnasMensual"
                row-key="encuestador_id"
                flat
                bordered
                :pagination="{ rowsPerPage: 20 }"
              />
            </q-card-section>
          </q-card>

          <!-- Calendario -->
          <q-card flat bordered v-if="reporteMes && reporteMes.calendario">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="calendar_month" class="q-mr-sm" />
                Calendario de Actividad
              </div>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="(datos, fecha) in reporteMes.calendario"
                  :key="fecha"
                  class="col-12 col-sm-6 col-md-3"
                >
                  <q-card flat bordered :class="getColorDia(datos.total_muestras)">
                    <q-card-section>
                      <div class="text-subtitle2 text-weight-bold">
                        {{ formatearFechaCorta(fecha) }}
                      </div>
                      <div class="text-caption">📋 {{ datos.total_muestras }} muestras</div>
                      <div class="text-caption text-grey-7">
                        👥 {{ datos.encuestadores_activos }} encuestadores
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReporteEncuestadoresStore } from 'src/stores/reporteEncuestadores'
import { usePreciosStore } from 'src/stores/precios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const reporteStore = useReporteEncuestadoresStore()
const preciosStore = usePreciosStore()

// Estado
const tab = ref('productividad')
const filtrosProductividad = ref({
  fecha_inicio: null,
  fecha_fin: null,
  encuestador_id: null,
})
const filtrosDia = ref({
  fecha: null,
})
const filtrosMes = ref({
  año: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
})

// Computed
const productividad = computed(() => reporteStore.productividad)
const reporteDia = computed(() => reporteStore.reporteDia)
const reporteMes = computed(() => reporteStore.reporteMes)
const rankingEncuestadores = computed(() => reporteStore.rankingEncuestadores)

const loadingProductividad = computed(() => reporteStore.loadingProductividad)
const loadingDia = computed(() => reporteStore.loadingDia)
const loadingMes = computed(() => reporteStore.loadingMes)
const loading = computed(() => loadingProductividad.value || loadingDia.value || loadingMes.value)

const encuestadoresOptions = computed(() => preciosStore.encuestadores || [])

const añosOptions = computed(() => {
  const añoActual = new Date().getFullYear()
  return [añoActual - 1, añoActual, añoActual + 1]
})

const mesesOptions = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

// Columnas de las tablas
const columnasProductividad = [
  { name: 'ranking', label: '#', align: 'center', field: 'ranking' },
  { name: 'encuestador', label: 'Encuestador', align: 'left', field: 'nombre' },
  { name: 'muestras', label: 'Muestras', align: 'center' },
  { name: 'dias_trabajados', label: 'Días', align: 'center', field: 'dias_trabajados' },
  { name: 'promedio', label: 'Promedio', align: 'center' },
  { name: 'alcance', label: 'Alcance', align: 'center' },
]

const columnasMensual = [
  { name: 'nombre', label: 'Encuestador', align: 'left', field: 'nombre' },
  { name: 'total_muestras', label: 'Muestras', align: 'center', field: 'total_muestras' },
  { name: 'validadas', label: 'Validadas', align: 'center', field: 'validadas' },
  { name: 'pendientes', label: 'Pendientes', align: 'center', field: 'pendientes' },
  { name: 'dias_trabajados', label: 'Días', align: 'center', field: 'dias_trabajados' },
  { name: 'promedio_por_dia', label: 'Promedio/Día', align: 'center', field: 'promedio_por_dia' },
]

// Métodos
async function consultarProductividad() {
  try {
    await reporteStore.fetchProductividad(filtrosProductividad.value)
    $q.notify({
      type: 'positive',
      message: 'Reporte de productividad actualizado',
      icon: 'check_circle',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar productividad',
      caption: error.message,
    })
  }
}

async function consultarDia() {
  try {
    await reporteStore.fetchReporteDia(filtrosDia.value.fecha)
    $q.notify({
      type: 'positive',
      message: 'Reporte del día actualizado',
      icon: 'check_circle',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar reporte del día',
      caption: error.message,
    })
  }
}

async function consultarMes() {
  try {
    await reporteStore.fetchReporteMes(filtrosMes.value.año, filtrosMes.value.mes)
    $q.notify({
      type: 'positive',
      message: 'Reporte mensual actualizado',
      icon: 'check_circle',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar reporte mensual',
      caption: error.message,
    })
  }
}

function actualizarReporte() {
  if (tab.value === 'productividad') {
    consultarProductividad()
  } else if (tab.value === 'dia') {
    consultarDia()
  } else if (tab.value === 'mes') {
    consultarMes()
  }
}

async function exportar() {
  try {
    await reporteStore.exportarExcel(filtrosProductividad.value)
    $q.notify({
      type: 'positive',
      message: 'Reporte exportado correctamente',
      icon: 'download',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar reporte',
      caption: error.message,
    })
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatearFechaCorta(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatearHora(fechaHora) {
  if (!fechaHora) return ''
  const date = new Date(fechaHora)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function getColorDia(totalMuestras) {
  if (totalMuestras > 20) return 'bg-positive-1'
  if (totalMuestras >= 10) return 'bg-warning-1'
  if (totalMuestras > 0) return 'bg-negative-1'
  return 'bg-grey-2'
}

// Lifecycle
onMounted(async () => {
  // Cargar encuestadores para el filtro
  await preciosStore.fetchEncuestadores()

  // Cargar reporte inicial (productividad del mes actual)
  await consultarProductividad()
})
</script>

<style scoped>
.q-card {
  transition: all 0.3s;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
