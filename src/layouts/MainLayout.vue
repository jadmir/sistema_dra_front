<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Sistema Dra </q-toolbar-title>

        <div class="text-subtitle2 q-mr-md">
          {{ welcomeText }}
        </div>

        <q-space />

        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 220px">
              <!-- Nuevo: Cambiar contraseña -->
              <q-item clickable v-ripple @click="openChangePassword">
                <q-item-section avatar><q-icon name="lock_reset" /></q-item-section>
                <q-item-section>Cambiar contraseña</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-ripple @click="onLogout">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Sistema Dra</q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
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
            color="primary"
            label="Guardar"
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
const welcomeText = computed(() =>
  roleName.value
    ? `Bienvenido: ${fullName.value}, su rol es ${roleName.value}`
    : `Bienvenido: ${fullName.value}`,
)

function onLogout() {
  auth.logout()
  router.replace('/login')
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

// Grupo único "Admin Sistema"
const adminGroup = {
  title: 'Admin Sistema',
  icon: 'admin_panel_settings',
  children: [
    { title: 'Usuarios', caption: 'Gestión de usuarios', icon: 'group', to: '/usuarios' },
    { title: 'Roles', caption: 'Gestión de roles', icon: 'security', to: '/roles' },
    {
      title: 'Variedad Animal',
      caption: 'Gestión de Variedad Animal',
      icon: 'pets',
      to: '/variedadAnimal',
    },
    {
      title: 'Destinos',
      caption: 'Gestión de Destinos',
      icon: 'place',
      to: '/destinos',
    },
    {
      title: 'Natalidad/Mortalidad',
      caption: 'Gestión de Natalidad y Mortalidad',
      icon: 'healing',
      to: '/natalidad-mortalidad',
    },
    {
      title: 'Registro Pecuario',
      caption: 'Gestión de registros pecuarios',
      icon: 'agriculture',
      to: '/registro-pecuario',
    },
  ],
}

// Define tus otros enlaces aquí (o déjalo vacío si no los usas)
const baseLinks = [
  // { title: 'Inicio', caption: 'Dashboard', icon: 'home', to: '/' },
]

// Lista final sin duplicados
const linksList = computed(() => {
  const list = [adminGroup, ...baseLinks]
  const byTitle = new Map()
  for (const l of list) if (!byTitle.has(l.title)) byTitle.set(l.title, l)
  return Array.from(byTitle.values())
})
</script>
