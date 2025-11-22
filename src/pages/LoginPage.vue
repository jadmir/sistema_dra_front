<template>
  <q-page class="login-page flex flex-center">
    <!-- Background overlay -->
    <div class="login-overlay"></div>

    <!-- Login Card -->
    <q-card class="login-card shadow-24 rounded-borders">
      <!-- Header Section -->
      <q-card-section class="login-header text-center q-pb-md">
        <div class="login-icon-wrapper q-mb-md">
          <q-icon name="agriculture" size="64px" color="white" class="login-icon" />
        </div>
        <div class="text-h4 text-white text-weight-medium q-mb-xs">
          Dirección de Estadística e Información Agraria
        </div>
        <div class="text-subtitle1 text-white opacity-90">Gestión Pecuaria y Agrícola</div>
      </q-card-section>

      <!-- Form Section -->
      <q-card-section class="q-pa-lg bg-white">
        <div class="text-h6 text-grey-8 q-mb-md text-center">Iniciar Sesión</div>

        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Correo electrónico"
            type="email"
            required
            outlined
            dense
            :rules="[
              (val) => !!val || 'Ingresa tu correo',
              (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Correo inválido',
            ]"
            autocomplete="email"
          >
            <template #prepend>
              <q-icon name="mail" color="green-7" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña"
            required
            outlined
            dense
            :rules="[(val) => !!val || 'Ingresa tu contraseña']"
            autocomplete="current-password"
          >
            <template #prepend>
              <q-icon name="lock" color="green-7" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-6"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="q-mt-lg">
            <q-btn
              type="submit"
              label="Iniciar sesión"
              unelevated
              size="md"
              class="full-width text-weight-medium login-btn"
              :loading="auth.loading"
              :disable="auth.loading"
            >
              <template #loading>
                <q-spinner-dots size="20px" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <!-- Footer -->
      <q-card-section class="text-center q-pt-none q-pb-md bg-white">
        <div class="text-caption text-grey-6">
          © {{ currentYear }} Dirección de Estadística e Información Agraria - Todos los derechos
          reservados
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const auth = useAuthStore()
const router = useRouter()

const currentYear = computed(() => new Date().getFullYear())

const onSubmit = async () => {
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Bienvenido${auth.user?.firstName ? ', ' + auth.user.firstName : ''}`,
      position: 'top',
      timeout: 3000,
    })
    router.push('/')
  } else {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: auth.error || 'Credenciales inválidas',
      caption: 'Verifica tu correo y contraseña',
      position: 'top',
      timeout: 4000,
      actions: [{ label: 'Cerrar', color: 'white' }],
    })
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: linear-gradient(135deg, #5a8f69 0%, #2d5f3f 50%, #8b6f47 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.login-card {
  width: 100%;
  max-width: 420px;
  margin: 20px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-header {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  padding: 40px 20px 30px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }
}

.login-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
    z-index: -1;
  }
}

.login-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.opacity-90 {
  opacity: 0.9;
}

// Responsive adjustments
@media (max-width: 600px) {
  .login-card {
    margin: 10px;
    max-width: 100%;
  }

  .login-header {
    padding: 30px 20px 20px;
  }

  .text-h4 {
    font-size: 1.75rem;
  }

  .login-icon-wrapper {
    width: 80px;
    height: 80px;
  }

  .login-icon {
    font-size: 48px !important;
  }
}

// Input focus effects
:deep(.q-field--outlined.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px rgba(90, 143, 105, 0.2);
}

// Custom login button styling
.login-btn {
  background: linear-gradient(135deg, #5a8f69 0%, #3d6f4d 100%);
  color: white;
  font-size: 16px;
  padding: 12px 0;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:not(.q-btn--disable):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(90, 143, 105, 0.5);
    background: linear-gradient(135deg, #6aa77a 0%, #4a8060 100%);
  }

  &:not(.q-btn--disable):active {
    transform: translateY(0);
  }

  &.q-btn--disable {
    opacity: 0.6;
  }
}

// Button hover effect
:deep(.q-btn) {
  transition: all 0.3s ease;
}
</style>
