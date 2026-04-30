function resolveElement(target) {
  if (target && typeof target === 'object' && 'scrollTop' in target) {
    return target
  }

  if (typeof document === 'undefined') {
    return null
  }

  return document.querySelector('.app-content')
}

export function scrollToTop(target, options = {}) {
  const { behavior = 'auto' } = options
  const element = resolveElement(target)

  if (element) {
    if (typeof element.scrollTo === 'function') {
      element.scrollTo({ top: 0, left: 0, behavior })
    } else {
      element.scrollTop = 0
      if ('scrollLeft' in element) {
        element.scrollLeft = 0
      }
    }
    return
  }

  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior })
  }
}

export function scrollMainContentToTop(options = {}) {
  scrollToTop(null, options)
}
