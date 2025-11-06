<template>
  <q-page padding>
    <!-- Título centrado -->
    <div class="row justify-center q-mb-sm">
      <div class="text-h5 text-weight-bold text-center">Gestión de Usuarios</div>
    </div>

    <!-- Barra de búsqueda + botón (responsive) -->
    <div class="row q-col-gutter-sm items-center justify-center justify-sm-between q-mb-md">
      <div class="col-12 col-sm-6">
        <q-input
          dense
          outlined
          debounce="500"
          placeholder="Buscar usuario..."
          v-model="userStore.search"
          @update:model-value="onSearch"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-sm-auto">
        <q-btn color="primary" label="Nuevo usuario" class="full-width" @click="openForm()" />
      </div>
    </div>

    <!-- usa isMobile para activar vista grid/dense en móvil -->
    <q-table
      :rows="userStore.users"
      :columns="columns"
      row-key="id"
      :loading="userStore.loading"
      v-model:pagination="userStore.pagination"
      @request="onRequest"
      :rows-per-page-options="[5, 10, 20]"
      :grid="isMobile"
      :dense="isMobile"
      flat
      bordered
    >
      <!-- Desktop: chip de rol -->
      <template #body-cell-rol_id="props">
        <q-td align="center">
          <q-chip
            :color="roleName(props.row) === 'Administrador' ? 'primary' : 'secondary'"
            text-color="white"
            size="sm"
          >
            {{ roleName(props.row) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Desktop: acciones -->
      <template #body-cell-actions="props">
        <q-td align="center">
          <q-btn dense flat icon="edit" color="primary" @click="openForm(props.row)" />
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row.id)" />
        </q-td>
      </template>

      <!-- Móvil: tarjetas -->
      <template #item="props">
        <div class="q-pa-xs col-12">
          <!-- Abre detalle al tocar la tarjeta -->
          <q-card bordered class="cursor-pointer" @click="openDetail(props.row)">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1">{{ props.row.nombre }} {{ props.row.apellido }}</div>
              <div class="text-caption text-grey-7">{{ props.row.email }}</div>
            </q-card-section>

            <q-separator inset />

            <q-list dense>
              <q-item>
                <q-item-section>ID</q-item-section>
                <q-item-section side>{{ props.row.id }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>DNI</q-item-section>
                <q-item-section side>{{ props.row.dni }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Celular</q-item-section>
                <q-item-section side>{{ props.row.celular }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Rol</q-item-section>
                <q-item-section side>
                  <q-chip :color="roleName(props.row) === 'Administrador' ? 'primary' : 'secondary'" text-color="white" size="sm">
                    {{ roleName(props.row) }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>

            <q-card-actions align="right">
              <!-- Evita abrir el modal al hacer click en estos botones -->
              <q-btn dense flat icon="edit" color="primary" @click.stop="openForm(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click.stop="confirmDelete(props.row.id)" />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>

    <!-- Modal de detalle -->
    <q-dialog v-model="detailOpen">
      <q-card style="max-width: 520px; width: 100%">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar color="primary" text-color="white">{{ initials(detailUser) }}</q-avatar>
          <div class="text-h6">
            {{ detailUser?.nombre }} {{ detailUser?.apellido }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-list dense>
          <q-item>
            <q-item-section>Email</q-item-section>
            <q-item-section side>{{ detailUser?.email }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>DNI</q-item-section>
            <q-item-section side>{{ detailUser?.dni }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Celular</q-item-section>
            <q-item-section side>{{ detailUser?.celular }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Dirección</q-item-section>
            <q-item-section side>{{ detailUser?.direccion || '—' }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Rol</q-item-section>
            <q-item-section side>{{ roleName(detailUser || {}) }}</q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn color="primary" label="Editar" @click="openFormFromDetail" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Crear/Editar -->
    <user-form v-model="showForm" :user="selectedUser" @saved="reload" @close="closeForm" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from 'stores/users'
import Swal from 'sweetalert2'
import UserForm from './UserForm.vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md) // ahora se usa en q-table
const userStore = useUserStore()

const showForm = ref(false)
const selectedUser = ref(null)
const detailOpen = ref(false)
const detailUser = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'dni', label: 'DNI', field: 'dni', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'apellido', label: 'Apellido', field: 'apellido', align: 'left' },
  { name: 'celular', label: 'Celular', field: 'celular', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'rol_id', label: 'Rol', field: 'rol_id', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

// Mapa id->nombre de rol
const roleMap = computed(() => {
  const m = {}
  for (const r of userStore.roles || []) m[r.id] = r.nombre
  return m
})
const roleName = (row) => row.rol?.nombre || roleMap.value[row.rol_id] || '—'

// Cargar usuarios y roles
onMounted(async () => {
  await Promise.all([userStore.fetchUsers(), userStore.fetchRoles()])
})

const openForm = (user = null) => {
  selectedUser.value = user
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedUser.value = null
}

const reload = async () => {
  showForm.value = false
  selectedUser.value = null
  await userStore.fetchUsers(userStore.pagination.page)
}

const confirmDelete = (id) => {
  Swal.fire({
    title: 'Eliminar usuario',
    text: '¿Deseas eliminar este usuario?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonColor: '#c10015',
    cancelButtonColor: '#1976d2',
  }).then(async (r) => {
    if (!r.isConfirmed) return
    const ok = await userStore.deleteUser(id)
    if (ok)
      Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado',
        timer: 1500,
        showConfirmButton: false,
      })
    else
      Swal.fire({ icon: 'error', title: 'Error', text: userStore.error || 'No se pudo eliminar' })
  })
}

const onSearch = () => userStore.fetchUsers(1)
const onRequest = ({ pagination }) => userStore.fetchUsers(pagination.page)

function openDetail(row) {
  detailUser.value = row
  detailOpen.value = true
}

function openFormFromDetail() {
  const row = detailUser.value
  detailOpen.value = false
  if (row) openForm(row)
}

function initials(u) {
  if (!u) return ''
  const str = [u.nombre, u.apellido].filter(Boolean).join(' ').trim()
  return str.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase()
}
</script>
