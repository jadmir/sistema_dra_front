<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-medium text-grey-8">
            <q-icon name="account_tree" color="green-7" size="sm" class="q-mr-sm" />
            Subgrupos
          </div>
          <div class="text-caption text-grey-6">Gestiona los subgrupos de cultivos</div>
        </div>
        <div class="col-auto gt-xs">
          <q-btn unelevated color="green-7" icon="add" label="Nuevo Subgrupo" @click="openForm()" />
        </div>
      </div>

      <!-- Botón móvil -->
      <div class="row q-mb-md lt-sm">
        <div class="col-12">
          <q-btn
            unelevated
            color="green-7"
            icon="add"
            label="Nuevo Subgrupo"
            @click="openForm()"
            class="full-width"
          />
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <q-card class="q-mb-md">
        <q-card-section class="q-pa-md">
          <q-input
            v-model="subgrupoStore.search"
            placeholder="Buscar subgrupo..."
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
          :rows="subgrupoStore.subgrupos"
          :columns="columns"
          row-key="id"
          :loading="subgrupoStore.loading"
          :grid="isMobile"
          :dense="isMobile"
          flat
          bordered
        >
          <!-- Desktop: grupo -->
          <template #body-cell-grupo="props">
            <q-td>
              {{ props.row.grupo?.descripcion || props.row.grupo?.codigo || '—' }}
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
                  <q-item>
                    <q-item-section>Grupo</q-item-section>
                    <q-item-section side>{{ props.row.grupo?.descripcion || '—' }}</q-item-section>
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
          <q-avatar color="white" text-color="green-7" icon="account_tree" />
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
          <q-item>
            <q-item-section>Grupo</q-item-section>
            <q-item-section side>{{ detailItem?.grupo?.descripcion || '—' }}</q-item-section>
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
            <q-icon name="account_tree" size="sm" class="q-mr-sm" />
            {{ isEdit ? 'Editar Subgrupo' : 'Nuevo Subgrupo' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" @submit.prevent="onSubmit">
            <q-select
              v-model="form.grupo_id"
              :options="grupos"
              option-value="id"
              option-label="descripcion"
              emit-value
              map-options
              label="Grupo"
              outlined
              dense
              class="q-mb-md"
              :rules="[(v) => !!v || 'El grupo es requerido']"
              :loading="loadingGrupos"
            >
              <template #prepend>
                <q-icon name="workspaces" color="green-7" />
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSubgrupoStore } from 'stores/subgrupos'
import { useGrupoStore } from 'stores/grupos'
import { useQuasar } from 'quasar'
import Swal from 'sweetalert2'

const $q = useQuasar()
const subgrupoStore = useSubgrupoStore()
const grupoStore = useGrupoStore()
const isMobile = computed(() => $q.screen.lt.md)

const showForm = ref(false)
const selectedItem = ref(null)
const detailOpen = ref(false)
const detailItem = ref(null)
const loading = ref(false)
const loadingGrupos = ref(false)
const formRef = ref(null)
const grupos = ref([])

const form = ref({
  grupo_id: null,
  codigo: '',
  descripcion: '',
})

const isEdit = computed(() => !!selectedItem.value)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'grupo', label: 'Grupo', field: 'grupo', align: 'left', sortable: true },
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
  subgrupoStore.fetchSubgrupos()
  await loadGrupos()
})

const loadGrupos = async () => {
  loadingGrupos.value = true
  try {
    await grupoStore.fetchGrupos()
    grupos.value = grupoStore.grupos
  } finally {
    loadingGrupos.value = false
  }
}

const onSearch = () => {
  subgrupoStore.fetchSubgrupos()
}

const openForm = (item = null) => {
  selectedItem.value = item
  if (item) {
    form.value = {
      grupo_id: item.grupo_id || item.grupo?.id,
      codigo: item.codigo,
      descripcion: item.descripcion,
    }
  } else {
    form.value = {
      grupo_id: null,
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
    ? await subgrupoStore.updateSubgrupo(selectedItem.value.id, form.value)
    : await subgrupoStore.createSubgrupo(form.value)

  loading.value = false

  if (success) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Subgrupo actualizado' : 'Subgrupo creado',
    })
    closeForm()
  } else {
    $q.notify({ type: 'negative', message: subgrupoStore.error })
  }
}

const confirmDelete = async (id) => {
  const res = await Swal.fire({
    title: 'Confirmar',
    text: '¿Eliminar este subgrupo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e53935',
    cancelButtonColor: '#5a8f69',
  })
  if (res.isConfirmed) {
    const ok = await subgrupoStore.deleteSubgrupo(id)
    if (ok) await Swal.fire('Eliminado', 'El subgrupo fue eliminado', 'success')
    else await Swal.fire('Error', subgrupoStore.error || 'No se pudo eliminar', 'error')
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
</script>

<style scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
}

.btn-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  color: white;
  font-weight: 600;
}

.btn-green:hover {
  background: linear-gradient(135deg, #4a7f59 0%, #2d5f3d 100%);
}
</style>
