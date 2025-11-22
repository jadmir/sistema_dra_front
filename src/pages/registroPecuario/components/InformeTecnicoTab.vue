<template>
  <div>
    <q-form @submit.prevent>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input v-model="local.informante" label="Informante" dense outlined />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="local.tecnico" label="Técnico" dense outlined />
        </div>

        <div class="col-12 col-md-4">
          <q-input v-model="local.email" label="Email" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="local.telefono" label="Teléfono" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="local.cargo" label="Cargo" dense outlined />
        </div>

        <div class="col-12 col-md-4">
          <q-input v-model="local.fecha" type="date" label="Fecha" dense outlined />
        </div>

        <div class="col-12">
          <q-input
            type="textarea"
            v-model="local.observaciones"
            label="Observaciones"
            autogrow
            dense
            outlined
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue'])

const local = ref({
  informante: '',
  email: '',
  telefono: '',
  cargo: '',
  tecnico: '',
  fecha: '',
  observaciones: '',
})

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      local.value = { ...v }
    }
  },
  { immediate: true, deep: true },
)

watch(
  local,
  (v) => {
    if (JSON.stringify(v) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', { ...v })
    }
  },
  { deep: true },
)
</script>
