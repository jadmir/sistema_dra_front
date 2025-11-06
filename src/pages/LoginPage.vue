<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg shadow-2 rounded-borders" style="width: 100%; max-width: 380px">
      <q-card-section>
        <div class="text-h6 text-center">Iniciar sesión</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            label="Correo electrónico"
            type="email"
            required
            class="q-mb-md"
            :rules="[
              val => !!val || 'Ingresa tu correo',
              val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Correo inválido'
            ]"
            autocomplete="email"
          />
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña"
            required
            class="q-mb-md"
            :rules="[val => !!val || 'Ingresa tu contraseña']"
            autocomplete="current-password"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Iniciar sesión"
            color="primary"
            class="full-width"
            :loading="auth.loading"
            :disable="auth.loading"
          />
        </q-form>
        <!-- Notificaciones con $q.notify en lugar de QBanner -->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const auth = useAuthStore()
const router = useRouter()

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
