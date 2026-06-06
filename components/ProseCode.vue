<template>
  <code class="prose-inline-code"><slot /></code>
</template>

<style>
.prose-inline-code {
  display: inline-flex;
  align-items: center;
  border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-soft) 88%, var(--bg-elevated) 12%);
  color: var(--muted-strong);
  padding: 0.15rem 0.5rem;
  font-family: var(--font-family-mono);
  font-size: 0.84em;
  line-height: 1.4;
}
</style>
