<template>
  <div class="formulario-items">
    <div class="items-header">
      <h3>🌱 Fertilizantes y Abonos</h3>
      <q-badge
        :label="`${items.length} ${items.length === 1 ? 'producto' : 'productos'}`"
        color="green"
      />
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <q-icon name="eco" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-7">No hay fertilizantes registrados</div>
      <p class="text-body2 text-grey-6">
        Esta encuesta fue enviada pero no contiene datos de fertilizantes capturados.
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
        <q-card-section class="card-header bg-green-7 text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">{{ item.nombre || item.producto || 'Sin nombre' }}</div>
              <div class="text-caption">{{ getCategoriaLabel(item.categoria) }}</div>
            </div>
            <div class="col-auto">
              <q-badge color="white" text-color="green-7" :label="`#${index + 1}`" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Composición -->
            <div class="col-12 col-md-6" v-if="item.composicion || item.formula">
              <div class="detail-item">
                <q-icon name="science" color="purple-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Composición</div>
                  <div class="text-weight-medium">{{ item.composicion || item.formula }}</div>
                </div>
              </div>
            </div>

            <!-- Presentación -->
            <div class="col-12 col-md-6" v-if="item.presentacion || item.envase">
              <div class="detail-item">
                <q-icon name="inventory" color="brown-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Presentación</div>
                  <div class="text-weight-medium">{{ item.presentacion || item.envase }}</div>
                </div>
              </div>
            </div>

            <!-- Concentración -->
            <div class="col-12 col-md-6" v-if="item.concentracion">
              <div class="detail-item">
                <q-icon name="colorize" color="blue-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Concentración</div>
                  <div class="text-weight-medium">{{ item.concentracion }}</div>
                </div>
              </div>
            </div>

            <!-- Origen -->
            <div class="col-12 col-md-6" v-if="item.origen">
              <div class="detail-item">
                <q-icon name="public" color="teal-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Origen</div>
                  <q-badge
                    :label="item.origen"
                    :color="item.origen === 'Nacional' ? 'blue' : 'orange'"
                  />
                </div>
              </div>
            </div>

            <!-- Precios -->
            <div class="col-12">
              <q-separator class="q-my-md" />
              <div class="text-subtitle2 text-weight-bold q-mb-sm">💰 Precios</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6" v-if="item.precio_saco || item.precio">
                  <q-chip
                    color="green-1"
                    text-color="green-8"
                    icon="shopping_bag"
                    class="full-width"
                  >
                    <div class="full-width row justify-between">
                      <span>Precio/Saco</span>
                      <span class="text-weight-bold"
                        >S/ {{ formatPrice(item.precio_saco || item.precio) }}</span
                      >
                    </div>
                  </q-chip>
                </div>

                <div class="col-12 col-sm-6" v-if="item.precio_kg">
                  <q-chip color="blue-1" text-color="blue-8" icon="scale" class="full-width">
                    <div class="full-width row justify-between">
                      <span>Precio/Kg</span>
                      <span class="text-weight-bold">S/ {{ formatPrice(item.precio_kg) }}</span>
                    </div>
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Stock/Disponibilidad -->
            <div class="col-12" v-if="item.stock || item.disponibilidad">
              <q-separator class="q-my-sm" />
              <div class="detail-item">
                <q-icon name="inventory_2" color="orange-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Stock</div>
                  <div class="text-weight-medium">
                    {{ item.stock || item.disponibilidad }}
                    {{ item.unidad_stock ? `(${item.unidad_stock})` : '' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Observaciones -->
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

const getCategoriaLabel = (categoria) => {
  const categorias = {
    nitrogenados: 'Nitrogenados',
    fosfatados: 'Fosfatados',
    potasicos: 'Potásicos',
    compuestos: 'Compuestos',
    organicos: 'Orgánicos',
  }
  return categorias[categoria?.toLowerCase()] || categoria || 'Sin categoría'
}

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
  border-left: 3px solid #4caf50;
}
</style>
