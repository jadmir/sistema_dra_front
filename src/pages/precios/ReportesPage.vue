<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col-12 col-md">
        <div class="text-h5 text-h6-mobile text-primary">
          <q-icon name="analytics" size="md" class="q-mr-sm" />
          Reporte Comparativo de Precios
        </div>
        <div class="text-caption text-grey-7">
          Análisis comparativo entre precios mayoristas y minoristas
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-sm q-mt-md-none">
        <div class="row q-gutter-sm justify-center justify-md-end">
          <q-btn
            :label="$q.screen.gt.xs ? 'Histórico' : ''"
            icon="timeline"
            color="info"
            outline
            @click="abrirHistorico"
            :size="$q.screen.gt.xs ? 'md' : 'sm'"
          >
            <q-tooltip v-if="!$q.screen.gt.xs">Histórico</q-tooltip>
          </q-btn>
          <q-btn
            :label="$q.screen.gt.xs ? 'Resumen Muestras' : ''"
            icon="summarize"
            color="secondary"
            outline
            @click="abrirResumenMuestras"
            :size="$q.screen.gt.xs ? 'md' : 'sm'"
          >
            <q-tooltip v-if="!$q.screen.gt.xs">Resumen Muestras</q-tooltip>
          </q-btn>
          <q-btn
            :label="$q.screen.gt.xs ? 'Generar Reporte' : ''"
            icon="refresh"
            color="primary"
            unelevated
            @click="generarReporte"
            :loading="generando"
            :size="$q.screen.gt.xs ? 'md' : 'sm'"
          >
            <q-tooltip v-if="!$q.screen.gt.xs">Generar Reporte</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Filtros y controles -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Filtros y Configuración</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <!-- Fecha -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fecha"
              type="date"
              label="Fecha del Reporte"
              outlined
              dense
              :max="maxDate"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Producto -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.producto_id"
              :options="productosOptions"
              option-value="id"
              label="Filtrar por Producto"
              outlined
              dense
              clearable
              emit-value
              map-options
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

          <!-- Ubicación -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.ubicacion_id"
              :options="ubicacionesOptions"
              option-value="id"
              label="Filtrar por Ubicación"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="primary" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.departamento }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.provincia">{{
                      scope.opt.provincia
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.departamento }}</span>
              </template>
            </q-select>
          </div>

          <!-- Botón consultar -->
          <div class="col-12 col-md-2">
            <q-btn
              label="Consultar"
              icon="search"
              color="positive"
              unelevated
              class="full-width"
              @click="consultarReporte"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen del reporte -->
    <q-card v-if="reporte" flat bordered class="q-mb-md">
      <q-card-section class="bg-gradient-green text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">Reporte del {{ reporte.fecha }}</div>
          </div>
          <div class="col-auto">
            <q-badge color="white" text-color="primary" :label="`${totalProductos} productos`" />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- KPI Cards -->
          <div class="col-6 col-sm-6 col-md-3">
            <q-card flat bordered class="kpi-card">
              <q-card-section class="text-center q-pa-sm q-pa-md-md">
                <div class="text-h4 text-h5-mobile text-primary">{{ totalProductos }}</div>
                <div class="text-caption text-grey-7">Productos Analizados</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-6 col-md-3">
            <q-card flat bordered class="kpi-card">
              <q-card-section class="text-center q-pa-sm q-pa-md-md">
                <div class="text-h4 text-h5-mobile text-orange">
                  {{ promedioVariacion.toFixed(1) }}%
                </div>
                <div class="text-caption text-grey-7">Variación Promedio</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-6 col-md-3">
            <q-card flat bordered class="kpi-card">
              <q-card-section class="text-center q-pa-sm q-pa-md-md">
                <div class="text-h4 text-h5-mobile text-green">
                  {{ mayorVariacion.toFixed(1) }}%
                </div>
                <div class="text-caption text-grey-7">Mayor Variación</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6 col-sm-6 col-md-3">
            <q-card flat bordered class="kpi-card">
              <q-card-section class="text-center q-pa-sm q-pa-md-md">
                <div class="text-h4 text-h5-mobile text-blue">{{ menorVariacion.toFixed(1) }}%</div>
                <div class="text-caption text-grey-7">Menor Variación</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Mensaje cuando no hay datos -->
    <q-card v-if="!reporte && !loading" flat bordered>
      <q-card-section class="text-center text-grey-7 q-pa-xl">
        <q-icon name="analytics" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">No hay reporte disponible</div>
        <div class="text-caption">
          Seleccione una fecha y haga clic en "Consultar" o "Generar Reporte"
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla comparativa -->
    <q-card v-if="reporte && reporteData.length > 0" flat bordered>
      <q-card-section class="bg-primary text-white row items-center">
        <div class="col">
          <div class="text-h6">Comparativa Mayorista vs Minorista</div>
        </div>
        <div class="col-auto">
          <q-btn
            label="Exportar PDF"
            icon="picture_as_pdf"
            color="white"
            text-color="primary"
            outline
            size="sm"
            @click="exportarPDF"
            class="q-mr-sm"
          />
          <q-btn
            label="Exportar Excel"
            icon="description"
            color="white"
            text-color="primary"
            outline
            size="sm"
            @click="exportarExcel"
          />
        </div>
      </q-card-section>

      <q-table
        :rows="reporteData"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 50 }"
        class="sticky-header-table"
      >
        <template v-slot:body-cell-producto="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.producto?.nombre }}</div>
            <div class="text-caption text-grey-7">
              <q-badge color="blue-grey-4" :label="props.row.producto?.codigo" class="q-mr-xs" />
              <span v-if="props.row.producto?.unidad_medida">
                {{ props.row.producto?.unidad_medida }}
              </span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-mayorista="props">
          <q-td :props="props">
            <div class="text-h6 text-orange text-weight-bold">
              S/ {{ Number(props.row.precio_mayorista_promedio).toFixed(2) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ Number(props.row.precio_mayorista_minimo).toFixed(2) }} -
              {{ Number(props.row.precio_mayorista_maximo).toFixed(2) }}
            </div>
            <q-badge
              color="orange"
              :label="`${props.row.num_muestras_mayoristas} muestras`"
              class="q-mt-xs"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-minorista="props">
          <q-td :props="props">
            <div class="text-h6 text-blue text-weight-bold">
              S/ {{ Number(props.row.precio_minorista_promedio).toFixed(2) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ Number(props.row.precio_minorista_minimo).toFixed(2) }} -
              {{ Number(props.row.precio_minorista_maximo).toFixed(2) }}
            </div>
            <q-badge
              color="blue"
              :label="`${props.row.num_muestras_minoristas} muestras`"
              class="q-mt-xs"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-variacion="props">
          <q-td :props="props">
            <div class="row items-center justify-center">
              <q-icon
                :name="getVariacionIcon(props.row.variacion_porcentual)"
                :color="getVariacionColor(props.row.variacion_porcentual)"
                size="sm"
                class="q-mr-xs"
              />
              <div
                class="text-h6 text-weight-bold"
                :class="`text-${getVariacionColor(props.row.variacion_porcentual)}`"
              >
                {{ props.row.variacion_porcentual > 0 ? '+' : ''
                }}{{ Number(props.row.variacion_porcentual).toFixed(2) }}%
              </div>
            </div>
            <q-badge
              :color="getVariacionColor(props.row.variacion_porcentual)"
              :label="getVariacionNivel(props.row.variacion_porcentual)"
              class="q-mt-xs"
            />
            <!-- Advertencias -->
            <div v-if="props.row.advertencias && props.row.advertencias.length > 0" class="q-mt-sm">
              <q-icon name="warning" color="warning" size="xs">
                <q-tooltip max-width="300px" class="bg-warning text-black">
                  <div v-for="(adv, idx) in props.row.advertencias" :key="idx" class="q-mb-xs">
                    • {{ adv }}
                  </div>
                </q-tooltip>
              </q-icon>
              <q-badge
                v-if="!props.row.datos_completos"
                color="warning"
                text-color="black"
                label="Datos Incompletos"
                class="q-ml-xs"
              />
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-mercados="props">
          <q-td :props="props">
            <div>
              <q-badge
                color="orange"
                :label="`${props.row.num_muestras_mayoristas || 0} Muestras Mayoristas`"
                class="q-mb-xs"
              />
            </div>
            <div>
              <q-badge
                color="blue"
                :label="`${props.row.num_muestras_minoristas || 0} Muestras Minoristas`"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Leyenda -->
    <q-card v-if="reporte && reporteData.length > 0" flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle2 text-grey-8 q-mb-sm">
          <q-icon name="info" color="primary" class="q-mr-xs" />
          Leyenda de Variación
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-auto">
            <q-badge color="positive" label="< 25%" />
            <span class="text-caption text-grey-7 q-ml-xs">Variación Normal</span>
          </div>
          <div class="col-auto">
            <q-badge color="warning" label="25% - 40%" />
            <span class="text-caption text-grey-7 q-ml-xs">Variación Moderada</span>
          </div>
          <div class="col-auto">
            <q-badge color="negative" label="> 40%" />
            <span class="text-caption text-grey-7 q-ml-xs">Variación Alta</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog: Resumen de Muestras -->
    <q-dialog v-model="dialogResumen" maximized>
      <q-card>
        <q-card-section class="bg-secondary text-white row items-center">
          <q-icon name="summarize" size="md" class="q-mr-sm" />
          <div class="text-h6">Resumen de Muestras por Producto y Mercado</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filtrosResumen.fecha"
                type="date"
                label="Fecha"
                outlined
                dense
                :max="maxDate"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="filtrosResumen.producto_id"
                :options="productosOptions"
                option-value="id"
                label="Filtrar por Producto"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
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
            <div class="col-12 col-md-2">
              <q-btn
                label="Consultar"
                icon="search"
                color="secondary"
                unelevated
                class="full-width"
                @click="consultarResumen"
                :loading="loadingResumen"
              />
            </div>
          </div>

          <q-table
            v-if="resumenData && resumenData.length > 0"
            :rows="resumenData"
            :columns="columnsResumen"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 20 }"
          >
            <template v-slot:body-cell-producto="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.producto }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-tipo_mercado="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.tipo_mercado === 'MAYORISTA' ? 'orange' : 'blue'"
                  :label="props.row.tipo_mercado"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-muestras="props">
              <q-td :props="props">
                <div class="text-center">
                  <div class="text-h6 text-primary">{{ props.row.total_muestras }}</div>
                  <div class="text-caption text-grey-7">
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
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-precios="props">
              <q-td :props="props">
                <div class="text-center">
                  <div class="text-h6 text-weight-bold">
                    S/ {{ Number(props.row.precio_promedio).toFixed(2) }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ Number(props.row.precio_minimo).toFixed(2) }} -
                    {{ Number(props.row.precio_maximo).toFixed(2) }}
                  </div>
                </div>
              </q-td>
            </template>
          </q-table>

          <q-card v-else flat bordered class="q-mt-md">
            <q-card-section class="text-center text-grey-7 q-pa-xl">
              <q-icon name="summarize" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No hay datos disponibles</div>
              <div class="text-caption">Seleccione una fecha y haga clic en "Consultar"</div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Histórico de Precios -->
    <q-dialog v-model="dialogHistorico" maximized>
      <q-card>
        <q-card-section class="bg-info text-white row items-center">
          <q-icon name="timeline" size="md" class="q-mr-sm" />
          <div class="text-h6">Histórico de Precios por Producto</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="filtrosHistorico.producto_id"
                :options="productosOptions"
                option-value="id"
                label="Seleccionar Producto *"
                outlined
                dense
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="inventory_2" />
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
            <div class="col-12 col-md-2">
              <q-input
                v-model="filtrosHistorico.fecha_inicio"
                type="date"
                label="Desde"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                v-model="filtrosHistorico.fecha_fin"
                type="date"
                label="Hasta"
                outlined
                dense
                :max="maxDate"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                label="Consultar"
                icon="search"
                color="info"
                unelevated
                class="full-width"
                @click="consultarHistorico"
                :loading="loadingHistorico"
                :disable="!filtrosHistorico.producto_id"
              />
            </div>
          </div>

          <!-- Información del producto -->
          <q-card v-if="historicoData && historicoData.producto" flat bordered class="q-mb-md">
            <q-card-section class="bg-gradient-green text-white">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">{{ historicoData.producto.nombre }}</div>
                  <div class="text-caption">
                    {{ historicoData.producto.codigo }} | {{ historicoData.producto.unidad_medida }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-badge
                    color="white"
                    text-color="primary"
                    :label="`Período: ${historicoData.periodo?.inicio} al ${historicoData.periodo?.fin}`"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tabla histórico -->
          <q-table
            v-if="historicoData && historicoData.historico && historicoData.historico.length > 0"
            :rows="historicoData.historico"
            :columns="columnsHistorico"
            row-key="fecha"
            flat
            bordered
            :pagination="{ rowsPerPage: 31 }"
          >
            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                <div class="text-weight-medium">
                  {{
                    new Date(props.row.fecha).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-tipo_mercado="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.tipo_mercado === 'MAYORISTA' ? 'orange' : 'blue'"
                  :label="props.row.tipo_mercado"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-precio="props">
              <q-td :props="props">
                <div class="text-center">
                  <div class="text-h6 text-weight-bold">
                    S/ {{ Number(props.row.precio_promedio).toFixed(2) }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ Number(props.row.precio_minimo).toFixed(2) }} -
                    {{ Number(props.row.precio_maximo).toFixed(2) }}
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-muestras="props">
              <q-td :props="props">
                <div class="text-center">
                  <q-badge color="primary" :label="`${props.row.num_muestras} muestras`" />
                </div>
              </q-td>
            </template>
          </q-table>

          <q-card v-else flat bordered class="q-mt-md">
            <q-card-section class="text-center text-grey-7 q-pa-xl">
              <q-icon name="timeline" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No hay datos disponibles</div>
              <div class="text-caption">Seleccione un producto y haga clic en "Consultar"</div>
            </q-card-section>
          </q-card>
        </q-card-section>
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
const generando = ref(false)
const dialogResumen = ref(false)
const loadingResumen = ref(false)
const dialogHistorico = ref(false)
const loadingHistorico = ref(false)

// Fecha máxima (hoy)
const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Fecha mínima (30 días atrás)
const minDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
})

// Filtros
const filtros = ref({
  fecha: new Date().toISOString().split('T')[0],
  producto_id: null,
  ubicacion_id: null,
})

// Filtros para resumen de muestras
const filtrosResumen = ref({
  fecha: new Date().toISOString().split('T')[0],
  producto_id: null,
})

// Filtros para histórico
const filtrosHistorico = ref({
  producto_id: null,
  fecha_inicio: minDate.value,
  fecha_fin: maxDate.value,
})

// Columnas de la tabla comparativa
const columns = [
  { name: 'producto', label: 'Producto', align: 'left' },
  { name: 'mayorista', label: 'Precio Mayorista', align: 'center' },
  { name: 'minorista', label: 'Precio Minorista', align: 'center' },
  { name: 'variacion', label: 'Variación', align: 'center' },
  { name: 'mercados', label: 'Mercados', align: 'center' },
]

// Columnas para resumen de muestras
const columnsResumen = [
  { name: 'producto', label: 'Producto', align: 'left', field: 'producto' },
  { name: 'tipo_mercado', label: 'Tipo Mercado', align: 'center', field: 'tipo_mercado' },
  { name: 'muestras', label: 'Muestras', align: 'center' },
  { name: 'precios', label: 'Precios (Promedio)', align: 'center' },
]

// Columnas para histórico
const columnsHistorico = [
  { name: 'fecha', label: 'Fecha', align: 'left', field: 'fecha' },
  { name: 'tipo_mercado', label: 'Tipo Mercado', align: 'center', field: 'tipo_mercado' },
  { name: 'precio', label: 'Precio Promedio', align: 'center' },
  { name: 'muestras', label: 'Muestras', align: 'center' },
]

// Computed
const reporte = computed(() => preciosStore.reporteComparativo)
const reporteData = computed(() => {
  if (!reporte.value?.reportes) return []

  // Transformar los datos del backend al formato esperado
  return reporte.value.reportes.map((r) => ({
    id: r.id,
    producto_id: r.producto_id,
    producto: r.producto, // Objeto completo
    precio_mayorista_promedio: parseFloat(r.precio_mayorista_promedio) || 0,
    precio_mayorista_minimo: parseFloat(r.precio_mayorista_minimo) || 0,
    precio_mayorista_maximo: parseFloat(r.precio_mayorista_maximo) || 0,
    precio_minorista_promedio: parseFloat(r.precio_minorista_promedio) || 0,
    precio_minorista_minimo: parseFloat(r.precio_minorista_minimo) || 0,
    precio_minorista_maximo: parseFloat(r.precio_minorista_maximo) || 0,
    variacion_porcentual: parseFloat(r.variacion_porcentual) || 0,
    num_muestras_mayoristas: r.num_muestras_mayoristas || 0,
    num_muestras_minoristas: r.num_muestras_minoristas || 0,
    datos_completos: r.datos_completos,
    advertencias: r.advertencias || [],
    ubicacion: r.ubicacion,
  }))
})
const totalProductos = computed(() => reporte.value?.total_productos || 0)

const promedioVariacion = computed(() => {
  if (reporteData.value.length === 0) return 0
  const sum = reporteData.value.reduce((acc, r) => acc + r.variacion_porcentual, 0)
  return sum / reporteData.value.length
})

const mayorVariacion = computed(() => {
  if (reporteData.value.length === 0) return 0
  return Math.max(...reporteData.value.map((r) => r.variacion_porcentual))
})

const menorVariacion = computed(() => {
  if (reporteData.value.length === 0) return 0
  return Math.min(...reporteData.value.map((r) => r.variacion_porcentual))
})

const productosOptions = computed(() => preciosStore.productos || [])
const ubicacionesOptions = computed(() => preciosStore.ubicaciones || [])

// Computed para resumen de muestras
const resumen = computed(() => preciosStore.resumenMuestras)
const resumenData = computed(() => {
  if (!resumen.value || !resumen.value.resumen) return []
  return resumen.value.resumen
})

// Computed para histórico
const historico = computed(() => preciosStore.reporteHistorico)
const historicoData = computed(() => historico.value)

// Funciones de utilidad
const getVariacionColor = (variacion) => {
  const val = Math.abs(variacion)
  if (val < 25) return 'positive'
  if (val >= 25 && val <= 40) return 'warning'
  return 'negative'
}

const getVariacionIcon = (variacion) => {
  const val = Math.abs(variacion)
  if (val < 25) return 'check_circle'
  if (val >= 25 && val <= 40) return 'warning'
  return 'error'
}

const getVariacionNivel = (variacion) => {
  const val = Math.abs(variacion)
  if (val < 25) return 'Normal'
  if (val >= 25 && val <= 40) return 'Moderada'
  return 'Alta'
}

// Consultar reporte existente
const consultarReporte = async () => {
  loading.value = true
  try {
    await preciosStore.fetchReporteComparativo({
      fecha: filtros.value.fecha,
      producto_id: filtros.value.producto_id,
      ubicacion_id: filtros.value.ubicacion_id,
    })

    if (!reporte.value || reporteData.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No se encontró reporte para los criterios seleccionados',
        caption: 'Intente generar un nuevo reporte',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar reporte',
      caption: error.message,
    })
  } finally {
    loading.value = false
  }
}

// Generar nuevo reporte
const generarReporte = async () => {
  $q.dialog({
    title: 'Generar Reporte',
    message: `¿Desea generar un nuevo reporte comparativo para la fecha ${filtros.value.fecha}?`,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Generar', color: 'primary', unelevated: true },
  }).onOk(async () => {
    generando.value = true
    try {
      const result = await preciosStore.generarReporteComparativo({
        fecha: filtros.value.fecha,
      })

      if (result.success) {
        $q.notify({
          type: 'positive',
          message: result.message || 'Reporte generado exitosamente',
          icon: 'check_circle',
          caption: `${result.productos_procesados || 0} productos procesados, ${result.reportes_creados || 0} reportes creados`,
        })

        // El reporte ya fue consultado automáticamente en el store
      } else {
        $q.notify({
          type: 'negative',
          message: result.message || 'Error al generar reporte',
          icon: 'error',
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al generar reporte',
        caption: error.message,
      })
    } finally {
      generando.value = false
    }
  })
}

// Exportar a PDF
const exportarPDF = () => {
  $q.notify({
    type: 'info',
    message: 'Exportación a PDF en desarrollo',
    caption: 'Próximamente disponible',
  })
}

// Exportar a Excel
const exportarExcel = () => {
  $q.notify({
    type: 'info',
    message: 'Exportación a Excel en desarrollo',
    caption: 'Próximamente disponible',
  })
}

// Abrir dialog de resumen de muestras
const abrirResumenMuestras = () => {
  dialogResumen.value = true
  // Consultar automáticamente con la fecha actual
  consultarResumen()
}

// Consultar resumen de muestras
const consultarResumen = async () => {
  loadingResumen.value = true
  try {
    await preciosStore.fetchResumenMuestras({
      fecha: filtrosResumen.value.fecha,
      producto_id: filtrosResumen.value.producto_id,
    })

    if (!resumenData.value || resumenData.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No se encontraron muestras para los criterios seleccionados',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar resumen de muestras',
      caption: error.message,
    })
  } finally {
    loadingResumen.value = false
  }
}

// Abrir dialog de histórico
const abrirHistorico = () => {
  dialogHistorico.value = true
}

// Consultar histórico de precios
const consultarHistorico = async () => {
  if (!filtrosHistorico.value.producto_id) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un producto',
    })
    return
  }

  loadingHistorico.value = true
  try {
    await preciosStore.fetchReporteHistorico(filtrosHistorico.value.producto_id, {
      fecha_inicio: filtrosHistorico.value.fecha_inicio,
      fecha_fin: filtrosHistorico.value.fecha_fin,
    })

    if (
      !historicoData.value ||
      !historicoData.value.historico ||
      historicoData.value.historico.length === 0
    ) {
      $q.notify({
        type: 'info',
        message: 'No se encontraron datos históricos para el producto seleccionado',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar histórico',
      caption: error.message,
    })
  } finally {
    loadingHistorico.value = false
  }
}

// Cargar datos iniciales
const loadInitialData = async () => {
  await Promise.all([preciosStore.fetchProductos(), preciosStore.fetchUbicaciones()])

  // Consultar reporte del día actual
  consultarReporte()
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

.kpi-card {
  border-left: 4px solid var(--q-primary);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.sticky-header-table {
  max-height: calc(100vh - 400px);
}

.sticky-header-table >>> thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .text-h6-mobile {
    font-size: 1.25rem !important;
  }

  .text-h5-mobile {
    font-size: 1.5rem !important;
  }

  .q-page {
    padding: 12px !important;
  }

  /* KPI Cards en móvil */
  .kpi-card .text-h4 {
    font-size: 1.75rem !important;
  }

  .kpi-card .text-caption {
    font-size: 0.7rem !important;
  }

  /* Tabla responsive */
  .q-table__container {
    font-size: 0.875rem;
  }

  .q-table td,
  .q-table th {
    padding: 8px 4px !important;
  }

  /* Badges más pequeños en móvil */
  .q-badge {
    font-size: 0.7rem !important;
    padding: 2px 6px !important;
  }

  /* Botones de acción más compactos */
  .q-btn-group > .q-btn {
    padding: 4px 8px !important;
  }

  /* Ocultar labels largos en botones pequeños */
  .q-btn__content {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .text-h6-mobile {
    font-size: 1.1rem !important;
  }

  .text-h5-mobile {
    font-size: 1.25rem !important;
  }

  .kpi-card .text-h4 {
    font-size: 1.5rem !important;
  }

  .kpi-card .text-caption {
    font-size: 0.65rem !important;
  }

  /* Padding reducido en móviles pequeños */
  .q-card-section {
    padding: 12px !important;
  }

  /* Ocultar columnas menos importantes en pantallas muy pequeñas */
  .q-table .text-caption {
    font-size: 0.65rem !important;
  }
}
</style>
