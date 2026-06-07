<template>
  <NuxtLink
    v-if="isInternalLink"
    :to="localizedHref"
    :target="target"
    :rel="rel"
  >
    <slot />
  </NuxtLink>

  <a
    v-else
    :href="href"
    :target="target"
    :rel="rel"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
  rel?: string
}>()

const localePath = useLocalePath()

const isInternalLink = computed(() =>
  typeof props.href === 'string'
  && props.href.startsWith('/')
  && !props.href.startsWith('//'),
)

const localizedHref = computed(() => {
  if (!props.href) {
    return '/'
  }

  if (!isInternalLink.value) {
    return props.href
  }

  const [path, hash = ''] = props.href.split('#')
  const localizedPath = localePath(path)
  return hash ? `${localizedPath}#${hash}` : localizedPath
})
</script>
