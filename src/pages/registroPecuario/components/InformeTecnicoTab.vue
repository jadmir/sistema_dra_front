<template>
  <div>
    <q-form @submit.prevent>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="local.informante"
            label="Informante"
            dense
            outlined
            clearable
            color="green-7"
            lazy-rules
            :rules="[(v) => !!v || 'El informante es requerido']"
          >
            <template #prepend>
              <q-icon name="person" color="green-7" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-6">
          <q-input
            v-model="local.tecnico"
            label="Técnico"
            dense
            outlined
            clearable
            color="green-7"
            lazy-rules
            :rules="[(v) => !!v || 'El Tecnico es requerido']"
          >
            <template #prepend>
              <q-icon name="engineering" color="green-7" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="local.email"
            label="Email"
            dense
            outlined
            clearable
            type="email"
            color="green-7"
          >
            <template #prepend>
              <q-icon name="mail" color="green-7" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="local.telefono"
            label="Teléfono"
            dense
            outlined
            clearable
            type="tel"
            color="green-7"
            lazy-rules
            :rules="[
              (v) => !!v || 'El teléfono es requerido',
              (v) => /^\d+$/.test(v) || 'Solo se permiten números',
            ]"
          >
            <template #prepend>
              <q-icon name="phone" color="green-7" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="local.cargo"
            label="Cargo"
            dense
            outlined
            clearable
            color="green-7"
            lazy-rules
            :rules="[(v) => !!v || 'El Cargo es requerido']"
          >
            <template #prepend>
              <q-icon name="badge" color="green-7" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="local.fecha"
            type="date"
            label="Fecha"
            dense
            outlined
            color="green-7"
            stack-label
            lazy-rules
            :rules="[(v) => !!v || 'La fecha es requerida']"
          >
            <template #prepend>
              <q-icon name="event" color="green-7" />
            </template>
          </q-input>
        </div>

        <div class="col-12">
          <q-input
            type="textarea"
            v-model="local.observaciones"
            label="Observaciones"
            autogrow
            dense
            outlined
            color="green-7"
          >
            <template #prepend>
              <q-icon name="notes" color="green-7" />
            </template>
          </q-input>
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
      local.value = { ...v, fecha: v.fecha ? v.fecha.substring(0, 10) : '' }
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
