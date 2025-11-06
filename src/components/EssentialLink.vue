<template>
  <!-- Grupo (expansible) si hay children -->
  <q-expansion-item
    v-if="hasChildren"
    :icon="icon || 'admin_panel_settings'"
    :label="title"
    expand-separator
    dense-toggle
  >
    <q-list dense>
      <q-item
        v-for="(child, i) in children"
        :key="child.to || child.link || child.title || i"
        clickable
        :to="isInternalLink(child) ? (child.to || child.link) : undefined"
        :href="!isInternalLink(child) ? child.link : undefined"
        :target="!isInternalLink(child) ? '_blank' : undefined"
        :rel="!isInternalLink(child) ? 'noopener' : undefined"
      >
        <q-item-section avatar>
          <q-icon :name="child.icon || 'chevron_right'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ child.title }}</q-item-label>
          <q-item-label caption>{{ child.caption }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>

  <!-- Enlace simple -->
  <q-item
    v-else
    clickable
    :to="isInternal ? (to || link) : undefined"
    :href="!isInternal ? link : undefined"
    :target="!isInternal ? '_blank' : undefined"
    :rel="!isInternal ? 'noopener' : undefined"
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
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
  link: { type: String, default: '' },                 // URL externa
  to: { type: [String, Object], default: '' },         // ruta interna (string u objeto de vue-router)
  children: { type: Array, default: () => [] },        // sub-items del grupo
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
