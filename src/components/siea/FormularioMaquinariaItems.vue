<template>
  <div class="formulario-items">
    <div class="items-header">
      <h3>🚜 Maquinaria Agrícola</h3>
      <q-badge
        :label="`${items.length} ${items.length === 1 ? 'item' : 'items'}`"
        color="primary"
      />
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <q-icon name="agriculture" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-7">No hay maquinaria registrada</div>
      <p class="text-body2 text-grey-6">
        Esta encuesta fue enviada pero no contiene datos de maquinaria capturados.
        <br />
        El encuestador debe completar el formulario antes de validar.
      </p>
    </div>

    <div v-else class="items-list">
      <q-card
        v-for="(item, index) in items"
        :key="item.id || index"
        class="item-card q-mb-md"
        flat
        bordered
      >
        <q-card-section class="card-header bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">{{ item.nombre || item.tipo_maquinaria || 'Sin nombre' }}</div>
              <div class="text-caption">{{ item.categoria || 'Sin categoría' }}</div>
            </div>
            <div class="col-auto">
              <q-badge color="white" text-color="primary" :label="`#${index + 1}`" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Características -->
            <div class="col-12 col-md-6" v-if="item.marca || item.modelo">
              <div class="detail-item">
                <q-icon
                  name="precision_manufacturing"
                  color="blue-grey-6"
                  size="20px"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-caption text-grey-7">Marca/Modelo</div>
                  <div class="text-weight-medium">{{ item.marca }} {{ item.modelo }}</div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6" v-if="item.potencia_hp">
              <div class="detail-item">
                <q-icon name="speed" color="orange-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Potencia</div>
                  <div class="text-weight-medium">{{ item.potencia_hp }} HP</div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6" v-if="item.tipo_combustible">
              <div class="detail-item">
                <q-icon name="local_gas_station" color="red-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Combustible</div>
                  <div class="text-weight-medium">{{ item.tipo_combustible }}</div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6" v-if="item.anio_fabricacion">
              <div class="detail-item">
                <q-icon name="event" color="indigo-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Año</div>
                  <div class="text-weight-medium">{{ item.anio_fabricacion }}</div>
                </div>
              </div>
            </div>

            <!-- Precios -->
            <div class="col-12">
              <q-separator class="q-my-md" />
              <div class="text-subtitle2 text-weight-bold q-mb-sm">💰 Precios</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-4" v-if="item.precio_alquiler_dia">
                  <q-chip color="green-1" text-color="green-8" icon="event" class="full-width">
                    <div class="full-width row justify-between">
                      <span>Alquiler/día</span>
                      <span class="text-weight-bold"
                        >S/ {{ formatPrice(item.precio_alquiler_dia) }}</span
                      >
                    </div>
                  </q-chip>
                </div>

                <div class="col-12 col-sm-4" v-if="item.precio_alquiler_hora">
                  <q-chip color="blue-1" text-color="blue-8" icon="schedule" class="full-width">
                    <div class="full-width row justify-between">
                      <span>Alquiler/hora</span>
                      <span class="text-weight-bold"
                        >S/ {{ formatPrice(item.precio_alquiler_hora) }}</span
                      >
                    </div>
                  </q-chip>
                </div>

                <div class="col-12 col-sm-4" v-if="item.precio_venta">
                  <q-chip color="purple-1" text-color="purple-8" icon="sell" class="full-width">
                    <div class="full-width row justify-between">
                      <span>Venta</span>
                      <span class="text-weight-bold">S/ {{ formatPrice(item.precio_venta) }}</span>
                    </div>
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Disponibilidad y Observaciones -->
            <div class="col-12" v-if="item.disponibilidad">
              <q-separator class="q-my-sm" />
              <div class="detail-item">
                <q-icon
                  :name="item.disponibilidad === 'Disponible' ? 'check_circle' : 'schedule'"
                  :color="item.disponibilidad === 'Disponible' ? 'green' : 'orange'"
                  size="20px"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-caption text-grey-7">Estado</div>
                  <q-badge
                    :label="item.disponibilidad"
                    :color="item.disponibilidad === 'Disponible' ? 'green' : 'orange'"
                  />
                </div>
              </div>
            </div>

            <div class="col-12" v-if="item.observaciones">
              <q-separator class="q-my-sm" />
              <div class="observaciones">
                <div class="text-caption text-grey-7 q-mb-xs">💬 Observaciones</div>
                <div class="text-body2">{{ item.observaciones }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped>
.formulario-items {
  width: 100%;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.items-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9e9e9e;
}

.empty-state p {
  margin-top: 16px;
  font-size: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
}

.item-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.observaciones {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #2196f3;
}
</style>
