<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 400px; max-width: 500px">
      <q-card-section class="bg-gradient-green text-white">
        <div class="text-h6">
          <q-icon name="admin_panel_settings" size="sm" class="q-mr-sm" />
          {{ isEdit ? 'Editar Rol' : 'Nuevo Rol' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="onSubmit">
          <q-input
            v-model="form.nombre"
            label="Nombre del Rol"
            outlined
            dense
            :rules="[(v) => !!v || 'El nombre es requerido']"
          >
            <template #prepend>
              <q-icon name="label" color="green-7" />
            </template>
          </q-input>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup @click="$emit('close')" />
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
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoleStore } from 'stores/roles'
import { useQuasar } from 'quasar'

const props = defineProps({
  role: { type: Object, default: null },
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const roleStore = useRoleStore()
const $q = useQuasar()
const loading = ref(false)

const form = ref({ nombre: '' })
const isEdit = computed(() => !!props.role)

watch(
  () => props.role,
  (val) => {
    form.value.nombre = val?.nombre ?? ''
  },
  { immediate: true },
)

const onSubmit = async () => {
  loading.value = true
  const success = isEdit.value
    ? await roleStore.updateRole(props.role.id, form.value)
    : await roleStore.createRole(form.value)
  loading.value = false

  if (success) {
    $q.notify({ type: 'positive', message: 'Rol guardado correctamente' })
    emit('saved')
    open.value = false
  } else {
    $q.notify({ type: 'negative', message: roleStore.error })
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
