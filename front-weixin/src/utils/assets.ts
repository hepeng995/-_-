import { appConfig } from '@/config/app'

const ABSOLUTE_URL_REG = /^https?:\/\//i
const LEGACY_FILE_PREFIX_REG = /(^https?:\/\/[^/]+)?\/?api\/file\/download\//i

const normalizeLegacyFilePath = (source: string) => {
  if (LEGACY_FILE_PREFIX_REG.test(source)) {
    const cleaned = source.replace(LEGACY_FILE_PREFIX_REG, '/file/download/')
    return cleaned.startsWith('/') || ABSOLUTE_URL_REG.test(cleaned) ? cleaned : `/${cleaned}`
  }

  return source
}

export const resolveImage = (source?: string | null, fallback = '/static/images/overview.jpg') => {
  if (!source) return fallback

  const normalizedSource = normalizeLegacyFilePath(source.trim())

  if (ABSOLUTE_URL_REG.test(normalizedSource) || normalizedSource.startsWith('data:')) {
    return normalizedSource
  }

  if (normalizedSource.startsWith('/static/') || normalizedSource.startsWith('static/')) {
    return normalizedSource.startsWith('/') ? normalizedSource : `/${normalizedSource}`
  }

  const normalized = normalizedSource.startsWith('/') ? normalizedSource : `/${normalizedSource}`
  return `${appConfig.assetBaseUrl}${normalized}`
}

export const normalizeAssetUrl = (source?: string | null) => resolveImage(source, '')

export const parseImageList = (source?: string | string[] | null) => {
  if (!source) return [] as string[]

  if (Array.isArray(source)) {
    return source.map((item) => resolveImage(item)).filter(Boolean)
  }

  const trimmed = source.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed) as string[]
    if (Array.isArray(parsed)) {
      return parsed.map((item) => resolveImage(item)).filter(Boolean)
    }
  } catch {
    // ignore invalid json
  }

  return trimmed
    .split(',')
    .map((item) => resolveImage(item.trim(), ''))
    .filter(Boolean)
}

export const stringifyImageList = (source?: string | string[] | null) => {
  if (!source) return '[]'
  if (Array.isArray(source)) return JSON.stringify(source.filter(Boolean))

  const parsed = parseImageList(source)
  return JSON.stringify(parsed)
}
