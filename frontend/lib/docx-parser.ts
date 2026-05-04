import mammoth from 'mammoth'

export type ParagraphType = 'metadata' | 'content'
export type MetadataLabel = '标题' | '摘要' | '关键词' | '正文'

export interface ParsedParagraph {
  text: string
  styleName: string | null
  styleId: string | null
  type: ParagraphType
  label: MetadataLabel
}

interface MammothParagraph {
  styleId?: string
  styleName?: string
  children: unknown[]
}

function extractText(element: unknown): string {
  if (!element || typeof element !== 'object') return ''
  const el = element as Record<string, unknown>
  if (el.type === 'text' && typeof el.value === 'string') {
    return el.value
  }
  if (Array.isArray(el.children)) {
    return el.children.map(extractText).join('')
  }
  return ''
}

function classifyParagraph(text: string, styleName: string | null, index: number): { type: ParagraphType; label: MetadataLabel } {
  const t = text.trim()

  // Empty / very short paragraphs are metadata (kept for index alignment)
  if (t.length < 5) {
    return { type: 'metadata', label: '标题' }
  }

  // Tier 1: Style-based detection
  if (styleName) {
    const s = styleName.toLowerCase()
    if (s.includes('heading') || s.includes('title')) {
      return { type: 'metadata', label: '标题' }
    }
  }

  // Tier 2: Heuristic fallback

  // Abstract detection (Chinese & English)
  if ((t.includes('摘要') || /^Abstract\b/i.test(t)) && t.length < 500) {
    return { type: 'metadata', label: '摘要' }
  }

  // Keywords
  if (/^(关键词|关键字|Keywords|KEYWORDS)\b/.test(t)) {
    return { type: 'metadata', label: '关键词' }
  }

  // Numbered heading patterns (short text)
  if (t.length < 120) {
    const patterns = [
      /^第[一二三四五六七八九十\d]+[章节部分]/,
      /^[一二三四五六七八九十]+\s*[、．，]/,
      /^（[一二三四五六七八九十\d]+）/,
      /^\d+(\.\d+)*[\s.、]/,
      /^[\[（【]\d+[\]）】]/,
    ]
    for (const pattern of patterns) {
      if (pattern.test(t)) {
        return { type: 'metadata', label: '标题' }
      }
    }
  }

  // First paragraph is often the title (short and early)
  if (index === 0 && t.length < 100) {
    return { type: 'metadata', label: '标题' }
  }

  return { type: 'content', label: '正文' }
}

export async function parseDocx(file: File): Promise<ParsedParagraph[]> {
  const arrayBuffer = await file.arrayBuffer()
  const collected: ParsedParagraph[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transforms = (mammoth as any).transforms

  await mammoth.convertToHtml(
    { arrayBuffer },
    {
      transformDocument: transforms.paragraph((para: MammothParagraph) => {
        const text = extractText(para).replace(/\s+/g, ' ').trim()
        const classification = classifyParagraph(
          text,
          para.styleName ?? null,
          collected.length,
        )
        collected.push({
          text,
          styleName: para.styleName ?? null,
          styleId: para.styleId ?? null,
          ...classification,
        })
        return para
      }),
    },
  )

  return collected
}

export interface ParagraphInput {
  text: string
  skip: boolean
}

export function toParagraphInputs(parsed: ParsedParagraph[]): ParagraphInput[] {
  return parsed.map(p => ({
    text: p.text,
    skip: p.type === 'metadata',
  }))
}

export function countByType(parsed: ParsedParagraph[]): { content: number; metadata: number } {
  let content = 0
  let metadata = 0
  for (const p of parsed) {
    if (p.type === 'content') content++
    else metadata++
  }
  return { content, metadata }
}

export function getContentParagraphs(parsed: ParsedParagraph[]): ParsedParagraph[] {
  return parsed.filter(p => p.type === 'content')
}

export function getDisplayParagraphs(parsed: ParsedParagraph[]): ParsedParagraph[] {
  return parsed.filter(p => p.text.length >= 5)
}
