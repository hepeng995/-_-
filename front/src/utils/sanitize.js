import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p','br','span','div','strong','em','u','s','sub','sup',
  'h1','h2','h3','h4','h5','h6',
  'ul','ol','li',
  'a','img','figure','figcaption',
  'blockquote','pre','code',
  'table','thead','tbody','tr','th','td','caption',
  'hr'
]
const ALLOWED_ATTR = [
  'href','target','rel','title','alt','src',
  'class','style',
  'colspan','rowspan',
  'width','height'
]

export function sanitizeHtml(input) {
  if (input == null) return ''
  return DOMPurify.sanitize(String(input), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script','style','iframe','object','embed','form'],
    FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','onchange','formaction'],
    ALLOW_DATA_ATTR: false
  })
}

export default sanitizeHtml
