<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 360px; max-width: 700px">
      <q-card-section class="bg-gradient-green text-white">
        <div class="text-h6">{{ isEdit ? 'Editar Variedad Animal' : 'Nueva Variedad Animal' }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.nombre"
                label="Nombre"
                outlined
                dense
                lazy-rules
                :rules="[
                  (v) => !!v || 'El nombre es obligatorio',
                  (v) => (v && v.length <= 150) || 'Máx 150 caracteres',
                ]"
                autocomplete="off"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.descripcion"
                label="Descripción"
                type="textarea"
                autogrow
                outlined
                dense
                maxlength="1000"
              />
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup @click="close" />
            <q-btn
              class="btn-green"
              :label="isEdit ? 'Actualizar' : 'Guardar'"
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
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useVariedadAnimalStore } from 'stores/variedadAnimal'

const props = defineProps({
  variedad: { type: Object, default: null },
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const store = useVariedadAnimalStore()
const $q = useQuasar()

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  estado: true,
})

const isEdit = computed(() => !!props.variedad)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.variedad) {
        form.value = {
          id: props.variedad.id ?? null,
          nombre: props.variedad.nombre ?? '',
          descripcion: props.variedad.descripcion ?? '',
          estado: props.variedad.estado ?? true,
        }
      } else {
        resetForm()
      }

      nextTick(() => formRef.value?.resetValidation())
    }
  },
)

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    $q.notify({ type: 'warning', message: 'Corrige los campos marcados' })
    return
  }

  loading.value = true
  const payload = {
    nombre: String(form.value.nombre).trim(),
    descripcion: form.value.descripcion ? String(form.value.descripcion).trim() : null,
    estado: !!form.value.estado,
  }

  let ok = false
  if (isEdit.value) {
    ok = await store.updateVariedad(form.value.id, payload)
  } else {
    ok = await store.createVariedad(payload)
  }

  loading.value = false

  if (ok) {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Variedad actualizada' : 'Variedad creada',
    })
    emit('saved')
    open.value = false
  } else {
    $q.notify({ type: 'negative', message: store.error || 'No se pudo guardar la variedad' })
  }
}

function resetForm() {
  form.value = { id: null, nombre: '', descripcion: '', estado: true }
  nextTick(() => formRef.value?.resetValidation())
}

function close() {
  resetForm()
  emit('close')
  open.value = false
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
