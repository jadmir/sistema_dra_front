<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 400px; max-width: 700px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          {{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <!-- DNI -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="dniModel"
                label="DNI"
                outlined
                dense
                type="tel"
                inputmode="numeric"
                maxlength="8"
                lazy-rules
                :rules="[requiredDigits8]"
              />
            </div>

            <!-- Celular -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="celularModel"
                label="Celular"
                outlined
                dense
                type="tel"
                inputmode="numeric"
                maxlength="9"
                lazy-rules
                :rules="[requiredDigits9]"
              />
            </div>

            <!-- Nombre -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nombre"
                label="Nombre"
                outlined
                dense
                lazy-rules
                :rules="[(v) => !!v || 'El nombre es requerido']"
              />
            </div>

            <!-- Apellido -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.apellido"
                label="Apellido"
                outlined
                dense
                lazy-rules
                :rules="[(v) => !!v || 'El apellido es requerido']"
              />
            </div>

            <!-- Email -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                outlined
                dense
                lazy-rules
                :rules="[
                  (v) => !!v || 'El email es requerido',
                  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) || 'Email inválido',
                ]"
                autocomplete="email"
              />
            </div>

            <!-- Dirección -->
            <div class="col-12 col-md-6">
              <q-input v-model="form.direccion" label="Dirección" outlined dense />
            </div>

            <!-- Contraseña (solo en crear) -->
            <div class="col-12" v-if="!isEdit">
              <q-input
                v-model="form.password"
                label="Contraseña"
                type="password"
                outlined
                dense
                autocomplete="new-password"
                lazy-rules
                :rules="[
                  (v) => !!v || 'La contraseña es requerida',
                  (v) => String(v).length >= 6 || 'Mínimo 6 caracteres',
                ]"
              />
            </div>

            <!-- Rol -->
            <div class="col-12">
              <q-select
                v-model="form.rol_id"
                :options="roles"
                label="Rol"
                outlined
                dense
                emit-value
                map-options
                :rules="[(v) => !!v || 'El rol es requerido']"
                :loading="loadingRoles"
                :disable="loadingRoles"
              >
                <template #no-option>
                  <q-item><q-item-section>No hay roles disponibles</q-item-section></q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Botones -->
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup @click="$emit('close')" />
            <q-btn color="primary" :label="isEdit ? 'Actualizar' : 'Guardar'" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from 'stores/users'
import { useQuasar } from 'quasar'
import { roleService } from 'src/services/roleService'

const props = defineProps({
  user: { type: Object, default: null },
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const userStore = useUserStore()
const $q = useQuasar()

const formRef = ref(null)
const loading = ref(false)
const loadingRoles = ref(false)
const roles = ref([])

// Estado del formulario
const form = ref({
  email: '',
  dni: '',
  nombre: '',
  apellido: '',
  direccion: '',
  celular: '',
  password: '',
  rol_id: null,
})

const isEdit = computed(() => !!props.user)

// Utilidades de validación
const digits = (v) => String(v ?? '').replace(/\D/g, '')
const requiredDigits8 = (v) => {
  const d = digits(v)
  return (d.length > 0 && d.length === 8) || (d.length === 0 ? 'El DNI es requerido' : 'DNI debe tener 8 dígitos')
}
const requiredDigits9 = (v) => {
  const d = digits(v)
  return (d.length > 0 && d.length === 9) || (d.length === 0 ? 'El celular es requerido' : 'Celular debe tener 9 dígitos')
}

// Modelos saneados (siempre solo dígitos y con límite)
const dniModel = computed({
  get: () => String(form.value.dni ?? ''),
  set: (v) => { form.value.dni = digits(v).slice(0, 8) },
})
const celularModel = computed({
  get: () => String(form.value.celular ?? ''),
  set: (v) => { form.value.celular = digits(v).slice(0, 9) },
})

// Cargar datos al editar y resetear validaciones
watch(
  () => props.user,
  async (val) => {
    if (val) {
      form.value = {
        email: val.email ?? '',
        dni: digits(val.dni).slice(0, 8),
        nombre: val.nombre ?? '',
        apellido: val.apellido ?? '',
        direccion: val.direccion ?? '',
        celular: digits(val.celular).slice(0, 9),
        password: '',
        rol_id: val.rol_id ?? val.rol?.id ?? null,
      }
    } else {
      form.value = { email: '', dni: '', nombre: '', apellido: '', direccion: '', celular: '', password: '', rol_id: null }
    }
    await nextTick()
    formRef.value?.resetValidation()
  },
  { immediate: true }
)

// Cargar roles del backend
onMounted(async () => {
  loadingRoles.value = true
  try {
    const list = await roleService.getAll()
    roles.value = list.map((r) => ({ label: r.nombre, value: r.id }))
  } catch (err) {
    console.error('Error cargando roles', err?.response || err)
    $q.notify({
      type: 'negative',
      message: err?.response?.data?.message || err?.message || 'No se pudieron cargar los roles',
    })
  } finally {
    loadingRoles.value = false
  }
})

// Enviar formulario con validación
const onSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) {
    $q.notify({ type: 'warning', message: 'Corrige los campos marcados' })
    return
  }

  loading.value = true

  const payload = {
    email: String(form.value.email).trim(),
    dni: String(form.value.dni),
    nombre: form.value.nombre.trim(),
    apellido: form.value.apellido.trim(),
    direccion: form.value.direccion.trim(),
    celular: String(form.value.celular),
    rol_id: form.value.rol_id,
  }
  if (!isEdit.value) payload.password = form.value.password

  const success = isEdit.value
    ? await userStore.updateUser(props.user.id, payload)
    : await userStore.createUser(payload)

  loading.value = false

  if (success) {
    $q.notify({ type: 'positive', message: isEdit.value ? 'Usuario actualizado' : 'Usuario creado' })
    emit('saved')
    open.value = false
  } else {
    const msg =
      userStore.error ||
      'Error al guardar usuario'
    $q.notify({ type: 'negative', message: msg })
  }
}
</script>
