<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4">✅ Validación de Encuestas</div>
        <div class="text-subtitle2 text-grey-7">
          Panel de supervisión - Encuestas pendientes de validación
        </div>
      </div>
      <div class="col-auto">
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
        <div class="row q-col-gutter-md">
          <!-- Búsqueda -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtros.search"
              outlined
              dense
              placeholder="Buscar por ID, informante, fuente..."
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Región -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.region"
              :options="regionesOptions"
              outlined
              dense
              label="Región"
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Tipo de Formulario -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.tipo_formulario"
              :options="tiposFormularioOptions"
              outlined
              dense
              label="Tipo de Formulario"
              clearable
              emit-value
              map-options
            />
          </div>

          <!-- Botón Limpiar -->
          <div class="col-12 col-md-2">
            <q-btn
              outline
              color="grey-7"
              icon="clear_all"
              label="Limpiar"
              @click="limpiarFiltros"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Estadísticas Rápidas -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ encuestasPendientes.length }}</div>
            <div class="text-caption text-grey-7">Pendientes</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-positive">{{ encuestasFiltradas.length }}</div>
            <div class="text-caption text-grey-7">Mostrando</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Encuestas Pendientes -->
    <q-card flat bordered>
      <q-table
        :rows="encuestasFiltradas"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @request="onRequest"
        binary-state-sort
        flat
      >
        <!-- Loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- No Data -->
        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center text-grey-7 q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="inbox" />
            <span>{{ message || 'No hay encuestas pendientes de validación' }}</span>
          </div>
        </template>

        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge color="orange" label="Enviado" />
          </q-td>
        </template>

        <!-- Tipo Formulario -->
        <template v-slot:body-cell-tipo_formulario="props">
          <q-td :props="props">
            <q-badge :color="getColorTipoFormulario(props.row.tipo_formulario)">
              {{ props.row.tipo_formulario }}
            </q-badge>
          </q-td>
        </template>

        <!-- Encuestador -->
        <template v-slot:body-cell-encuestador="props">
          <q-td :props="props">
            <div>{{ getNombreCompletoEncuestador(props.row.encuestador) }}</div>
            <div class="text-caption text-grey-7">
              DNI: {{ props.row.encuestador?.dni || 'N/A' }}
            </div>
          </q-td>
        </template>

        <!-- Ubicación -->
        <template v-slot:body-cell-ubicacion="props">
          <q-td :props="props">
            <div class="text-caption">
              <div><strong>R:</strong> {{ props.row.region }}</div>
              <div><strong>P:</strong> {{ props.row.provincia }}</div>
              <div><strong>D:</strong> {{ props.row.distrito }}</div>
            </div>
          </q-td>
        </template>

        <!-- Fecha -->
        <template v-slot:body-cell-fecha_recoleccion="props">
          <q-td :props="props">
            {{ formatFecha(props.row.fecha_recoleccion) }}
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <div class="q-gutter-xs">
              <q-btn dense flat round color="info" icon="visibility" @click="verDetalle(props.row)">
                <q-tooltip>Ver Detalle</q-tooltip>
              </q-btn>

              <q-btn
                dense
                unelevated
                color="positive"
                icon="check_circle"
                label="Validar"
                @click="abrirDialogValidar(props.row)"
                size="sm"
              />

              <q-btn
                dense
                unelevated
                color="negative"
                icon="cancel"
                label="Rechazar"
                @click="abrirDialogRechazar(props.row)"
                size="sm"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Validar/Rechazar -->
    <EncuestaValidacionDialog
      v-model="dialogValidacion"
      :encuesta="encuestaSeleccionada"
      :accion="accionDialog"
      :supervisor-id="supervisorId"
      @success="handleValidacionSuccess"
    />

    <!-- Dialog Ver Detalle -->
    <q-dialog v-model="dialogDetalle">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">📋 Detalle de Encuesta #{{ encuestaSeleccionada?.id }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="encuestaSeleccionada">
          <div class="q-gutter-sm">
            <p><strong>Tipo Formulario:</strong> {{ encuestaSeleccionada.tipo_formulario }}</p>
            <p>
              <strong>Estado:</strong>
              <q-badge color="orange">{{ encuestaSeleccionada.estado }}</q-badge>
            </p>
            <p><strong>Región:</strong> {{ encuestaSeleccionada.region }}</p>
            <p><strong>Provincia:</strong> {{ encuestaSeleccionada.provincia }}</p>
            <p><strong>Distrito:</strong> {{ encuestaSeleccionada.distrito }}</p>
            <p>
              <strong>Fecha Recolección:</strong>
              {{ formatFecha(encuestaSeleccionada.fecha_recoleccion) }}
            </p>
            <p>
              <strong>Encuestador:</strong>
              {{ getNombreCompletoEncuestador(encuestaSeleccionada.encuestador) }}
            </p>
            <p>
              <strong>Informante:</strong> {{ encuestaSeleccionada.nombre_informante || 'N/A' }}
            </p>
            <p>
              <strong>Teléfono Informante:</strong>
              {{ encuestaSeleccionada.telefono_informante || 'N/A' }}
            </p>
            <p><strong>Fuente:</strong> {{ encuestaSeleccionada.fuente_informacion || 'N/A' }}</p>
            <p v-if="encuestaSeleccionada.observaciones_encuestador">
              <strong>Observaciones:</strong> {{ encuestaSeleccionada.observaciones_encuestador }}
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Validar"
            color="positive"
            icon="check_circle"
            @click="abrirDialogValidarDesdeDetalle"
          />
          <q-btn
            unelevated
            label="Rechazar"
            color="negative"
            icon="cancel"
            @click="abrirDialogRechazarDesdeDetalle"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSieaEncuestasStore } from 'src/stores/sieaEncuestas'
import { date } from 'quasar'
import EncuestaValidacionDialog from 'src/components/siea/EncuestaValidacionDialog.vue'

// Store
const encuestasStore = useSieaEncuestasStore()

// State
const filtros = ref({
  search: '',
  region: null,
  tipo_formulario: null,
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const dialogValidacion = ref(false)
const dialogDetalle = ref(false)
const encuestaSeleccionada = ref(null)
const accionDialog = ref('validar') // 'validar' o 'rechazar'

// IMPORTANTE: En producción, obtener del store de auth
const supervisorId = ref(1) // TODO: Obtener del usuario logueado

// Computed
const loading = computed(() => encuestasStore.loading)

const encuestasPendientes = computed(() => {
  return encuestasStore.encuestas.filter((e) => e.estado === 'enviado')
})

const encuestasFiltradas = computed(() => {
  let resultado = encuestasPendientes.value

  // Filtro de búsqueda
  if (filtros.value.search) {
    const search = filtros.value.search.toLowerCase()
    resultado = resultado.filter(
      (e) =>
        e.id.toString().includes(search) ||
        e.nombre_informante?.toLowerCase().includes(search) ||
        e.fuente_informacion?.toLowerCase().includes(search) ||
        getNombreCompletoEncuestador(e.encuestador)?.toLowerCase().includes(search),
    )
  }

  // Filtro de región
  if (filtros.value.region) {
    resultado = resultado.filter((e) => e.region === filtros.value.region)
  }

  // Filtro de tipo de formulario
  if (filtros.value.tipo_formulario) {
    resultado = resultado.filter((e) => e.tipo_formulario === filtros.value.tipo_formulario)
  }

  return resultado
})

// Opciones
const regionesOptions = ref([
  { label: 'LIMA', value: 'LIMA' },
  { label: 'JUNIN', value: 'JUNIN' },
  { label: 'CUSCO', value: 'CUSCO' },
  { label: 'AREQUIPA', value: 'AREQUIPA' },
  { label: 'PIURA', value: 'PIURA' },
  { label: 'LA LIBERTAD', value: 'LA LIBERTAD' },
  // Agregar más regiones según sea necesario
])

const tiposFormularioOptions = ref([
  { label: 'F-1 (Maquinaria)', value: 'F-1' },
  { label: 'F-4 (Fertilizantes)', value: 'F-4' },
  { label: 'F-6 (Agroquímicos)', value: 'F-6' },
  { label: 'F-14 (Transporte)', value: 'F-14' },
])

const columns = ref([
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  {
    name: 'tipo_formulario',
    label: 'Tipo',
    field: 'tipo_formulario',
    align: 'center',
    sortable: true,
  },
  { name: 'encuestador', label: 'Encuestador', align: 'left' },
  { name: 'ubicacion', label: 'Ubicación', align: 'left' },
  {
    name: 'fecha_recoleccion',
    label: 'Fecha',
    field: 'fecha_recoleccion',
    align: 'center',
    sortable: true,
  },
  { name: 'acciones', label: 'Acciones', align: 'center' },
])

// Métodos
const formatFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return date.formatDate(fecha, 'DD/MM/YYYY')
}

const getNombreCompletoEncuestador = (encuestador) => {
  if (!encuestador) return 'N/A'

  // Si viene el accessor desde el backend
  if (encuestador.nombre_completo) {
    return encuestador.nombre_completo
  }

  // Si viene por partes, construir el nombre
  const nombres = encuestador.nombres || ''
  const apellidoPaterno = encuestador.apellido_paterno || ''
  const apellidoMaterno = encuestador.apellido_materno || ''

  const nombreCompleto = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim()
  return nombreCompleto || 'N/A'
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

const refrescar = async () => {
  // Filtrar solo encuestas pendientes de validación (estado "enviado")
  encuestasStore.filtros.estado = 'enviado'
  await encuestasStore.fetchEncuestas()
}

const limpiarFiltros = () => {
  filtros.value = {
    search: '',
    region: null,
    tipo_formulario: null,
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
}

const verDetalle = (encuesta) => {
  encuestaSeleccionada.value = encuesta
  dialogDetalle.value = true
}

const abrirDialogValidar = (encuesta) => {
  encuestaSeleccionada.value = encuesta
  accionDialog.value = 'validar'
  dialogValidacion.value = true
}

const abrirDialogRechazar = (encuesta) => {
  encuestaSeleccionada.value = encuesta
  accionDialog.value = 'rechazar'
  dialogValidacion.value = true
}

const abrirDialogValidarDesdeDetalle = () => {
  dialogDetalle.value = false
  accionDialog.value = 'validar'
  dialogValidacion.value = true
}

const abrirDialogRechazarDesdeDetalle = () => {
  dialogDetalle.value = false
  accionDialog.value = 'rechazar'
  dialogValidacion.value = true
}

const handleValidacionSuccess = (encuestaActualizada) => {
  console.log('✅ Encuesta procesada:', encuestaActualizada)
  // Refrescar lista
  refrescar()
}

// Lifecycle
onMounted(async () => {
  await refrescar()
})
</script>
