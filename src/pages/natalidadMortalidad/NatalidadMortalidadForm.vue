<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 360px; max-width: 700px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ isEdit ? 'Editar registro' : 'Nuevo registro' }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.concepto"
                label="Concepto"
                outlined
                dense
                :rules="conceptoRules"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.observaciones"
                type="textarea"
                label="Observaciones"
                outlined
                dense
                autogrow
              />
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup @click="close" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useNatalidadStore } from 'src/stores/natalidadMortalidad'

const props = defineProps({
  registro: { type: Object, default: null },
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const $q = useQuasar()
const store = useNatalidadStore()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => !!props.registro)
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  concepto: '',
  observaciones: '',
})

const conceptoRules = [
  (v) => !!v || 'El concepto es obligatorio',
  (v) => (v && v.length <= 100) || 'Máx 100 caracteres',
]

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.registro) {
        form.value = {
          concepto: props.registro.concepto ?? '',
          observaciones: props.registro.observaciones ?? '',
        }
      } else {
        resetForm()
      }

      nextTick(() => formRef.value?.resetValidation())
    }
  },
  { immediate: true },
)

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    $q.notify({ type: 'warning', message: 'Corrige los campos' })
    return
  }

  loading.value = true
  const payload = {
    concepto: String(form.value.concepto).trim(),
    observaciones: form.value.observaciones ? String(form.value.observaciones).trim() : null,
  }

  let ok = false
  if (isEdit.value) {
    ok = await store.updateRegistro(props.registro.id, payload)
  } else {
    ok = await store.createRegistro(payload)
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
  form.value = { concepto: '', observaciones: '' }
  nextTick(() => formRef.value?.resetValidation())
}

function close() {
  emit('close')
  open.value = false
}
</script>

<style scoped></style>
