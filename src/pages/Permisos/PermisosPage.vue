<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-medium text-grey-8">
            <q-icon name="verified_user" color="green-7" size="sm" class="q-mr-sm" />
            Gestión de Permisos
          </div>
          <div class="text-caption text-grey-6">Administra los permisos del sistema</div>
        </div>
        <div class="col-auto gt-xs">
          <q-btn
            v-can="'crear_roles'"
            unelevated
            color="green-7"
            icon="add"
            label="Nuevo Permiso"
            @click="openCreateDialog"
          />
        </div>
      </div>

      <!-- Botón móvil -->
      <div class="row q-mb-md lt-sm" v-can="'crear_roles'">
        <div class="col-12">
          <q-btn
            unelevated
            color="green-7"
            icon="add"
            label="Nuevo Permiso"
            @click="openCreateDialog"
            class="full-width"
          />
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <q-card class="q-mb-md">
        <q-card-section class="q-pa-md">
          <q-input
            v-model="searchTerm"
            placeholder="Buscar por nombre o descripción..."
            outlined
            dense
            clearable
            @update:model-value="onSearch"
            @clear="onClear"
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
          :rows="permisosStore.permisos"
          :columns="columns"
          row-key="id"
          :loading="permisosStore.loading"
          :pagination="permisosStore.pagination"
          @request="onRequest"
          binary-state-sort
          :grid="isMobile"
          :dense="isMobile"
          flat
          bordered
        >
          <!-- Desktop: acciones -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                v-can="'editar_roles'"
                flat
                dense
                round
                icon="edit"
                color="green-7"
                size="sm"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-can="'eliminar_roles'"
                flat
                dense
                round
                icon="delete"
                color="red-6"
                size="sm"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Móvil: tarjetas -->
          <template #item="props">
            <div class="q-pa-xs col-12">
              <!-- Abre detalle al tocar la tarjeta -->
              <q-card bordered class="cursor-pointer" @click="openDetail(props.row)">
                <q-card-section class="q-pb-none">
                  <div class="text-subtitle1 text-weight-bold">{{ props.row.nombre }}</div>
                  <div class="text-caption text-grey-7">
                    {{ props.row.descripcion || 'Sin descripción' }}
                  </div>
                </q-card-section>

                <q-separator inset />

                <q-list dense>
                  <q-item>
                    <q-item-section>ID</q-item-section>
                    <q-item-section side>{{ props.row.id }}</q-item-section>
                  </q-item>
                </q-list>

                <q-card-actions align="right">
                  <!-- Evita abrir el modal al hacer click en estos botones -->
                  <q-btn
                    v-can="'editar_roles'"
                    dense
                    flat
                    round
                    icon="edit"
                    color="green-7"
                    size="sm"
                    @click.stop="openEditDialog(props.row)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-can="'eliminar_roles'"
                    dense
                    flat
                    round
                    icon="delete"
                    color="red-6"
                    size="sm"
                    @click.stop="confirmDelete(props.row)"
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
          <q-avatar
            color="white"
            text-color="green-7"
            icon="verified_user"
            class="text-weight-bold"
          />
          <div class="text-h6">{{ detailPermiso?.nombre }}</div>
          <q-space />
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-list dense>
          <q-item>
            <q-item-section>ID</q-item-section>
            <q-item-section side>{{ detailPermiso?.id }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Nombre</q-item-section>
            <q-item-section side>{{ detailPermiso?.nombre }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Descripción</q-item-section>
            <q-item-section side>{{
              detailPermiso?.descripcion || 'Sin descripción'
            }}</q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn
            v-can="'editar_roles'"
            class="btn-green"
            label="Editar"
            icon="edit"
            @click="openEditFromDetail"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo Crear/Editar Permiso -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 100%; max-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Editar Permiso' : 'Nuevo Permiso' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="formRef" @submit.prevent="submitForm">
            <q-input
              v-model="formData.nombre"
              label="Nombre del permiso *"
              outlined
              dense
              class="q-mb-md"
              :rules="[(v) => !!v || 'El nombre es requerido']"
              hint="Ejemplo: ver_usuarios, crear_roles"
            >
              <template #prepend>
                <q-icon name="label" color="green-7" />
              </template>
            </q-input>

            <q-input
              v-model="formData.descripcion"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="3"
              hint="Describe qué permite hacer este permiso"
            >
              <template #prepend>
                <q-icon name="description" color="green-7" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="saving" @click="closeDialog" />
          <q-btn
            unelevated
            :label="isEdit ? 'Actualizar' : 'Crear'"
            class="btn-green"
            :loading="saving"
            :disable="saving"
            @click="submitForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo Confirmar Eliminación -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red-6" text-color="white" />
          <span class="q-ml-sm"
            >¿Estás seguro de eliminar el permiso <strong>{{ permisoToDelete?.nombre }}</strong
            >?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="deleting" @click="deleteDialog = false" />
          <q-btn
            unelevated
            label="Eliminar"
            color="red-6"
            :loading="deleting"
            :disable="deleting"
            @click="deletePermiso"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { usePermisosStore } from 'stores/permisos'

const $q = useQuasar()
const permisosStore = usePermisosStore()
const isMobile = computed(() => $q.screen.lt.md)

const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const deleting = ref(false)
const formRef = ref(null)
const permisoToDelete = ref(null)
const searchTerm = ref('')

// Modal de detalle para móvil
const detailOpen = ref(false)
const detailPermiso = ref(null)

const formData = ref({
  nombre: '',
  descripcion: '',
})

const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center',
  },
]

onMounted(() => {
  permisosStore.fetchPermisos()
})

const onSearch = async (value) => {
  permisosStore.search = value || ''
  await permisosStore.fetchPermisos()
}

const onClear = async () => {
  searchTerm.value = ''
  permisosStore.search = ''
  await permisosStore.fetchPermisos()
}

const onRequest = async (props) => {
  const { page, rowsPerPage } = props.pagination
  await permisosStore.fetchPermisos({
    page,
    per_page: rowsPerPage,
  })
}

const openCreateDialog = () => {
  isEdit.value = false
  formData.value = {
    nombre: '',
    descripcion: '',
  }
  dialog.value = true
}

const openEditDialog = (permiso) => {
  isEdit.value = true
  formData.value = {
    id: permiso.id,
    nombre: permiso.nombre,
    descripcion: permiso.descripcion,
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  formRef.value?.resetValidation()
}

const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      await permisosStore.updatePermiso(formData.value.id, formData.value)
      $q.notify({
        type: 'positive',
        message: 'Permiso actualizado correctamente',
        icon: 'check_circle',
      })
    } else {
      await permisosStore.createPermiso(formData.value)
      $q.notify({
        type: 'positive',
        message: 'Permiso creado correctamente',
        icon: 'check_circle',
      })
    }
    closeDialog()
  } catch (error) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Error al guardar el permiso'
    $q.notify({
      type: 'negative',
      message: errorMsg,
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (permiso) => {
  permisoToDelete.value = permiso
  deleteDialog.value = true
}

const deletePermiso = async () => {
  deleting.value = true
  try {
    await permisosStore.deletePermiso(permisoToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: 'Permiso eliminado correctamente',
      icon: 'check_circle',
    })
    deleteDialog.value = false
  } catch (error) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Error al eliminar el permiso'
    $q.notify({
      type: 'negative',
      message: errorMsg,
      icon: 'error',
    })
  } finally {
    deleting.value = false
  }
}

// Funciones para el modal de detalle
const openDetail = (permiso) => {
  detailPermiso.value = permiso
  detailOpen.value = true
}

const openEditFromDetail = () => {
  const permiso = detailPermiso.value
  detailOpen.value = false
  if (permiso) openEditDialog(permiso)
}
</script>

<style lang="scss" scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
}

.btn-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  color: white;
  transition: all 0.3s ease;

  &:hover:not(.q-btn--disable) {
    background: linear-gradient(135deg, #6aa77a 0%, #4a8060 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(90, 143, 105, 0.4);
  }
}
</style>
