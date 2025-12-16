<template>
  <div class="formulario-items">
    <div class="items-header">
      <h3>🧪 Agroquímicos</h3>
      <q-badge
        :label="`${items.length} ${items.length === 1 ? 'producto' : 'productos'}`"
        color="deep-orange"
      />
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <q-icon name="science" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-7">No hay agroquímicos registrados</div>
      <p class="text-body2 text-grey-6">
        Esta encuesta fue enviada pero no contiene datos de agroquímicos capturados.
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
        <q-card-section class="card-header bg-deep-orange-7 text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">{{ item.nombre_comercial || item.nombre || 'Sin nombre' }}</div>
              <div class="text-caption">{{ getCategoriaLabel(item.categoria || item.tipo) }}</div>
            </div>
            <div class="col-auto">
              <q-badge color="white" text-color="deep-orange-7" :label="`#${index + 1}`" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Ingrediente Activo -->
            <div class="col-12 col-md-6" v-if="item.ingrediente_activo || item.principio_activo">
              <div class="detail-item">
                <q-icon name="science" color="purple-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Ingrediente Activo</div>
                  <div class="text-weight-medium">
                    {{ item.ingrediente_activo || item.principio_activo }}
                  </div>
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

            <!-- Presentación/Envase -->
            <div class="col-12 col-md-6" v-if="item.presentacion || item.envase">
              <div class="detail-item">
                <q-icon name="inventory" color="brown-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Presentación</div>
                  <div class="text-weight-medium">{{ item.presentacion || item.envase }}</div>
                </div>
              </div>
            </div>

            <!-- Fabricante/Marca -->
            <div class="col-12 col-md-6" v-if="item.fabricante || item.marca">
              <div class="detail-item">
                <q-icon name="factory" color="indigo-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Fabricante</div>
                  <div class="text-weight-medium">{{ item.fabricante || item.marca }}</div>
                </div>
              </div>
            </div>

            <!-- Registro Sanitario -->
            <div class="col-12 col-md-6" v-if="item.registro_sanitario">
              <div class="detail-item">
                <q-icon name="verified" color="green-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Registro Sanitario</div>
                  <div class="text-weight-medium">{{ item.registro_sanitario }}</div>
                </div>
              </div>
            </div>

            <!-- Precios -->
            <div class="col-12">
              <q-separator class="q-my-md" />
              <div class="text-subtitle2 text-weight-bold q-mb-sm">💰 Precios</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-4" v-if="item.precio_unidad || item.precio">
                  <q-chip
                    color="orange-1"
                    text-color="orange-8"
                    icon="local_offer"
                    class="full-width"
                  >
                    <div class="full-width row justify-between">
                      <span>Precio/Unidad</span>
                      <span class="text-weight-bold"
                        >S/ {{ formatPrice(item.precio_unidad || item.precio) }}</span
                      >
                    </div>
                  </q-chip>
                </div>

                <div class="col-12 col-sm-4" v-if="item.precio_litro">
                  <q-chip color="blue-1" text-color="blue-8" icon="opacity" class="full-width">
                    <div class="full-width row justify-between">
                      <span>Precio/Litro</span>
                      <span class="text-weight-bold">S/ {{ formatPrice(item.precio_litro) }}</span>
                    </div>
                  </q-chip>
                </div>

                <div class="col-12 col-sm-4" v-if="item.precio_kg">
                  <q-chip color="green-1" text-color="green-8" icon="scale" class="full-width">
                    <div class="full-width row justify-between">
                      <span>Precio/Kg</span>
                      <span class="text-weight-bold">S/ {{ formatPrice(item.precio_kg) }}</span>
                    </div>
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Stock -->
            <div class="col-12" v-if="item.stock || item.disponibilidad">
              <q-separator class="q-my-sm" />
              <div class="detail-item">
                <q-icon name="inventory_2" color="orange-6" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-caption text-grey-7">Stock</div>
                  <q-badge
                    :label="item.stock || item.disponibilidad"
                    :color="getStockColor(item.stock || item.disponibilidad)"
                  />
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
    insecticidas: '🐛 Insecticidas',
    fungicidas: '🍄 Fungicidas',
    herbicidas: '🌿 Herbicidas',
    acaricidas: '🕷️ Acaricidas',
    nematicidas: '🪱 Nematicidas',
    adherentes: '💧 Adherentes',
    acaricida: '🕷️ Acaricida',
    fungicida: '🍄 Fungicida',
    herbicida: '🌿 Herbicida',
    insecticida: '🐛 Insecticida',
  }
  return categorias[categoria?.toLowerCase()] || categoria || 'Otro'
}

const getStockColor = (stock) => {
  const stockLower = stock?.toString().toLowerCase()
  if (stockLower?.includes('disponible') || stockLower?.includes('alto')) return 'green'
  if (stockLower?.includes('bajo') || stockLower?.includes('poco')) return 'orange'
  if (stockLower?.includes('agotado') || stockLower?.includes('sin')) return 'red'
  return 'blue'
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
  border-left: 3px solid #ff5722;
}
</style>
