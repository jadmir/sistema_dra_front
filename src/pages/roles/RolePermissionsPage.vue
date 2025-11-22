<template>
  <q-dialog v-model="open" persistent transition-show="scale" transition-hide="scale">
    <q-card class="permissions-dialog-card">
      <q-card-section class="bg-gradient-green text-white">
        <div class="text-h6">
          <q-icon name="key" size="sm" class="q-mr-sm" />
          Asignar Permisos
        </div>
        <div class="text-caption">{{ role?.nombre }}</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div v-if="loading" class="q-pa-md flex flex-center">
          <q-spinner size="40px" color="green-7" />
        </div>

        <div v-else>
          <div class="text-subtitle2 text-grey-8 q-mb-md">Selecciona los permisos:</div>
          <q-option-group
            v-model="selected"
            :options="permisos"
            type="checkbox"
            color="green-7"
            class="q-gutter-sm"
          />

          <div class="row q-gutter-sm q-mt-lg">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              v-close-popup
              @click="$emit('close')"
              class="col"
            />
            <q-btn
              class="btn-green col"
              label="Guardar"
              icon="save"
              @click="save"
              :loading="saving"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { permissionService } from 'src/services/permissionService' // <-- corregido
import { roleService } from 'src/services/roleService' // <-- corregido
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

const $q = useQuasar()
const permisos = ref([])
const selected = ref([])
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  if (open.value) await loadData()
})

watch(
  () => open.value,
  async (v) => {
    if (v) await loadData()
  },
)

async function loadData() {
  loading.value = true
  try {
    const data = await permissionService.getAll()
    permisos.value = data.map((p) => ({ label: p.nombre, value: p.id }))

    if (props.role?.id) {
      const actuales = await roleService.getPermissions(props.role.id)
      selected.value = actuales.map((p) => p.id)
    } else {
      selected.value = []
    }
  } catch (error) {
    // <-- usar la variable para evitar no-unused-vars
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar permisos' })
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    await roleService.assignPermissions(props.role.id, selected.value)
    $q.notify({ type: 'positive', message: 'Permisos actualizados correctamente' })
    emit('saved')
    open.value = false
  } catch (error) {
    // <-- usar la variable
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al asignar permisos' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.permissions-dialog-card {
  width: 90vw;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

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

@media (max-width: 599px) {
  .permissions-dialog-card {
    width: 95vw;
    max-height: 85vh;
  }
}
</style>
