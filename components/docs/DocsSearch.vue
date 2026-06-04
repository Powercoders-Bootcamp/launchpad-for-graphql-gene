<template>
  <div id="docs-search" class="docs-search">
    <div id="pagefind-search" />
  </div>
</template>

<script setup lang="ts">
onMounted(async () => {
  try {
    const { PagefindUI } = await import('@pagefind/default-ui')
    await import('@pagefind/default-ui/css/ui.css')
    new PagefindUI({
      element: '#pagefind-search',
      showSubResults: true,
      resetStyles: false,
    })
  }
  catch {
    // Pagefind index is only available after `npm run generate:full`.
    // In dev mode this block is reached silently — the input is hidden below.
  }
})
</script>

<style scoped>
.docs-search {
  margin-bottom: 1.25rem;
}

/* Hide the search widget entirely when the pagefind bundle is absent (dev mode). */
.docs-search:has(#pagefind-search:empty) {
  display: none;
}
</style>
