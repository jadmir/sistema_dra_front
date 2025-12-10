<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-gradient-green">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold system-title">
          <q-icon name="agriculture" size="sm" class="q-mr-xs" />
          <span class="title-text">Dirección de Estadística e Información Agraria</span>
        </q-toolbar-title>

        <q-space />

        <!-- Texto de bienvenida - Oculto en móvil, visible en desktop -->
        <div class="text-subtitle2 q-mr-md gt-xs">
          {{ welcomeText }}
        </div>

        <!-- En móvil, mostrar solo el nombre del usuario -->
        <div class="text-caption q-mr-sm lt-sm">
          {{ fullName }}
        </div>

        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 220px">
              <!-- Información del usuario (solo en móvil) -->
              <q-item class="lt-sm">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ fullName }}</q-item-label>
                  <q-item-label caption>{{ roleName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="lt-sm" />

              <!-- Perfil -->
              <q-item clickable v-ripple @click="goToProfile">
                <q-item-section avatar><q-icon name="person" color="green-7" /></q-item-section>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>
              <q-separator />

              <!-- Cambiar contraseña -->
              <q-item clickable v-ripple @click="openChangePassword">
                <q-item-section avatar><q-icon name="lock_reset" color="green-7" /></q-item-section>
                <q-item-section>Cambiar contraseña</q-item-section>
              </q-item>
              <q-separator />

              <!-- Cerrar sesión -->
              <q-item clickable v-ripple @click="onLogout">
                <q-item-section avatar><q-icon name="logout" color="red-6" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" :breakpoint="500">
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- Header del drawer con info del usuario -->
          <q-item class="q-mb-sm drawer-header">
            <q-item-section avatar>
              <q-avatar color="white" text-color="green-8" size="48px" class="text-weight-bold">
                {{ userInitials }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-white">{{ fullName }}</q-item-label>
              <q-item-label caption class="text-white opacity-90">{{ roleName }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-mb-md" />

          <!-- Enlaces del menú -->
          <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Diálogo Cambiar contraseña -->
    <q-dialog v-model="changePwdDialog" persistent>
      <q-card style="width: 100%; max-width: 480px">
        <q-card-section>
          <div class="text-h6">Cambiar contraseña</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form ref="pwdFormRef" @submit.prevent="submitChangePassword">
            <q-input
              v-model="currentPass"
              :type="showCurrent ? 'text' : 'password'"
              label="Contraseña actual"
              class="q-mb-md"
              :rules="[(v) => !!v || 'Requerido']"
              autocomplete="current-password"
            >
              <template #append>
                <q-icon
                  :name="showCurrent ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showCurrent = !showCurrent"
                />
              </template>
            </q-input>

            <q-input
              v-model="newPass"
              :type="showNew ? 'text' : 'password'"
              label="Nueva contraseña"
              class="q-mb-md"
              :rules="[
                (v) => !!v || 'Requerido',
                (v) => String(v).length >= 8 || 'Mínimo 8 caracteres',
              ]"
              autocomplete="new-password"
            >
              <template #append>
                <q-icon
                  :name="showNew ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNew = !showNew"
                />
              </template>
            </q-input>

            <q-input
              v-model="confirmPass"
              :type="showConfirm ? 'text' : 'password'"
              label="Confirmar nueva contraseña"
              class="q-mb-md"
              :rules="[(v) => v === newPass || 'No coincide']"
              autocomplete="new-password"
            >
              <template #append>
                <q-icon
                  :name="showConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirm = !showConfirm"
                />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="loadingChangePwd" @click="closeChangePassword" />
          <q-btn
            unelevated
            label="Guardar"
            class="btn-green"
            :loading="loadingChangePwd"
            :disable="loadingChangePwd"
            @click="submitChangePassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import EssentialLink from 'components/EssentialLink.vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()

const fullName = computed(
  () =>
    auth.fullName ||
    [auth.user?.nombre, auth.user?.apellido].filter(Boolean).join(' ') ||
    auth.user?.email ||
    'Usuario',
)
const roleName = computed(() => auth.roleName || auth.user?.rol?.nombre || '')

// Iniciales del usuario para el avatar
const userInitials = computed(() => {
  const nombre = auth.user?.nombre || ''
  const apellido = auth.user?.apellido || ''
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  return inicialNombre + inicialApellido || 'U'
})

const welcomeText = computed(() =>
  roleName.value
    ? `Bienvenido: ${fullName.value}, su rol es ${roleName.value}`
    : `Bienvenido: ${fullName.value}`,
)

function onLogout() {
  auth.logout()
  router.replace('/login')
}

function goToProfile() {
  router.push('/perfil')
}

const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// ========= NUEVO: Cambio de contraseña =========
const changePwdDialog = ref(false)
const pwdFormRef = ref(null)
const currentPass = ref('')
const newPass = ref('')
const confirmPass = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const loadingChangePwd = ref(false)

function resetPwdForm() {
  currentPass.value = ''
  newPass.value = ''
  confirmPass.value = ''
  showCurrent.value = false
  showNew.value = false
  showConfirm.value = false
}

function openChangePassword() {
  resetPwdForm()
  changePwdDialog.value = true
  nextTick(() => pwdFormRef.value?.resetValidation())
}

function closeChangePassword() {
  changePwdDialog.value = false
  resetPwdForm()
}

async function submitChangePassword() {
  const ok = await pwdFormRef.value?.validate()
  if (!ok) return
  loadingChangePwd.value = true
  try {
    const payload = {
      password_actual: String(currentPass.value),
      nueva_password: String(newPass.value),
      nueva_password_confirmation: String(confirmPass.value),
    }
    // PUT y fallback a PATCH si el backend lo requiere
    let res
    try {
      res = await api.put('/api/v1/perfil/password', payload)
    } catch (e) {
      if (e?.response?.status === 405) {
        res = await api.patch('/api/v1/perfil/password', payload)
      } else {
        throw e
      }
    }
    $q.notify({ type: 'positive', message: res?.data?.message || 'Contraseña actualizada' })
    closeChangePassword()
    // opcional: forzar re-login
    auth.logout()
    router.replace('/login')
  } catch (e) {
    const msg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      (e?.response?.data?.errors && Object.values(e.response.data.errors).flat().join(' ')) ||
      'No se pudo actualizar la contraseña'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loadingChangePwd.value = false
  }
}
// ========= fin cambio de contraseña =========

import { PERMISSIONS, hasPermission } from 'src/utils/permissions'

// Grupo único "Admin Sistema"
const adminGroup = {
  title: 'Admin Sistema',
  icon: 'admin_panel_settings',
  permission: PERMISSIONS.USERS_VIEW, // Se muestra si tiene algún permiso de usuarios o roles
  children: [
    {
      title: 'Usuarios',
      caption: 'Gestión de usuarios',
      icon: 'group',
      to: '/usuarios',
      permission: PERMISSIONS.USERS_VIEW,
    },
    {
      title: 'Roles',
      caption: 'Gestión de roles',
      icon: 'security',
      to: '/roles',
      permission: PERMISSIONS.ROLES_VIEW,
    },
    {
      title: 'Permisos',
      caption: 'Gestión de permisos',
      icon: 'verified_user',
      to: '/permisos',
      permission: PERMISSIONS.ROLES_VIEW,
    },
  ],
}

// NUEVO: Grupo "Pecuario"
const pecuarioGroup = {
  title: 'Pecuario',
  icon: 'agriculture',
  permission: PERMISSIONS.DATA_VIEW, // Se muestra si tiene permiso de ver datos
  children: [
    {
      title: 'Saca Clases',
      caption: 'Gestión de saca clases',
      icon: 'category',
      to: '/saca-clases',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Variedad Animal',
      caption: 'Gestión de Variedad Animal',
      icon: 'spa',
      to: '/variedadAnimal',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Destinos',
      caption: 'Gestión de Destinos',
      icon: 'place',
      to: '/destinos',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Natalidad/Mortalidad',
      caption: 'Gestión de Natalidad y Mortalidad',
      icon: 'healing',
      to: '/natalidad-mortalidad',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Registro Pecuario',
      caption: 'Gestión de registros pecuarios',
      icon: 'agriculture',
      to: '/registro-pecuario',
      permission: PERMISSIONS.DATA_VIEW,
    },
  ],
}

// NUEVO: Grupo "Agricultura"
const agriculturaGroup = {
  title: 'Agricola',
  icon: 'eco',
  permission: PERMISSIONS.DATA_VIEW,
  children: [
    {
      title: 'Registro Agrícola',
      caption: 'Gestión de registros agrícolas',
      icon: 'agriculture',
      children: [
        {
          title: 'Regiones',
          icon: 'map',
          to: { name: 'AgricolaRegiones' },
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Provincias',
          caption: 'Catálogo de provincias',
          icon: 'location_city',
          to: { name: 'AgricolaProvincias' },
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Distritos',
          caption: 'Catálogo de distritos',
          icon: 'location_city',
          to: { name: 'AgricolaDistritos' },
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Cultivos',
          caption: 'Catálogo de Cultivos Catalogo',
          icon: 'spa',
          to: { name: 'AgricolaCultivos' },
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Unidades',
          caption: 'Catálogo de Unidades',
          icon: 'straighten',
          to: { name: 'AgricolaUnidades' },
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Variable Catalogo',
          caption: 'Catálogo de Variable Catalogo',
          icon: 'tune',
          to: { name: 'AgricolaVariableCatalogo' },
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Registro Agrícola',
          caption: 'Gestión de registros agrícolas',
          icon: 'agriculture',
          to: { name: 'RegistroAgricola' },
          permission: PERMISSIONS.DATA_VIEW,
        },
      ],
    },
    {
      title: 'Agricultura',
      caption: 'Gestión de cultivos agrícolas',
      icon: 'agriculture',
      permission: PERMISSIONS.DATA_VIEW,
      children: [
        {
          title: 'Subsectores',
          caption: 'Gestión de subsectores',
          icon: 'category',
          to: '/agricultura/subsectores',
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Grupos',
          caption: 'Gestión de grupos',
          icon: 'workspaces',
          to: '/agricultura/grupos',
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Subgrupos',
          caption: 'Gestión de subgrupos',
          icon: 'account_tree',
          to: '/agricultura/subgrupos',
          permission: PERMISSIONS.DATA_VIEW,
        },
        {
          title: 'Cultivos',
          caption: 'Gestión de cultivos',
          icon: 'grass',
          to: '/agricultura/cultivos',
          permission: PERMISSIONS.DATA_VIEW,
        },
      ],
    },
  ],
}

// NUEVO: Grupo "Precios en Mercados"
const preciosGroup = {
  title: 'Precios en Mercados',
  icon: 'local_offer',
  permission: PERMISSIONS.DATA_VIEW,
  children: [
    {
      title: 'Registro de Muestras',
      caption: 'Registrar precios de mercados',
      icon: 'edit_note',
      to: '/precios/registro',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Validación',
      caption: 'Validar muestras pendientes',
      icon: 'verified',
      to: '/precios/validacion',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Reportes',
      caption: 'Ver reportes comparativos',
      icon: 'analytics',
      to: '/precios/reportes',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Productos',
      caption: 'Gestión de productos',
      icon: 'inventory_2',
      to: '/precios/productos',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Categorías',
      caption: 'Gestión de categorías',
      icon: 'category',
      to: '/precios/categorias',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Mercados',
      caption: 'Gestión de mercados',
      icon: 'store',
      to: '/precios/mercados',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Encuestadores',
      caption: 'Gestión de encuestadores',
      icon: 'badge',
      to: '/precios/encuestadores',
      permission: PERMISSIONS.DATA_VIEW,
    },
    {
      title: 'Productividad',
      caption: 'Reportes de encuestadores',
      icon: 'assessment',
      to: '/precios/productividad-encuestadores',
      permission: PERMISSIONS.DATA_VIEW,
    },
  ],
}

// Define tus otros enlaces aquí (o déjalo vacío si no los usas)
const baseLinks = [
  // { title: 'Inicio', caption: 'Dashboard', icon: 'home', to: '/' },
]

// Lista final filtrada por permisos
const linksList = computed(() => {
  const list = [adminGroup, pecuarioGroup, agriculturaGroup, preciosGroup, ...baseLinks]

  // Si es Administrador (rol_id = 1 O nombre = 'Administrador'), mostrar todo sin filtrar
  const isAdmin = auth.user?.rol?.nombre === 'Administrador' || auth.user?.rol_id === 1
  if (isAdmin) {
    return list
  }

  // Filtrar grupos y sus hijos según permisos
  return list
    .map((group) => {
      // Si el grupo tiene children, filtrarlos por permiso
      if (group.children) {
        const filteredChildren = group.children.filter((child) => {
          if (!child.permission) return true // Sin permiso requerido, mostrar siempre
          return hasPermission(auth.user, child.permission)
        })

        // Si no hay children visibles, no mostrar el grupo
        if (filteredChildren.length === 0) return null

        return { ...group, children: filteredChildren }
      }

      // Si es un enlace simple, verificar su permiso
      if (group.permission && !hasPermission(auth.user, group.permission)) return null

      return group
    })
    .filter(Boolean) // Remover nulls
})
</script>

<style lang="scss" scoped>
// Header con gradiente verde
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
}

// Título del sistema - sin truncar
.system-title {
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  .title-text {
    font-size: 0.95rem;
    line-height: 1.2;
    white-space: nowrap;

    @media (max-width: 1200px) {
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      font-size: 0.75rem;
    }

    @media (max-width: 480px) {
      font-size: 0.7rem;
    }
  }
}

// Header del drawer con gradiente
.drawer-header {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  border-radius: 8px;
  padding: 16px 12px;
}

.opacity-90 {
  opacity: 0.9;
}

// Botón verde personalizado
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

// Efecto hover en items del menú de usuario
:deep(.q-item) {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(90, 143, 105, 0.08);
  }
}
</style>
