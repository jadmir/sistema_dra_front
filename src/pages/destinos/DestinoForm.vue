<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 360px; max-width: 700px">
      <q-card-section class="bg-gradient-green text-white">
        <div class="text-h6">{{ isEdit ? 'Editar destino' : 'Nuevo destino' }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input v-model="form.nombre" label="Nombre" outlined dense :rules="nombreRules" />
            </div>

            <div class="col-12">
              <q-input v-model="form.ubicacion" label="Ubicación" outlined dense maxlength="200" />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.descripcion"
                type="textarea"
                label="Descripción"
                outlined
                dense
                autogrow
              />
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup @click="close" />
            <q-btn class="btn-green" label="Guardar" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useDestinoStore } from 'src/stores/destino'

const props = defineProps({
  destino: { type: Object, default: null },
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const $q = useQuasar()
const store = useDestinoStore()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => !!props.destino)
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  nombre: '',
  ubicacion: '',
  descripcion: '',
})

const nombreRules = [
  (v) => !!v || 'El nombre es obligatorio',
  (v) => (v && v.length <= 150) || 'Máx 150 caracteres',
]

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.destino) {
        form.value = {
          nombre: props.destino.nombre ?? '',
          descripcion: props.destino.descripcion ?? '',
          ubicacion: props.destino.ubicacion ?? '',
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
    $q.notify({ type: 'warning', message: 'Corrige los campos' })
    return
  }

  loading.value = true
  const payload = {
    nombre: String(form.value.nombre).trim(),
    ubicacion: form.value.ubicacion ? String(form.value.ubicacion).trim() : null,
    descripcion: form.value.descripcion ? String(form.value.descripcion).trim() : null,
  }

  let ok = false
  if (isEdit.value) {
    ok = await store.updateDestino(props.destino.id, payload)
  } else {
    ok = await store.createDestino(payload)
  }

  loading.value = false

  if (ok) {
    emit('saved')
    open.value = false
  } else {
    $q.notify({ type: 'negative', message: store.error || 'No se pudo guardar' })
  }
}

function resetForm() {
  form.value = {
    nombre: '',
    descripcion: '',
    ubicacion: '',
  }
  nextTick(() => formRef.value?.resetValidation())
}

function close() {
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
