export default defineNuxtPlugin((nuxtApp) => {
  const previousWarnHandler = nuxtApp.vueApp.config.warnHandler

  nuxtApp.vueApp.config.warnHandler = (message, instance, trace) => {
    if (message.includes('<Suspense> is an experimental feature')) {
      return
    }

    if (previousWarnHandler) {
      previousWarnHandler(message, instance, trace)
      return
    }

    console.warn(`[Vue warn]: ${message}${trace || ''}`)
  }
})
