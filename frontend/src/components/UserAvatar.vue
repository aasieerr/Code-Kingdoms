<template>
  <div
    class="user-avatar"
    :class="[`user-avatar--${size}`]"
    :aria-label="`Avatar de ${name}`"
  >
    <img
      v-if="avatarUrl"
      :src="avatarUrl"
      :alt="`Avatar de ${name}`"
      class="user-avatar__image"
    />
    <span v-else class="user-avatar__initial">{{ initial }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: 'Héroe',
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  size: {
    type: String,
    default: 'md',
  },
})

const initial = computed(() => (props.name?.trim()?.[0] || '?').toUpperCase())
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid rgba(250, 204, 21, 0.2);
  background: linear-gradient(180deg, #1e293b 0%, #0b0d17 100%);
  flex-shrink: 0;
}

.user-avatar--sm {
  width: 2rem;
  height: 2rem;
}

.user-avatar--md {
  width: 2.5rem;
  height: 2.5rem;
}

.user-avatar--lg {
  width: 6.5rem;
  height: 6.5rem;
}

.user-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar__initial {
  color: #facc15;
  font-family: 'Press Start 2P', monospace;
  text-transform: uppercase;
}

.user-avatar--sm .user-avatar__initial {
  font-size: 0.55rem;
}

.user-avatar--md .user-avatar__initial {
  font-size: 0.65rem;
}

.user-avatar--lg .user-avatar__initial {
  font-size: 1.35rem;
}
</style>
