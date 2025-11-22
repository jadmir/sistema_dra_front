<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 100%; max-width: 620px">
      <!-- Header con botón cerrar -->
      <q-card-section class="row items-center q-gutter-sm bg-primary text-white">
        <q-avatar color="white" text-color="primary" icon="category" />
        <div class="text-h6">
          {{ isEdit ? 'Editar saca' : 'Nueva saca' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="$emit('close')" />
      </q-card-section>

      <!-- Contenido -->
      <q-card-section class="q-pt-md">
        <q-form ref="formRef" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nombre"
                label="Nombre"
                outlined
                dense
                clearable
                counter
                :maxlength="80"
                :rules="[(v) => !!v || 'El nombre es requerido']"
                autofocus
              >
                <template #append>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <!-- Estado solo en edición (borrado lógico) -->
            <div class="col-12 col-md-6" v-if="isEdit">
              <q-toggle v-model="form.activo" label="Activo" color="primary" />
            </div>

            <div :class="isEdit ? 'col-12' : 'col-12 col-md-12'">
              <q-input
                v-model="form.descripcion"
                type="textarea"
                label="Descripción"
                outlined
                autogrow
                dense
                clearable
                counter
                :maxlength="280"
                hint="Opcional"
                :rules="[(v) => !v || v.length <= 280 || 'Máximo 280 caracteres']"
              />
            </div>
          </div>

          <!-- Acciones -->
          <q-card-actions align="right" class="q-pt-sm">
            <q-btn flat label="Cancelar" color="grey" v-close-popup @click="$emit('close')" />
            <q-btn
              color="primary"
              :label="isEdit ? 'Actualizar' : 'Guardar'"
              type="submit"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>

      <!-- Overlay de carga -->
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="40px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useClaseSacaStore } from 'stores/sacaClases'
import { useQuasar } from 'quasar'

const props = defineProps({
  item: { type: Object, default: null },
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'saved', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const store = useClaseSacaStore()
const $q = useQuasar()
const loading = ref(false)
const formRef = ref(null)

// Factoria y reseteo seguro del formulario
const emptyForm = () => ({
  nombre: '',
  descripcion: '',
  // activo: solo en edición
})
const form = ref(emptyForm())

const resetForm = () => {
  form.value = emptyForm()
  nextTick(() => formRef.value?.resetValidation?.())
}

const isEdit = computed(() => !!props.item)

// Cuando cambia el item (edición), carga datos; si no hay item, deja vacío
watch(
  () => props.item,
  (val) => {
    if (val) {
      form.value = {
        nombre: val.nombre ?? '',
        descripcion: val.descripcion ?? '',
        activo: Boolean(val.activo ?? true),
      }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

// Reset al abrir si es “nuevo”; si es edición, refresca con el item actual
watch(
  () => open.value,
  (val) => {
    if (val) {
      if (isEdit.value) {
        const v = props.item || {}
        form.value = {
          nombre: v.nombre ?? '',
          descripcion: v.descripcion ?? '',
          activo: Boolean(v.activo ?? true),
        }
        nextTick(() => formRef.value?.resetValidation?.())
      } else {
        resetForm()
      }
    } else {
      // al cerrar, limpia si era nuevo
      if (!isEdit.value) resetForm()
    }
  },
)

const onSubmit = async () => {
  const ok = await formRef.value?.validate()
  if (!ok) return

  loading.value = true
  let success = false

  try {
    if (isEdit.value) {
      success = await store.update(props.item.id, { ...form.value })
    } else {
      // Quitar 'activo' sin declarar una variable no usada
      const data = { ...form.value }
      delete data.activo
      success = await store.create(data)
    }
  } finally {
    loading.value = false
  }

  if (success) {
    $q.notify({ type: 'positive', message: isEdit.value ? 'Clase actualizada' : 'Clase creada' })
    emit('saved')
    open.value = false
    resetForm()
  } else {
    $q.notify({ type: 'negative', message: store.error || 'Error al guardar' })
  }
}
</script>
