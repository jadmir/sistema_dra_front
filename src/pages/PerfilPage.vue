<template>
  <q-page padding>
    <!-- Loading spinner -->
    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner-dots color="green-7" size="50px" />
    </div>

    <!-- Contenido del perfil -->
    <div v-else class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="shadow-2">
          <!-- Header -->
          <q-card-section class="bg-gradient-green text-white">
            <div class="text-center">
              <q-avatar
                size="100px"
                color="white"
                text-color="green-8"
                class="text-h4 text-weight-bold q-mb-md"
              >
                {{ userInitials }}
              </q-avatar>
              <div class="text-h5 text-weight-medium">{{ fullName }}</div>
              <div class="text-subtitle1 opacity-90">{{ roleName }}</div>
            </div>
          </q-card-section>

          <!-- Información del perfil -->
          <q-card-section>
            <div class="text-h6 q-mb-md text-grey-8">
              <q-icon name="person" color="green-7" class="q-mr-sm" />
              Información Personal
            </div>

            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="badge" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Nombre completo</q-item-label>
                  <q-item-label>{{ fullName }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="fingerprint" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>DNI</q-item-label>
                  <q-item-label>{{ user?.dni || 'No especificado' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="email" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Correo electrónico</q-item-label>
                  <q-item-label>{{ user?.email || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="phone" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Celular</q-item-label>
                  <q-item-label>{{ user?.celular || 'No especificado' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="home" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Dirección</q-item-label>
                  <q-item-label>{{ user?.direccion || 'No especificado' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="security" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Rol</q-item-label>
                  <q-item-label>{{ roleName || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="user?.created_at">
                <q-item-section avatar>
                  <q-icon name="event" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Fecha de registro</q-item-label>
                  <q-item-label>{{ formatDate(user.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <!-- Permisos (solo si existen) -->
          <q-card-section v-if="permissions.length > 0">
            <div class="text-h6 q-mb-md text-grey-8">
              <q-icon name="verified_user" color="green-7" class="q-mr-sm" />
              Permisos Asignados
            </div>

            <q-list bordered separator class="rounded-borders">
              <q-item v-for="permiso in permissions" :key="permiso.id" class="permission-item">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ permiso.nombre }}</q-item-label>
                  <q-item-label caption>{{
                    permiso.descripcion || 'Sin descripción'
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <!-- Acciones -->
          <q-card-actions align="center" class="q-pa-md q-gutter-sm">
            <q-btn outline color="green-7" icon="arrow_back" label="Volver" @click="goBack" />
            <q-btn
              unelevated
              color="green-7"
              icon="edit"
              label="Editar Perfil"
              @click="openEditDialog"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Diálogo de edición de perfil -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="width: 100%; max-width: 600px">
        <q-card-section>
          <div class="text-h6">Editar Perfil</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md" style="max-height: 60vh; overflow-y: auto">
          <q-form ref="formRef" @submit.prevent="submitUpdate">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formData.nombre"
                  label="Nombre *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'El nombre es requerido']"
                >
                  <template #prepend>
                    <q-icon name="person" color="green-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formData.apellido"
                  label="Apellido *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'El apellido es requerido']"
                >
                  <template #prepend>
                    <q-icon name="person" color="green-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="formData.email"
                  label="Correo electrónico *"
                  type="email"
                  outlined
                  dense
                  :rules="[
                    (v) => !!v || 'El email es requerido',
                    (v) => /.+@.+\..+/.test(v) || 'Email inválido',
                  ]"
                >
                  <template #prepend>
                    <q-icon name="email" color="green-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="formData.dni"
                  label="DNI *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'El DNI es requerido']"
                >
                  <template #prepend>
                    <q-icon name="fingerprint" color="green-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input v-model="formData.celular" label="Celular (opcional)" outlined dense>
                  <template #prepend>
                    <q-icon name="phone" color="green-7" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model="formData.direccion"
                  label="Dirección (opcional)"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                >
                  <template #prepend>
                    <q-icon name="home" color="green-7" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" :disable="saving" @click="closeEditDialog" />
          <q-btn
            unelevated
            label="Guardar"
            class="btn-green"
            :loading="saving"
            :disable="saving"
            @click="submitUpdate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { date, useQuasar } from 'quasar'
import perfilService from 'src/services/perfilService'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const perfilData = ref(null)
const editDialog = ref(false)
const saving = ref(false)
const formRef = ref(null)
const formData = ref({
  nombre: '',
  apellido: '',
  email: '',
  dni: '',
  celular: '',
  direccion: '',
})

// Cargar perfil desde el backend
onMounted(async () => {
  await loadPerfil()
})

const loadPerfil = async () => {
  loading.value = true
  try {
    const response = await perfilService.getPerfil()
    perfilData.value = response.usuario
    console.log('Perfil cargado desde backend:', perfilData.value)
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el perfil',
      caption: error?.response?.data?.message || 'Intenta nuevamente',
    })
  } finally {
    loading.value = false
  }
}

const openEditDialog = () => {
  // Cargar datos actuales en el formulario
  formData.value = {
    nombre: user.value?.nombre || '',
    apellido: user.value?.apellido || '',
    email: user.value?.email || '',
    dni: user.value?.dni || '',
    celular: user.value?.celular || '',
    direccion: user.value?.direccion || '',
  }
  editDialog.value = true
}

const closeEditDialog = () => {
  editDialog.value = false
  formRef.value?.resetValidation()
}

const submitUpdate = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    const response = await perfilService.actualizarPerfil(formData.value)

    $q.notify({
      type: 'positive',
      message: response.message || 'Perfil actualizado correctamente',
      icon: 'check_circle',
    })

    // Recargar perfil
    await loadPerfil()

    // Actualizar el localStorage si es necesario
    if (auth.user) {
      auth.user = { ...auth.user, ...formData.value }
      localStorage.setItem('user', JSON.stringify(auth.user))
    }

    closeEditDialog()
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (error?.response?.data?.errors &&
        Object.values(error.response.data.errors).flat().join(', ')) ||
      'Error al actualizar el perfil'

    $q.notify({
      type: 'negative',
      message: errorMsg,
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const user = computed(() => perfilData.value || auth.user)
const roleName = computed(() => user.value?.rol?.nombre || 'Sin rol')
const fullName = computed(() => {
  const nombre = user.value?.nombre || ''
  const apellido = user.value?.apellido || ''
  return [nombre, apellido].filter(Boolean).join(' ') || 'Usuario'
})

const userInitials = computed(() => {
  const nombre = user.value?.nombre || ''
  const apellido = user.value?.apellido || ''
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  return inicialNombre + inicialApellido || 'U'
})

const permissions = computed(() => {
  return user.value?.rol?.permisos || []
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(dateString, 'DD/MM/YYYY')
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
}

.opacity-90 {
  opacity: 0.9;
}

// Efecto hover en los items de permisos
.permission-item {
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(90, 143, 105, 0.05);
  }
}

// Estilo para el badge de estado
:deep(.q-badge) {
  font-weight: 500;
  padding: 4px 12px;
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
</style>
