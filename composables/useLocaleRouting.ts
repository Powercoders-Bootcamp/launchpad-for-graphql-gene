export function useLocaleRouting() {
  const localePath = useLocalePath()
  const { locales } = useI18n()

  function stripLocalePrefix(path: string) {
    if (!path.startsWith('/')) {
      return `/${path}`
    }

    const localeCodes = locales.value.map(locale => (typeof locale === 'string' ? locale : locale.code))
    const segments = path.split('/')
    const maybeLocale = segments[1]

    if (!localeCodes.includes(maybeLocale)) {
      return path || '/'
    }

    const nextPath = `/${segments.slice(2).join('/')}`.replace(/\/{2,}/g, '/')
    return nextPath === '/' ? nextPath : nextPath.replace(/\/$/, '')
  }

  function localeHref(path: string) {
    return localePath(path)
  }

  return {
    localeHref,
    stripLocalePrefix,
  }
}
