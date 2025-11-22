<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md flex flex-center">
      <q-card
        class="q-pa-md q-mx-auto shadow-2 rounded-borders"
        style="max-width: 1000px; width: 100%"
      >
        <div class="text-h6 text-primary text-weight-bold q-mb-md text-center">
          Gestión de Registro Pecuario
        </div>

        <div class="row items-center q-col-gutter-sm q-mb-md justify-between">
          <div class="col-12 col-md-5">
            <q-input
              dense
              outlined
              debounce="500"
              v-model="store.search"
              placeholder="Buscar..."
              @update:model-value="onSearch"
            >
              <template #append><q-icon name="search" /></template>
            </q-input>
          </div>

          <div class="col-12 col-md-auto flex q-gutter-sm justify-end">
            <q-btn
              color="primary"
              icon="add"
              label="Nuevo registro"
              dense
              unelevated
              @click="openForm()"
            />
          </div>
        </div>

        <q-table
          :rows="store.registros"
          :columns="columns"
          row-key="id"
          :loading="store.loading"
          v-model:pagination="store.pagination"
          @request="onRequest"
          :rows-per-page-options="[5, 10, 20]"
          flat
          bordered
          separator="horizontal"
        >
          <template #body-cell-actions="props">
            <q-td align="center">
              <q-btn
                dense
                flat
                icon="edit"
                color="primary"
                @click="edit(props.row)"
                :disable="!props.row.editable"
              />
              <q-btn
                dense
                flat
                icon="picture_as_pdf"
                color="secondary"
                @click="exportPdf(props.row)"
              />
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-12">
              <q-card bordered>
                <q-card-section>
                  <div class="text-subtitle1">{{ props.row.nombre_establo }}</div>
                  <div class="text-caption">
                    {{ props.row.region }} - {{ props.row.provincia }} - {{ props.row.distrito }}
                  </div>
                  <div class="text-caption">
                    Mes: {{ props.row.mes_de_referencia }} / Año: {{ props.row.anio }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <registro-pecuario-form
      v-model="showForm"
      :registro="selected"
      @saved="onSaved"
      @close="closeForm"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegistroPecuarioStore } from 'src/stores/registroPecuario'
import RegistroPecuarioForm from './RegistroPecuarioForm.vue'

const store = useRegistroPecuarioStore()
const showForm = ref(false)
const selected = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id' },
  { name: 'nombre_establo', label: 'Nombre Establo', field: 'nombre_establo' },
  { name: 'region', label: 'Región', field: 'region' },
  { name: 'mes_de_referencia', label: 'Mes', field: 'mes_de_referencia' },
  { name: 'anio', label: 'Año', field: 'anio' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

function openForm() {
  selected.value = null
  showForm.value = true
}

async function edit(row) {
  const data = await store.fetchRegistro(row.id)

  if (data) {
    selected.value = data
    showForm.value = true
  }
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

function onSaved() {
  store.fetchRegistros(store.pagination.page)
  closeForm()
}

function onRequest({ pagination }) {
  store.pagination.page = pagination.page
  store.fetchRegistros(pagination.page)
}

function onSearch() {
  store.pagination.page = 1
  store.fetchRegistros(1)
}

async function exportPdf(row) {
  await store.exportPdf(row.id)
}

onMounted(() => {
  store.fetchRegistros()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 10px;
}
</style>
