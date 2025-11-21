<template>
  <!-- Grupo (expansible) si hay children -->
  <q-expansion-item
    v-if="hasChildren"
    :icon="icon || 'admin_panel_settings'"
    :label="title"
    expand-separator
    dense-toggle
    class="menu-group"
    header-class="menu-group-header"
  >
    <q-list dense>
      <!-- Recursivo: si el child tiene children, renderizar otro EssentialLink -->
      <template v-for="(child, i) in children" :key="child.to || child.link || child.title || i">
        <!-- Si el child tiene sub-children, usar EssentialLink recursivamente -->
        <EssentialLink
          v-if="child.children && child.children.length > 0"
          :title="child.title"
          :caption="child.caption"
          :icon="child.icon"
          :to="child.to"
          :link="child.link"
          :children="child.children"
          class="nested-group"
        />

        <!-- Si no tiene children, renderizar como item simple -->
        <q-item
          v-else
          clickable
          :to="isInternalLink(child) ? child.to || child.link : undefined"
          :href="!isInternalLink(child) ? child.link : undefined"
          :target="!isInternalLink(child) ? '_blank' : undefined"
          :rel="!isInternalLink(child) ? 'noopener' : undefined"
          class="menu-item"
        >
          <q-item-section avatar>
            <q-icon :name="child.icon || 'chevron_right'" color="green-7" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ child.title }}</q-item-label>
            <q-item-label caption>{{ child.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-expansion-item>

  <!-- Enlace simple -->
  <q-item
    v-else
    clickable
    :to="isInternal ? to || link : undefined"
    :href="!isInternal ? link : undefined"
    :target="!isInternal ? '_blank' : undefined"
    :rel="!isInternal ? 'noopener' : undefined"
    class="menu-item"
  >
    <q-item-section avatar>
      <q-icon :name="icon" color="green-7" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  icon: { type: String, default: '' },
  link: { type: String, default: '' }, // URL externa
  to: { type: [String, Object], default: '' }, // ruta interna (string u objeto de vue-router)
  children: { type: Array, default: () => [] }, // sub-items del grupo
})

const hasChildren = computed(() => Array.isArray(props.children) && props.children.length > 0)

// ¿Es enlace interno? (acepta string u objeto)
const isInternal = computed(() => {
  const val = props.to || props.link || ''
  if (val && typeof val === 'object') return true
  if (typeof val === 'string') return !/^https?:\/\//i.test(val)
  return false
})

const isInternalLink = (item) => {
  const val = item?.to || item?.link || ''
  if (val && typeof val === 'object') return true
  if (typeof val === 'string') return !/^https?:\/\//i.test(val)
  return false
}
</script>

<style lang="scss" scoped>
// Estilos para los items del menú
.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(90, 143, 105, 0.1);
    transform: translateX(4px);
  }

  // Efecto para el item activo/seleccionado
  &.q-router-link--active {
    background-color: rgba(90, 143, 105, 0.15);
    border-left: 3px solid #5a8f69;
    font-weight: 600;

    :deep(.q-icon) {
      color: #5a8f69 !important;
    }
  }
}

// Estilos para los grupos expansibles
.menu-group {
  margin: 4px 8px;
  border-radius: 8px;

  :deep(.menu-group-header) {
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(90, 143, 105, 0.08);
    }
  }

  // Icono del grupo en verde
  :deep(.q-expansion-item__toggle-icon),
  :deep(.q-item__section--avatar .q-icon) {
    color: #5a8f69;
  }

  // Label del grupo en negrita
  :deep(.q-item__label) {
    font-weight: 600;
  }
}

// Items hijos dentro del grupo
.menu-group :deep(.q-item) {
  padding-left: 24px;
}

// Grupos anidados (segundo nivel)
.nested-group {
  :deep(.menu-group-header) {
    padding-left: 16px;
    background-color: rgba(90, 143, 105, 0.03);
  }

  :deep(.q-item) {
    padding-left: 40px;
  }

  :deep(.q-expansion-item__toggle-icon),
  :deep(.q-item__section--avatar .q-icon) {
    color: #6aa77a;
  }
}
</style>
