<template>
  <div class="formulario-items">
    <div class="items-header">
      <h3>🚛 Transporte Agrícola</h3>
      <q-badge :label="`${items.length} rutas`" color="primary" />
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <q-icon name="inbox" size="4em" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-7">No hay servicios de transporte registrados</div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        Esta encuesta aún no tiene datos de transporte capturados
      </div>
    </div>

    <div v-else class="items-grid">
      <q-card v-for="(item, index) in items" :key="index" class="item-card" bordered flat>
        <q-card-section>
          <div class="item-title">
            <q-icon name="local_shipping" size="24px" color="primary" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-weight-bold text-primary">
                {{ item.origen || item.ruta_origen || 'N/A' }}
                <q-icon name="arrow_forward" size="sm" class="q-mx-sm" />
                {{ item.destino || item.ruta_destino || 'N/A' }}
              </div>
              <div
                class="text-caption text-grey-7"
                v-if="item.producto || item.tipo_carga || item.carga"
              >
                📦 {{ item.producto || item.tipo_carga || item.carga }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="item-details">
            <!-- Tipo de Vehículo -->
            <div class="detail-row" v-if="item.tipo_vehiculo || item.vehiculo">
              <div class="detail-label">
                <q-icon name="directions_car" size="18px" />
                Tipo de Vehículo
              </div>
              <div class="detail-value">{{ item.tipo_vehiculo || item.vehiculo }}</div>
            </div>

            <!-- Capacidad de Carga -->
            <div
              class="detail-row"
              v-if="item.capacidad_carga || item.capacidad_ton || item.capacidad"
            >
              <div class="detail-label">
                <q-icon name="scale" size="18px" />
                Capacidad
              </div>
              <div class="detail-value">
                {{ item.capacidad_carga || item.capacidad_ton || item.capacidad }} Toneladas
              </div>
            </div>

            <!-- Distancia -->
            <div class="detail-row" v-if="item.distancia_km">
              <div class="detail-label">
                <q-icon name="straighten" size="18px" />
                Distancia
              </div>
              <div class="detail-value">{{ formatNumber(item.distancia_km) }} km</div>
            </div>

            <!-- Tiempo Estimado -->
            <div class="detail-row" v-if="item.tiempo_estimado_horas || item.tiempo_horas">
              <div class="detail-label">
                <q-icon name="schedule" size="18px" />
                Tiempo Estimado
              </div>
              <div class="detail-value">
                {{ item.tiempo_estimado_horas || item.tiempo_horas }} horas
              </div>
            </div>

            <!-- Tipo de Camino -->
            <div class="detail-row" v-if="item.tipo_camino">
              <div class="detail-label">
                <q-icon name="alt_route" size="18px" />
                Tipo de Camino
              </div>
              <div class="detail-value text-capitalize">
                {{ item.tipo_camino }}
              </div>
            </div>

            <!-- Transportista -->
            <div class="detail-row" v-if="item.nombre_transportista">
              <div class="detail-label">
                <q-icon name="person" size="18px" />
                Transportista
              </div>
              <div class="detail-value">
                {{ item.nombre_transportista }}
                <span v-if="item.telefono_transportista" class="text-caption text-grey-7">
                  ({{ item.telefono_transportista }})
                </span>
              </div>
            </div>

            <!-- Empresa de Transporte -->
            <div class="detail-row" v-if="item.empresa_transporte">
              <div class="detail-label">
                <q-icon name="business" size="18px" />
                Empresa
              </div>
              <div class="detail-value">{{ item.empresa_transporte }}</div>
            </div>
          </div>

          <!-- Chips de Precios y Estado -->
          <div class="chips-section q-mt-md">
            <q-chip
              v-if="
                item.precio_por_tonelada || item.precio_ton || item.precio_tonelada || item.precio
              "
              dense
              color="green-7"
              text-color="white"
              icon="payments"
              size="md"
            >
              S/
              {{
                formatPrice(
                  item.precio_por_tonelada ||
                    item.precio_ton ||
                    item.precio_tonelada ||
                    item.precio,
                )
              }}
              / Tonelada
            </q-chip>

            <q-chip
              v-if="item.precio_flete || item.precio_viaje"
              dense
              color="blue-7"
              text-color="white"
              icon="local_shipping"
              size="md"
            >
              Flete: S/ {{ formatPrice(item.precio_flete || item.precio_viaje) }}
            </q-chip>

            <q-chip
              v-if="item.disponibilidad"
              dense
              :color="getDisponibilidadColor(item.disponibilidad)"
              text-color="white"
              :icon="getDisponibilidadIcon(item.disponibilidad)"
              size="md"
            >
              {{ item.disponibilidad.toUpperCase() }}
            </q-chip>

            <q-chip
              v-if="item.frecuencia"
              dense
              color="purple-6"
              text-color="white"
              icon="event_repeat"
              size="md"
            >
              {{ item.frecuencia.charAt(0).toUpperCase() + item.frecuencia.slice(1) }}
            </q-chip>
          </div>

          <!-- Condiciones -->
          <div v-if="item.condiciones" class="conditions-section q-mt-md">
            <q-separator class="q-mb-sm" />
            <div class="text-caption text-grey-7">
              <q-icon name="info" size="16px" />
              Condiciones
            </div>
            <div class="text-body2 q-mt-xs">{{ item.condiciones }}</div>
          </div>

          <!-- Observaciones -->
          <div v-if="item.observaciones" class="observations-section q-mt-md">
            <q-separator class="q-mb-sm" />
            <div class="text-caption text-grey-7">
              <q-icon name="comment" size="16px" />
              Observaciones
            </div>
            <div class="text-body2 q-mt-xs">{{ item.observaciones }}</div>
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
    default: () => [],
  },
})

// Helpers
const formatPrice = (value) => {
  if (!value) return '0.00'
  return Number(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatNumber = (value) => {
  if (!value) return '0'
  return Number(value).toLocaleString('es-PE')
}

const getDisponibilidadColor = (disponibilidad) => {
  if (!disponibilidad) return 'grey'
  const disp = disponibilidad.toLowerCase()
  if (disp === 'alta' || disp === 'disponible') return 'positive'
  if (disp === 'media') return 'orange'
  return 'grey'
}

const getDisponibilidadIcon = (disponibilidad) => {
  if (!disponibilidad) return 'help'
  const disp = disponibilidad.toLowerCase()
  if (disp === 'alta' || disp === 'disponible') return 'check_circle'
  return 'schedule'
}
</script>

<style scoped lang="scss">
.formulario-items {
  padding: 16px;

  .items-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e0e0e0;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1976d2;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 48px 24px;
    background: #fafafa;
    border-radius: 8px;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 16px;
  }

  .item-card {
    transition: all 0.3s ease;
    border-left: 4px solid #1976d2;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }

  .item-title {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 12px;
    align-items: start;
  }

  .detail-label {
    font-size: 13px;
    color: #757575;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .detail-value {
    font-size: 14px;
    color: #212121;
    font-weight: 500;
  }

  .chips-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .conditions-section,
  .observations-section {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
  }
}

@media (max-width: 600px) {
  .items-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
