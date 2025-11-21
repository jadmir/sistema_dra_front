<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-medium text-grey-8">
            <q-icon name="admin_panel_settings" color="green-7" size="sm" class="q-mr-sm" />
            Gestión de Roles
          </div>
          <div class="text-caption text-grey-6">Administra los roles del sistema</div>
        </div>
        <div class="col-auto gt-xs">
          <q-btn
            v-can="PERMISSIONS.ROLES_CREATE"
            unelevated
            color="green-7"
            icon="add"
            label="Nuevo Rol"
            @click="openForm()"
          />
        </div>
      </div>

      <!-- Botón móvil -->
      <div class="row q-mb-md lt-sm" v-can="PERMISSIONS.ROLES_CREATE">
        <div class="col-12">
          <q-btn
            unelevated
            color="green-7"
            icon="add"
            label="Nuevo Rol"
            @click="openForm()"
            class="full-width"
          />
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <q-card class="q-mb-md">
        <q-card-section class="q-pa-md">
          <q-input
            v-model="roleStore.search"
            placeholder="Buscar rol..."
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
      <q-card flat bordered>
        <q-table
          :rows="roleStore.roles"
          :columns="columns"
          row-key="id"
          :loading="roleStore.loading"
          v-model:pagination="roleStore.pagination"
          @request="onRequest"
          :rows-per-page-options="[5, 10, 20]"
          :grid="isMobile"
          :dense="isMobile"
          flat
        >
          <!-- Desktop: acciones -->
          <template #body-cell-actions="props">
            <q-td align="center">
              <q-btn
                v-can="PERMISSIONS.ROLES_ASSIGN_PERMISSIONS"
                round
                dense
                flat
                icon="key"
                color="orange-7"
                @click="openPermissions(props.row)"
              >
                <q-tooltip>Permisos</q-tooltip>
              </q-btn>
              <q-btn
                v-can="PERMISSIONS.ROLES_EDIT"
                round
                dense
                flat
                icon="edit"
                color="green-7"
                @click="openForm(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-can="PERMISSIONS.ROLES_DELETE"
                round
                dense
                flat
                icon="delete"
                color="red-6"
                @click="confirmDelete(props.row.id)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Móvil: tarjetas (abre modal al tocar la tarjeta) -->
          <template #item="props">
            <div class="q-pa-xs col-12">
              <q-card bordered class="cursor-pointer" @click="openDetail(props.row)">
                <q-card-section class="q-pb-none">
                  <div class="text-subtitle1 text-weight-bold">{{ props.row.nombre }}</div>
                  <div class="text-caption text-grey-7">ID: {{ props.row.id }}</div>
                </q-card-section>

                <q-separator inset />

                <q-card-actions align="right">
                  <q-btn
                    v-can="PERMISSIONS.ROLES_ASSIGN_PERMISSIONS"
                    round
                    dense
                    flat
                    icon="key"
                    color="orange-7"
                    @click.stop="openPermissions(props.row)"
                  >
                    <q-tooltip>Permisos</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-can="PERMISSIONS.ROLES_EDIT"
                    round
                    dense
                    flat
                    icon="edit"
                    color="green-7"
                    @click.stop="openForm(props.row)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-can="PERMISSIONS.ROLES_DELETE"
                    round
                    dense
                    flat
                    icon="delete"
                    color="red-6"
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

      <!-- Modal detalle (móvil) -->
      <q-dialog v-model="detailOpen">
        <q-card style="max-width: 520px; width: 100%">
          <q-card-section class="bg-gradient-green text-white">
            <div class="row items-center q-gutter-sm">
              <q-avatar color="white" text-color="green-7" class="text-weight-bold">
                {{ roleInitials(detailRole) }}
              </q-avatar>
              <div class="text-h6">
                {{ detailRole?.nombre || 'Rol' }}
              </div>
              <q-space />
              <q-btn icon="close" flat round dense color="white" v-close-popup />
            </div>
          </q-card-section>

          <q-separator />

          <q-list dense>
            <q-item>
              <q-item-section>ID</q-item-section>
              <q-item-section side>{{ detailRole?.id }}</q-item-section>
            </q-item>
          </q-list>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
            <q-btn
              v-can="PERMISSIONS.ROLES_ASSIGN_PERMISSIONS"
              color="orange-7"
              label="Permisos"
              icon="key"
              @click="openPermsFromDetail"
            />
            <q-btn
              v-can="PERMISSIONS.ROLES_EDIT"
              class="btn-green"
              label="Editar"
              icon="edit"
              @click="openFormFromDetail"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modales -->
      <role-form v-model="showForm" :role="selectedRole" @saved="reload" @close="closeForm" />
      <role-permissions
        v-model="showPerms"
        :role="selectedRole"
        @saved="reload"
        @close="closePerms"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoleStore } from 'stores/roles'
import { useQuasar } from 'quasar'
import Swal from 'sweetalert2'
import RoleForm from '../Roles/RoleForm.vue'
import RolePermissions from '../Roles/RolePermissions.vue'
import { PERMISSIONS } from 'src/utils/permissions'

const roleStore = useRoleStore()
const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md)

const showForm = ref(false)
const showPerms = ref(false)
const selectedRole = ref(null)

// NUEVO: estado detalle para móvil
const detailOpen = ref(false)
const detailRole = ref(null)

function openDetail(row) {
  detailRole.value = row
  detailOpen.value = true
}
function openFormFromDetail() {
  const row = detailRole.value
  detailOpen.value = false
  if (row) openForm(row)
}
function openPermsFromDetail() {
  const row = detailRole.value
  detailOpen.value = false
  if (row) openPermissions(row)
}
function roleInitials(r) {
  return (r?.nombre?.[0] || 'R').toUpperCase()
}

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

onMounted(() => {
  roleStore.fetchRoles({
    page: roleStore.pagination.page,
    rowsPerPage: roleStore.pagination.rowsPerPage,
  })
})

const openForm = (role = null) => {
  selectedRole.value = role
  showForm.value = true
}
const openPermissions = (role) => {
  selectedRole.value = role
  showPerms.value = true
}
const closeForm = () => (showForm.value = false)
const closePerms = () => (showPerms.value = false)
const reload = () => {
  roleStore.fetchRoles({
    page: roleStore.pagination.page,
    rowsPerPage: roleStore.pagination.rowsPerPage,
  })
}

const onSearch = (q) => {
  roleStore.setSearch(q)
  roleStore.fetchRoles({
    page: 1,
    rowsPerPage: roleStore.pagination.rowsPerPage,
  })
}

const onRequest = (props) => {
  const { page, rowsPerPage } = props.pagination
  roleStore.fetchRoles({ page, rowsPerPage })
}

const confirmDelete = async (id) => {
  const res = await Swal.fire({
    title: 'Confirmar',
    text: '¿Eliminar este rol?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e53935',
    cancelButtonColor: '#5a8f69',
  })
  if (res.isConfirmed) {
    const ok = await roleStore.deleteRole(id)
    if (ok) await Swal.fire('Eliminado', 'El rol fue eliminado', 'success')
    else await Swal.fire('Error', roleStore.error || 'No se pudo eliminar el rol', 'error')
  }
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
