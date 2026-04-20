export const normalizeRichText = (html?: string | null) => {
  if (!html) return ''

  return html
    .replace(/<img/gi, '<img style="max-width:100%;height:auto;border-radius:16rpx;margin:24rpx 0;display:block;" ')
    .replace(/<table/gi, '<table style="width:100%;border-collapse:collapse;margin:16rpx 0;" ')
    .replace(/<td/gi, '<td style="border:1px solid #e2d8c7;padding:12rpx;" ')
    .replace(/<th/gi, '<th style="border:1px solid #e2d8c7;padding:12rpx;background:#f3eee2;" ')
}
