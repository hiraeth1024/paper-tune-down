import mammoth from 'mammoth'

export type ParagraphType = 'metadata' | 'content'
export type MetadataLabel = '标题' | '摘要' | '关键词' | '正文' | '封面'

const COVER_KEYWORDS = [
  '大学', '学院', 'University', 'College', 'Institute',
  '学位论文', '毕业设计', '毕业论文', '硕士', '博士', '本科',
  'Thesis', 'Dissertation', 'Bachelor', 'Master', 'Doctor',
  '指导教师', '导师', 'Supervisor', 'Advisor',
  '专业', '院系', '学号', 'Student ID', 'Department', 'Major',
  '二〇', '作者', '姓名',
]

function detectCoverPage(paragraphs: ParsedParagraph[], maxCheck: number = 15): boolean {
  const checkCount = Math.min(maxCheck, paragraphs.length)
  if (checkCount < 3) return false

  let hits = 0
  for (let i = 0; i < checkCount; i++) {
    const text = paragraphs[i].text
    for (const kw of COVER_KEYWORDS) {
      if (text.includes(kw)) {
        hits++
        break // one hit per paragraph max
      }
    }
  }
  return hits >= 2
}

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

function classifyParagraph(
  text: string,
  styleName: string | null,
  index: number,
  referencesStarted: boolean,
): { type: ParagraphType; label: MetadataLabel; referencesStarted: boolean } {
  const t = text.trim()

  // Already in references section — everything after is metadata
  if (referencesStarted) {
    return { type: 'metadata', label: '正文', referencesStarted: true }
  }

  // Detect start of references section: "参考文献" heading
  if (/^(参考文献|參考文獻|References|Bibliography)\s*$/i.test(t) && t.length < 30) {
    return { type: 'metadata', label: '正文', referencesStarted: true }
  }

  // Detect reference entry pattern: [1], [1-3], [1,2] followed by substantial content
  if (/^\[\d+([–,]\d+)*\]/.test(t) && t.length > 20) {
    return { type: 'metadata', label: '正文', referencesStarted: true }
  }

  // Short paragraphs (<20 chars) are metadata — covers title, author, department, etc.
  if (t.length < 20) {
    return { type: 'metadata', label: '标题', referencesStarted: false }
  }

  // Cover elements: contains "论文题目" or book-title marks 《》
  if (t.includes('论文题目') || /《.+》/.test(t)) {
    return { type: 'metadata', label: '封面', referencesStarted: false }
  }

  // Tier 1: Style-based detection
  if (styleName) {
    const s = styleName.toLowerCase()
    if (s.includes('heading') || s.includes('title')) {
      return { type: 'metadata', label: '标题', referencesStarted: false }
    }
  }

  // Tier 2: Heuristic fallback
  if ((t.includes('摘要') || /^Abstract\b/i.test(t)) && t.length < 500) {
    return { type: 'metadata', label: '摘要', referencesStarted: false }
  }

  if (/^(关键词|关键字|Keywords|KEYWORDS)\b/.test(t)) {
    return { type: 'metadata', label: '关键词', referencesStarted: false }
  }

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
        return { type: 'metadata', label: '标题', referencesStarted: false }
      }
    }
  }

  if (index === 0 && t.length < 100) {
    return { type: 'metadata', label: '标题', referencesStarted: false }
  }

  return { type: 'content', label: '正文', referencesStarted: false }
}

export async function parseDocx(file: File): Promise<ParsedParagraph[]> {
  const arrayBuffer = await file.arrayBuffer()
  const collected: ParsedParagraph[] = []
  let referencesStarted = false

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
          referencesStarted,
        )
        referencesStarted = classification.referencesStarted
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

  // Post-process: detect cover page and mark cover paragraphs
  if (detectCoverPage(collected)) {
    for (let i = 0; i < Math.min(15, collected.length); i++) {
      collected[i].type = 'metadata'
      collected[i].label = '封面'
    }
  }

  return collected
}

export interface ParagraphInput {
  text: string
  skip: boolean
}

export function toParagraphInputs(
  parsed: ParsedParagraph[],
  manualSkip?: Set<number>,
): ParagraphInput[] {
  return parsed.map((p, i) => ({
    text: p.text,
    skip: p.type === 'metadata' || (manualSkip?.has(i) ?? false),
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
