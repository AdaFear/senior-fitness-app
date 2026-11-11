import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function renderContent(markdown) {
  return DOMPurify.sanitize(marked.parse(markdown || ''))
}

export function toEmbedUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes('vimeo.com')) {
      return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean).pop()}`
    }
  } catch {
    /* invalid URL */
  }
  return null
}