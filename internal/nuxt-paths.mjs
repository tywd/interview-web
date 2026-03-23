const appConfig = {
  baseURL: '/',
  buildAssetsDir: '/_nuxt/',
  cdnURL: '',
}

const trimEdge = (value) => value.replace(/^\/+|\/+$/g, '')

const joinRelativeURL = (...parts) => {
  const [first = '', ...rest] = parts.filter((part) => part !== undefined && part !== null && part !== '')
  const normalizedFirst = String(first)
  const leadingSlash = normalizedFirst.startsWith('/') ? '/' : ''
  const segments = [normalizedFirst, ...rest.map((part) => String(part))]
    .map((part, index) => {
      if (index === 0 && leadingSlash) {
        return trimEdge(part)
      }
      return trimEdge(part)
    })
    .filter(Boolean)

  return `${leadingSlash}${segments.join('/')}${String(parts.at(-1) || '').endsWith('/') ? '/' : ''}` || '/'
}

export const baseURL = () => appConfig.baseURL

export const buildAssetsDir = () => appConfig.buildAssetsDir

export const publicAssetsURL = (...path) => {
  const publicBase = appConfig.cdnURL || appConfig.baseURL
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase
}

export const buildAssetsURL = (...path) =>
  joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path)

if (typeof globalThis !== 'undefined') {
  globalThis.__buildAssetsURL = buildAssetsURL
  globalThis.__publicAssetsURL = publicAssetsURL
}
