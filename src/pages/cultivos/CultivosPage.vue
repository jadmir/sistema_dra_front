<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-medium text-grey-8">
            <q-icon name="grass" color="green-7" size="sm" class="q-mr-sm" />
            Cultivos
          </div>
          <div class="text-caption text-grey-6">Gestiona los cultivos agrícolas</div>
        </div>
        <div class="col-auto gt-xs">
          <q-btn-dropdown
            unelevated
            color="orange-7"
            icon="download"
            label="Reportes"
            class="q-mr-sm"
          >
            <q-list>
              <q-item clickable v-close-popup @click="openExportDialog('pdf')">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red-6" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exportar PDF</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openExportDialog('excel')">
                <q-item-section avatar>
                  <q-icon name="table_chart" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exportar Excel</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn unelevated color="green-7" icon="add" label="Nuevo Cultivo" @click="openForm()" />
        </div>
      </div>

      <!-- Botones móvil -->
      <div class="row q-gutter-sm q-mb-md lt-sm">
        <div class="col-12">
          <q-btn
            unelevated
            color="green-7"
            icon="add"
            label="Nuevo Cultivo"
            @click="openForm()"
            class="full-width"
          />
        </div>
        <div class="col-12">
          <q-btn-dropdown
            unelevated
            color="orange-7"
            icon="download"
            label="Descargar Reportes"
            class="full-width"
          >
            <q-list>
              <q-item clickable v-close-popup @click="openExportDialog('pdf')">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red-6" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exportar PDF</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openExportDialog('excel')">
                <q-item-section avatar>
                  <q-icon name="table_chart" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Exportar Excel</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <q-card class="q-mb-md">
        <q-card-section class="q-pa-md">
          <q-input
            v-model="cultivoStore.search"
            placeholder="Buscar cultivo..."
            outlined
            dense
            clearable
            debounce="500"
            @update:model-value="onSearch"
          >
            <template #prepend>
              <q-icon name="search" color="green-7" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card>
        <q-table
          :rows="cultivoStore.cultivos"
          :columns="columns"
          row-key="id"
          :loading="cultivoStore.loading"
          :grid="isMobile"
          :dense="isMobile"
          flat
          bordered
        >
          <!-- Desktop: jerarquía completa -->
          <template #body-cell-subgrupo="props">
            <q-td>
              <div v-if="props.row.subgrupo" class="text-caption">
                <div class="text-grey-8">
                  <q-icon name="category" size="xs" color="green-7" class="q-mr-xs" />
                  <strong>Subsector:</strong>
                  {{ props.row.subgrupo?.grupo?.subsector?.descripcion || '—' }}
                </div>
                <div class="text-grey-7 q-mt-xs">
                  <q-icon name="workspaces" size="xs" color="green-6" class="q-mr-xs" />
                  <strong>Grupo:</strong> {{ props.row.subgrupo?.grupo?.descripcion || '—' }}
                </div>
                <div class="text-grey-7 q-mt-xs">
                  <q-icon name="account_tree" size="xs" color="green-5" class="q-mr-xs" />
                  <strong>Subgrupo:</strong> {{ props.row.subgrupo?.descripcion || '—' }}
                </div>
              </div>
              <span v-else>—</span>
            </q-td>
          </template>

          <!-- Desktop: acciones -->
          <template #body-cell-actions="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="green-7"
                size="sm"
                @click="openForm(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="red-6"
                size="sm"
                @click="confirmDelete(props.row.id)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Móvil: tarjetas -->
          <template #item="props">
            <div class="q-pa-xs col-12">
              <q-card bordered class="cursor-pointer" @click="openDetail(props.row)">
                <q-card-section class="q-pb-none">
                  <div class="text-subtitle1 text-weight-bold">{{ props.row.codigo }}</div>
                  <div class="text-caption text-grey-7">{{ props.row.descripcion }}</div>
                </q-card-section>

                <q-separator inset />

                <q-list dense>
                  <q-item>
                    <q-item-section>ID</q-item-section>
                    <q-item-section side>{{ props.row.id }}</q-item-section>
                  </q-item>
                  <q-item v-if="props.row.subgrupo">
                    <q-item-section>Subgrupo</q-item-section>
                    <q-item-section side>{{ props.row.subgrupo?.descripcion }}</q-item-section>
                  </q-item>
                  <q-item v-if="props.row.subgrupo?.grupo">
                    <q-item-section>Grupo</q-item-section>
                    <q-item-section side>{{
                      props.row.subgrupo?.grupo?.descripcion
                    }}</q-item-section>
                  </q-item>
                  <q-item v-if="props.row.subgrupo?.grupo?.subsector">
                    <q-item-section>Subsector</q-item-section>
                    <q-item-section side>{{
                      props.row.subgrupo?.grupo?.subsector?.descripcion
                    }}</q-item-section>
                  </q-item>
                </q-list>

                <q-card-actions align="right">
                  <q-btn
                    dense
                    flat
                    round
                    icon="edit"
                    color="green-7"
                    size="sm"
                    @click.stop="openForm(props.row)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    flat
                    round
                    icon="delete"
                    color="red-6"
                    size="sm"
                    @click.stop="confirmDelete(props.row.id)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Modal de detalle -->
    <q-dialog v-model="detailOpen">
      <q-card style="max-width: 520px; width: 100%">
        <q-card-section class="row items-center q-gutter-sm bg-gradient-green text-white">
          <q-avatar color="white" text-color="green-7" icon="grass" />
          <div class="text-h6">{{ detailItem?.codigo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-list dense>
          <q-item>
            <q-item-section>ID</q-item-section>
            <q-item-section side>{{ detailItem?.id }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Código</q-item-section>
            <q-item-section side>{{ detailItem?.codigo }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Descripción</q-item-section>
            <q-item-section side>{{ detailItem?.descripcion }}</q-item-section>
          </q-item>
          <q-item v-if="detailItem?.subgrupo">
            <q-item-section>Subgrupo</q-item-section>
            <q-item-section side>{{ detailItem?.subgrupo?.descripcion }}</q-item-section>
          </q-item>
          <q-item v-if="detailItem?.subgrupo?.grupo">
            <q-item-section>Grupo</q-item-section>
            <q-item-section side>{{ detailItem?.subgrupo?.grupo?.descripcion }}</q-item-section>
          </q-item>
          <q-item v-if="detailItem?.subgrupo?.grupo?.subsector">
            <q-item-section>Subsector</q-item-section>
            <q-item-section side>{{
              detailItem?.subgrupo?.grupo?.subsector?.descripcion
            }}</q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn class="btn-green" label="Editar" icon="edit" @click="openFormFromDetail" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de formulario -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 400px; max-width: 500px">
        <q-card-section class="bg-gradient-green text-white">
          <div class="text-h6">
            <q-icon name="grass" size="sm" class="q-mr-sm" />
            {{ isEdit ? 'Editar Cultivo' : 'Nuevo Cultivo' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" @submit.prevent="onSubmit">
            <q-select
              v-model="form.subgrupo_id"
              :options="subgrupos"
              option-value="id"
              option-label="descripcion"
              emit-value
              map-options
              label="Subgrupo"
              outlined
              dense
              class="q-mb-md"
              :rules="[(v) => !!v || 'El subgrupo es requerido']"
              :loading="loadingSubgrupos"
            >
              <template #prepend>
                <q-icon name="account_tree" color="green-7" />
              </template>
            </q-select>

            <q-input
              v-model="form.codigo"
              label="Código"
              outlined
              dense
              class="q-mb-md"
              :rules="[(v) => !!v || 'El código es requerido']"
            >
              <template #prepend>
                <q-icon name="tag" color="green-7" />
              </template>
            </q-input>

            <q-input
              v-model="form.descripcion"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="3"
              :rules="[(v) => !!v || 'La descripción es requerida']"
            >
              <template #prepend>
                <q-icon name="description" color="green-7" />
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup @click="closeForm" />
              <q-btn
                class="btn-green"
                :label="isEdit ? 'Actualizar' : 'Guardar'"
                :icon="isEdit ? 'save' : 'add'"
                type="submit"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de Filtros de Exportación Mejorado -->
    <q-dialog v-model="showExportDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 500px; max-width: 600px; border-radius: 12px" class="export-dialog">
        <!-- Header con gradiente -->
        <q-card-section
          class="row items-center q-pa-lg"
          :class="exportType === 'pdf' ? 'bg-gradient-red' : 'bg-gradient-excel'"
        >
          <q-avatar size="56px" :class="exportType === 'pdf' ? 'bg-white' : 'bg-white'">
            <q-icon
              :name="exportType === 'pdf' ? 'picture_as_pdf' : 'table_chart'"
              size="32px"
              :color="exportType === 'pdf' ? 'red-7' : 'green-7'"
            />
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-h5 text-weight-bold text-white">
              Exportar {{ exportType === 'pdf' ? 'PDF' : 'Excel' }}
            </div>
            <div class="text-caption text-white" style="opacity: 0.9">
              Configura los filtros para tu reporte
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense color="white" @click="closeExportDialog" />
        </q-card-section>

        <q-separator />

        <!-- Contenido del modal -->
        <q-card-section class="q-pa-lg">
          <!-- Info Card -->
          <q-card flat bordered class="q-mb-lg" style="border-radius: 8px; background: #f5f5f5">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="info" color="blue-7" size="24px" class="q-mr-sm" />
                <div class="text-body2 text-grey-8">
                  <strong>Nivel de Exportación:</strong> Selecciona qué información deseas incluir
                  en el reporte
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Selector de Nivel con Cards -->
          <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
            <q-icon name="layers" color="green-7" size="20px" class="q-mr-xs" />
            Nivel de Datos
          </div>

          <div class="row q-col-gutter-sm q-mb-lg">
            <div v-for="nivel in nivelOptions" :key="nivel.value" class="col-6">
              <q-card
                flat
                bordered
                clickable
                :class="[
                  'nivel-card',
                  exportFilters.nivel === nivel.value ? 'nivel-card-active' : '',
                ]"
                @click="exportFilters.nivel = nivel.value"
              >
                <q-card-section class="text-center q-pa-md">
                  <q-icon
                    :name="getNivelIcon(nivel.value)"
                    :color="exportFilters.nivel === nivel.value ? 'green-7' : 'grey-6'"
                    size="32px"
                  />
                  <div
                    class="text-body2 q-mt-sm"
                    :class="
                      exportFilters.nivel === nivel.value
                        ? 'text-green-8 text-weight-bold'
                        : 'text-grey-7'
                    "
                  >
                    {{ nivel.label }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Filtros Opcionales -->
          <q-slide-transition>
            <div v-if="exportFilters.nivel !== 'todo' && exportFilters.nivel !== 'subsector'">
              <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
                <q-icon name="filter_alt" color="orange-7" size="20px" class="q-mr-xs" />
                Filtros Opcionales
              </div>

              <q-select
                v-if="exportFilters.nivel === 'grupo' || exportFilters.nivel === 'subgrupo'"
                v-model="exportFilters.sub_sector_id"
                :options="subsectores"
                option-value="id"
                option-label="descripcion"
                emit-value
                map-options
                label="Subsector"
                outlined
                clearable
                class="q-mb-md custom-select"
                :loading="loadingSubsectores"
              >
                <template #prepend>
                  <q-icon name="category" color="green-7" />
                </template>
                <template #hint> Filtra por un subsector específico </template>
              </q-select>

              <q-select
                v-if="exportFilters.nivel === 'subgrupo'"
                v-model="exportFilters.grupo_id"
                :options="grupos"
                option-value="id"
                option-label="descripcion"
                emit-value
                map-options
                label="Grupo"
                outlined
                clearable
                class="q-mb-md custom-select"
                :loading="loadingGrupos"
              >
                <template #prepend>
                  <q-icon name="workspaces" color="green-7" />
                </template>
                <template #hint> Filtra por un grupo específico </template>
              </q-select>
            </div>
          </q-slide-transition>

          <!-- Búsqueda -->
          <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-md">
            <q-icon name="search" color="blue-7" size="20px" class="q-mr-xs" />
            Búsqueda
          </div>

          <q-input
            v-model="exportFilters.search"
            label="Buscar por código o descripción"
            outlined
            clearable
            class="custom-input"
            placeholder="Ej: Mango, Café, etc..."
          >
            <template #prepend>
              <q-icon name="search" color="grey-6" />
            </template>
            <template #hint> Opcional: busca en códigos y descripciones </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <!-- Footer con botones mejorados -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="closeExportDialog"
            padding="8px 20px"
          />
          <q-btn
            unelevated
            :label="`Exportar ${exportType === 'pdf' ? 'PDF' : 'Excel'}`"
            :icon="exportType === 'pdf' ? 'picture_as_pdf' : 'table_chart'"
            :color="exportType === 'pdf' ? 'red-7' : 'green-7'"
            @click="executeExport"
            padding="8px 24px"
            class="text-weight-bold"
          >
            <q-tooltip>Generar y descargar reporte</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCultivoStore } from 'stores/cultivos'
import { useSubgrupoStore } from 'stores/subgrupos'
import { useGrupoStore } from 'stores/grupos'
import { useSubsectorStore } from 'stores/subsectores'
import { useQuasar, Loading } from 'quasar'
import Swal from 'sweetalert2'

const $q = useQuasar()
const cultivoStore = useCultivoStore()
const subgrupoStore = useSubgrupoStore()
const grupoStore = useGrupoStore()
const subsectorStore = useSubsectorStore()
const isMobile = computed(() => $q.screen.lt.md)

const showForm = ref(false)
const selectedItem = ref(null)
const detailOpen = ref(false)
const detailItem = ref(null)
const loading = ref(false)
const loadingSubgrupos = ref(false)
const formRef = ref(null)
const subgrupos = ref([])

// Variables para exportación
const showExportDialog = ref(false)
const exportType = ref('pdf') // 'pdf' o 'excel'
const loadingSubsectores = ref(false)
const loadingGrupos = ref(false)
const subsectores = ref([])
const grupos = ref([])

const exportFilters = ref({
  nivel: 'todo',
  sub_sector_id: null,
  grupo_id: null,
  sub_grupo_id: null,
  search: '',
})

const nivelOptions = [
  { label: 'Todo', value: 'todo' },
  { label: 'Subsectores', value: 'subsector' },
  { label: 'Grupos', value: 'grupo' },
  { label: 'Subgrupos', value: 'subgrupo' },
]

const form = ref({
  subgrupo_id: null,
  codigo: '',
  descripcion: '',
})

const isEdit = computed(() => !!selectedItem.value)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'subgrupo', label: 'Jerarquía', field: 'subgrupo', align: 'left', sortable: false },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

onMounted(async () => {
  cultivoStore.fetchCultivos()
  await loadSubgrupos()
})

const loadSubgrupos = async () => {
  loadingSubgrupos.value = true
  try {
    await subgrupoStore.fetchSubgrupos()
    subgrupos.value = subgrupoStore.subgrupos
  } finally {
    loadingSubgrupos.value = false
  }
}

const onSearch = () => {
  cultivoStore.fetchCultivos()
}

const openForm = (item = null) => {
  selectedItem.value = item
  if (item) {
    form.value = {
      subgrupo_id: item.subgrupo_id || item.subgrupo?.id,
      codigo: item.codigo,
      descripcion: item.descripcion,
    }
  } else {
    form.value = {
      subgrupo_id: null,
      codigo: '',
      descripcion: '',
    }
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedItem.value = null
  formRef.value?.resetValidation()
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  const success = isEdit.value
    ? await cultivoStore.updateCultivo(selectedItem.value.id, form.value)
    : await cultivoStore.createCultivo(form.value)

  loading.value = false

  if (success) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Cultivo actualizado' : 'Cultivo creado',
    })
    closeForm()
  } else {
    $q.notify({ type: 'negative', message: cultivoStore.error })
  }
}

const confirmDelete = async (id) => {
  const res = await Swal.fire({
    title: 'Confirmar',
    text: '¿Eliminar este cultivo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e53935',
    cancelButtonColor: '#5a8f69',
  })
  if (res.isConfirmed) {
    const ok = await cultivoStore.deleteCultivo(id)
    if (ok) await Swal.fire('Eliminado', 'El cultivo fue eliminado', 'success')
    else await Swal.fire('Error', cultivoStore.error || 'No se pudo eliminar', 'error')
  }
}

const openDetail = (item) => {
  detailItem.value = item
  detailOpen.value = true
}

const openFormFromDetail = () => {
  const item = detailItem.value
  detailOpen.value = false
  if (item) openForm(item)
}

// Funciones de exportación con filtros
const openExportDialog = async (type) => {
  exportType.value = type

  // Cargar subsectores y grupos para los filtros
  await loadDataForFilters()

  // Resetear filtros
  exportFilters.value = {
    nivel: 'todo',
    sub_sector_id: null,
    grupo_id: null,
    sub_grupo_id: null,
    search: '',
  }

  showExportDialog.value = true
}

const closeExportDialog = () => {
  showExportDialog.value = false
}

const loadDataForFilters = async () => {
  // Cargar subsectores
  loadingSubsectores.value = true
  try {
    await subsectorStore.fetchSubsectores()
    subsectores.value = subsectorStore.subsectores
  } finally {
    loadingSubsectores.value = false
  }

  // Cargar grupos
  loadingGrupos.value = true
  try {
    await grupoStore.fetchGrupos()
    grupos.value = grupoStore.grupos
  } finally {
    loadingGrupos.value = false
  }
}

const executeExport = () => {
  if (exportType.value === 'pdf') {
    downloadPDF()
  } else {
    downloadExcel()
  }
  closeExportDialog()
}

// Función para obtener el icono según el nivel
const getNivelIcon = (nivel) => {
  const icons = {
    todo: 'dashboard',
    subsector: 'category',
    grupo: 'workspaces',
    subgrupo: 'account_tree',
  }
  return icons[nivel] || 'layers'
}

const downloadPDF = async () => {
  Loading.show({ message: 'Generando PDF...' })

  // Construir parámetros de filtro
  const params = new URLSearchParams()
  if (exportFilters.value.nivel) params.append('nivel', exportFilters.value.nivel)
  if (exportFilters.value.sub_sector_id)
    params.append('sub_sector_id', exportFilters.value.sub_sector_id)
  if (exportFilters.value.grupo_id) params.append('grupo_id', exportFilters.value.grupo_id)
  if (exportFilters.value.sub_grupo_id)
    params.append('sub_grupo_id', exportFilters.value.sub_grupo_id)
  if (exportFilters.value.search) params.append('search', exportFilters.value.search)

  const success = await cultivoStore.downloadPDF(Object.fromEntries(params))
  Loading.hide()

  if (success) {
    $q.notify({ type: 'positive', message: 'PDF descargado correctamente' })
  } else {
    $q.notify({ type: 'negative', message: cultivoStore.error || 'Error al generar PDF' })
  }
}

const downloadExcel = async () => {
  Loading.show({ message: 'Generando Excel...' })

  // Construir parámetros de filtro
  const params = new URLSearchParams()
  if (exportFilters.value.nivel) params.append('nivel', exportFilters.value.nivel)
  if (exportFilters.value.sub_sector_id)
    params.append('sub_sector_id', exportFilters.value.sub_sector_id)
  if (exportFilters.value.grupo_id) params.append('grupo_id', exportFilters.value.grupo_id)
  if (exportFilters.value.sub_grupo_id)
    params.append('sub_grupo_id', exportFilters.value.sub_grupo_id)
  if (exportFilters.value.search) params.append('search', exportFilters.value.search)

  const success = await cultivoStore.downloadExcel(Object.fromEntries(params))
  Loading.hide()

  if (success) {
    $q.notify({ type: 'positive', message: 'Excel descargado correctamente' })
  } else {
    $q.notify({ type: 'negative', message: cultivoStore.error || 'Error al generar Excel' })
  }
}
</script>

<style scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
}

.bg-gradient-red {
  background: linear-gradient(135deg, #ef5350 0%, #c62828 100%);
}

.bg-gradient-excel {
  background: linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%);
}

.btn-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  color: white;
  font-weight: 600;
}

.btn-green:hover {
  background: linear-gradient(135deg, #4a7f59 0%, #2d5f3d 100%);
}

/* Estilos para el modal de exportación */
.export-dialog {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.nivel-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #e0e0e0;
}

.nivel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #5a8f69;
}

.nivel-card-active {
  border-color: #5a8f69;
  background: linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%);
  box-shadow: 0 4px 12px rgba(90, 143, 105, 0.2);
}

.nivel-card-active:hover {
  transform: translateY(-2px);
}

.custom-select {
  border-radius: 8px;
}

.custom-input {
  border-radius: 8px;
}

/* Animación para los filtros */
.q-slide-transition-enter-active,
.q-slide-transition-leave-active {
  transition: all 0.3s ease;
}
</style>
