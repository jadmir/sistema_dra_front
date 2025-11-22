<template>
  <div>
    <q-form @submit.prevent>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-input v-model="model.codigo_establo" label="Código Establo" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="model.ubigeo" label="Ubigeo" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="model.mes_de_referencia" label="Mes de referencia" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="model.anio" label="Año" dense outlined />
        </div>

        <div class="col-12 col-md-4">
          <q-input v-model="model.region" label="Región" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="model.provincia" label="Provincia" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <q-input v-model="model.distrito" label="Distrito" dense outlined />
        </div>

        <div class="col-12 col-md-6">
          <q-input
            v-model="model.nombre_establo"
            label="Nombre del Establo"
            dense
            outlined
            :rules="[(v) => !!v || 'Requerido']"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="model.producto_razon_social"
            label="Productor / Razón social"
            dense
            outlined
            :rules="[(v) => !!v || 'Requerido']"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-input v-model="model.direccion" label="Dirección" dense outlined />
        </div>
        <div class="col-12 col-md-6">
          <q-input v-model="model.ruc" label="RUC" dense outlined />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>
