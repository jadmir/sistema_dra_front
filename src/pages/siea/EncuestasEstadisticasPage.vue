<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4">📊 Estadísticas de Encuestas</div>
        <div class="text-subtitle2 text-grey-7">Dashboard de métricas y reportes</div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn outline color="primary" icon="download" label="Exportar" @click="exportar" />
        <q-btn
          unelevated
          color="primary"
          icon="refresh"
          label="Actualizar"
          @click="refrescar"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.anio"
              :options="aniosOptions"
              outlined
              dense
              label="Año"
              emit-value
              map-options
              @update:model-value="cambiarAnio"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.mes"
              :options="mesesOptions"
              outlined
              dense
              label="Mes"
              clearable
              emit-value
              map-options
              @update:model-value="cambiarMes"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-btn
              outline
              color="grey-7"
              icon="clear_all"
              label="Limpiar Filtros"
              @click="limpiarFiltros"
              class="full-width"
            />
          </div>

          <div class="col-12 col-md-3">
            <div class="text-caption text-grey-7">
              Mostrando:
              <strong>{{
                filtros.mes
                  ? mesesOptions.find((m) => m.value === filtros.mes)?.label
                  : 'Todo el año'
              }}</strong>
              {{ filtros.anio }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner color="primary" size="3em" />
      <div class="full-width text-center q-mt-md text-grey-7">Cargando estadísticas...</div>
    </div>

    <!-- Content -->
    <template v-else-if="estadisticas">
      <!-- Cards de Resumen -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Total -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-blue-1">
            <q-card-section class="text-center">
              <q-icon name="assessment" size="3em" color="blue" />
              <div class="text-h3 text-blue q-mt-sm">{{ totalEncuestas }}</div>
              <div class="text-subtitle2 text-grey-7">Total Encuestas</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Validadas -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-positive-1">
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="3em" color="positive" />
              <div class="text-h3 text-positive q-mt-sm">{{ encuestasValidadas }}</div>
              <div class="text-subtitle2 text-grey-7">Validadas ({{ porcentajeValidadas }}%)</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pendientes -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-warning-1">
            <q-card-section class="text-center">
              <q-icon name="pending" size="3em" color="warning" />
              <div class="text-h3 text-warning q-mt-sm">{{ encuestasPendientes }}</div>
              <div class="text-subtitle2 text-grey-7">Pendientes de Validación</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Rechazadas -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-negative-1">
            <q-card-section class="text-center">
              <q-icon name="cancel" size="3em" color="negative" />
              <div class="text-h3 text-negative q-mt-sm">{{ encuestasRechazadas }}</div>
              <div class="text-subtitle2 text-grey-7">Rechazadas ({{ porcentajeRechazadas }}%)</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Por Estado -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">📋 Por Estado</div>
              <div class="q-gutter-sm">
                <div
                  v-for="(cantidad, estado) in encuestasPorEstado"
                  :key="estado"
                  class="row items-center"
                >
                  <div class="col-4">
                    <q-badge :color="getColorEstado(estado)" :label="getNombreEstado(estado)" />
                  </div>
                  <div class="col-6">
                    <q-linear-progress
                      :value="cantidad / totalEncuestas"
                      :color="getColorEstado(estado)"
                      size="20px"
                    />
                  </div>
                  <div class="col-2 text-right">
                    <strong>{{ cantidad }}</strong>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Por Tipo -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">📝 Por Tipo de Formulario</div>
              <div class="q-gutter-sm">
                <div
                  v-for="(cantidad, tipo) in encuestasPorTipo"
                  :key="tipo"
                  class="row items-center"
                >
                  <div class="col-4">
                    <q-badge :color="getColorTipoFormulario(tipo)" :label="tipo" />
                  </div>
                  <div class="col-6">
                    <q-linear-progress
                      :value="cantidad / totalEncuestas"
                      :color="getColorTipoFormulario(tipo)"
                      size="20px"
                    />
                  </div>
                  <div class="col-2 text-right">
                    <strong>{{ cantidad }}</strong>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Top Provincias -->
      <div class="row">
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">🗺️ Top 10 Provincias</div>
              <q-markup-table flat>
                <thead>
                  <tr>
                    <th class="text-left">#</th>
                    <th class="text-left">Provincia</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-left">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(cantidad, provincia, index) in encuestasPorProvincia"
                    :key="provincia"
                  >
                    <td class="text-left">
                      <q-badge
                        :color="index < 3 ? 'primary' : 'grey-5'"
                        :label="index + 1"
                        rounded
                      />
                    </td>
                    <td class="text-left">
                      <strong>{{ provincia }}</strong>
                    </td>
                    <td class="text-center">
                      <q-badge color="blue-grey" :label="cantidad" />
                    </td>
                    <td class="text-left">
                      <q-linear-progress
                        :value="cantidad / totalEncuestas"
                        color="primary"
                        size="12px"
                        class="q-mr-sm"
                        style="width: 200px; display: inline-block"
                      />
                      <span class="text-caption">
                        {{ ((cantidad / totalEncuestas) * 100).toFixed(1) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>

              <div
                v-if="Object.keys(encuestasPorProvincia).length === 0"
                class="text-center text-grey-7 q-pa-lg"
              >
                <q-icon name="info" size="2em" />
                <div>No hay datos de provincias disponibles</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Resumen Textual -->
      <div class="row q-mt-md">
        <div class="col-12">
          <q-card flat bordered class="bg-blue-grey-1">
            <q-card-section>
              <div class="text-h6 q-mb-md">📈 Resumen Ejecutivo</div>
              <div class="text-body1 q-gutter-sm">
                <p>
                  <q-icon name="info" color="primary" />
                  Se han registrado <strong>{{ totalEncuestas }} encuestas</strong> en el período
                  seleccionado.
                </p>
                <p>
                  <q-icon name="check_circle" color="positive" />
                  <strong>{{ encuestasValidadas }}</strong> encuestas han sido validadas (<strong
                    >{{ porcentajeValidadas }}%</strong
                  >
                  de tasa de aprobación).
                </p>
                <p>
                  <q-icon name="pending" color="warning" />
                  Actualmente hay <strong>{{ encuestasPendientes }}</strong> encuestas esperando
                  validación por parte de los supervisores.
                </p>
                <p v-if="encuestasRechazadas > 0">
                  <q-icon name="cancel" color="negative" />
                  <strong>{{ encuestasRechazadas }}</strong> encuestas fueron rechazadas (<strong
                    >{{ porcentajeRechazadas }}%</strong
                  >
                  de tasa de rechazo).
                </p>
                <p v-if="encuestasBorrador > 0">
                  <q-icon name="edit" color="grey-7" />
                  Hay <strong>{{ encuestasBorrador }}</strong> encuestas en estado de borrador.
                </p>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- No Data State -->
    <div v-else class="row justify-center q-my-xl">
      <div class="text-center">
        <q-icon name="inbox" size="5em" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No hay datos disponibles</div>
        <div class="text-caption text-grey-6">
          Intenta cambiar los filtros o verifica que haya encuestas registradas
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSieaEncuestasEstadisticasStore } from 'src/stores/sieaEncuestasEstadisticas'
import { Notify, Dialog, Loading } from 'quasar'
import { api } from 'src/boot/axios'

// Store
const estadisticasStore = useSieaEncuestasEstadisticasStore()

// State
const filtros = ref({
  anio: new Date().getFullYear(),
  mes: null,
})

// Computed
const loading = computed(() => estadisticasStore.loading)
const estadisticas = computed(() => estadisticasStore.estadisticas)
const totalEncuestas = computed(() => estadisticasStore.totalEncuestas)
const encuestasPorEstado = computed(() => estadisticasStore.encuestasPorEstado)
const encuestasPorTipo = computed(() => estadisticasStore.encuestasPorTipo)
const encuestasPorProvincia = computed(() => estadisticasStore.encuestasPorProvincia)
const encuestasValidadas = computed(() => estadisticasStore.encuestasValidadas)
const encuestasRechazadas = computed(() => estadisticasStore.encuestasRechazadas)
const encuestasPendientes = computed(() => estadisticasStore.encuestasPendientes)
const encuestasBorrador = computed(() => estadisticasStore.encuestasBorrador)
const porcentajeValidadas = computed(() => estadisticasStore.porcentajeValidadas)
const porcentajeRechazadas = computed(() => estadisticasStore.porcentajeRechazadas)

// Opciones
const aniosOptions = ref([
  { label: '2024', value: 2024 },
  { label: '2025', value: 2025 },
  { label: '2026', value: 2026 },
])

const mesesOptions = ref([
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
])

// Métodos
const refrescar = async () => {
  await estadisticasStore.refrescar()
}

const cambiarAnio = (anio) => {
  estadisticasStore.setAnio(anio)
}

const cambiarMes = (mes) => {
  estadisticasStore.setMes(mes)
}

const limpiarFiltros = () => {
  estadisticasStore.limpiarFiltros()
  filtros.value = {
    anio: new Date().getFullYear(),
    mes: null,
  }
}

const exportar = () => {
  Dialog.create({
    title: 'Exportar Estadísticas',
    message: '¿En qué formato deseas exportar las estadísticas?',
    options: {
      type: 'radio',
      model: 'excel',
      items: [
        { label: '📊 Excel (.xlsx)', value: 'excel', color: 'positive' },
        { label: '📄 PDF (.pdf)', value: 'pdf', color: 'negative' },
      ],
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true,
    },
    ok: {
      label: 'Exportar',
      color: 'primary',
    },
  }).onOk((formato) => {
    exportarEstadisticas(formato)
  })
}

const exportarEstadisticas = async (formato) => {
  try {
    Loading.show({
      message: `Generando archivo ${formato.toUpperCase()}...`,
    })

    const params = new URLSearchParams()
    params.append('anio', filtros.value.anio)
    params.append('formato', formato)

    if (filtros.value.mes) {
      params.append('mes', filtros.value.mes)
    }

    const url = `/agri/encuestas-estadisticas/exportar?${params.toString()}`

    // console.log('📥 Descargando desde:', url)

    const response = await api.get(url, {
      responseType: 'blob',
    })

    // Determinar el nombre del archivo
    const fecha = new Date().toISOString().split('T')[0]
    const nombreBase = filtros.value.mes
      ? `estadisticas_${filtros.value.anio}_${mesesOptions.value.find((m) => m.value === filtros.value.mes)?.label || filtros.value.mes}`
      : `estadisticas_${filtros.value.anio}`

    const extension = formato === 'excel' ? 'xlsx' : 'pdf'
    const nombreArchivo = `${nombreBase}_${fecha}.${extension}`

    // Crear enlace de descarga
    const blob = new Blob([response.data], {
      type:
        formato === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
    })

    const urlBlob = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = urlBlob
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(urlBlob)

    Loading.hide()

    Notify.create({
      type: 'positive',
      message: `Archivo ${formato.toUpperCase()} descargado exitosamente`,
      caption: nombreArchivo,
      position: 'top-right',
      icon: 'download',
      timeout: 3000,
    })
  } catch (error) {
    Loading.hide()
    // console.error('❌ Error al exportar:', error)

    Notify.create({
      type: 'negative',
      message: 'Error al exportar estadísticas',
      caption: error.response?.data?.message || error.message,
      position: 'top-right',
      timeout: 5000,
    })
  }
}

const getColorEstado = (estado) => {
  const colores = {
    borrador: 'grey',
    enviado: 'orange',
    validado: 'positive',
    rechazado: 'negative',
  }
  return colores[estado] || 'grey'
}

const getNombreEstado = (estado) => {
  const nombres = {
    borrador: 'Borrador',
    enviado: 'Enviado',
    validado: 'Validado',
    rechazado: 'Rechazado',
  }
  return nombres[estado] || estado
}

const getColorTipoFormulario = (tipo) => {
  const colores = {
    'F-1': 'blue',
    'F-4': 'green',
    'F-6': 'orange',
    'F-14': 'purple',
  }
  return colores[tipo] || 'grey'
}

// Lifecycle
onMounted(async () => {
  await estadisticasStore.fetchEstadisticas()
})
</script>
