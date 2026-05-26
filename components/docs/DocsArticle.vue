<template>
  <!-- TODO: implement full article wrapper (Phase 4) -->
  <article style="max-width: 720px; padding: 2rem;">
    <div v-if="status && status !== 'stable'" style="margin-bottom: 1rem;">
      <span
        style="
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          background: var(--panel-soft);
          color: var(--muted-strong);
          border: 1px solid var(--border);
        "
      >
        {{ status }}
      </span>
    </div>
    <slot />
  </article>
</template>

<script setup lang="ts">
defineProps<{ status?: string }>()
</script>
