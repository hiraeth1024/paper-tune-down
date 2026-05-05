# 核心功能优化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 实现加粗格式保持、参考文献/封面跳过识别、ZWNJ 预览标注四项核心优化

**Architecture:** 后端 python-docx 按 run 长度比例分配改写文本保留 rPr → 前端 mammoth 解析时增加参考文献/封面状态检测 → ZWNJ 标记走独立字段 annotated_html，导出用 original rewritten 不变

**Tech Stack:** Python FastAPI + python-docx + jieba / TypeScript Next.js + mammoth.js

---

### Task 1: 加粗格式保持 — 重写 `_replace_content_paragraphs`

**Files:**
- Modify: `backend/main.py:124-135`

- [ ] **Step 1: 重写 `_replace_content_paragraphs` 为按 run 比例分配**

用以下代码替换 `_replace_content_paragraphs` 函数（`backend/main.py:124-135`）：

```python
def _replace_content_paragraphs(doc: Document, results: list[RewritePair]):
    """Replace text of content paragraphs, preserving per-run formatting (bold, font, size)."""
    for i, pair in enumerate(results):
        if pair.changes == 0:
            continue
        if i >= len(doc.paragraphs):
            break
        para = doc.paragraphs[i]
        runs = para.runs
        if not runs:
            continue

        # Calculate original run text lengths
        run_lengths = [len(r.text) for r in runs]
        total_len = sum(run_lengths)

        if total_len == 0:
            runs[0].text = pair.rewritten
            for run in runs[1:]:
                run._r.getparent().remove(run._r)
            continue

        rewritten = pair.rewritten
        rw_len = len(rewritten)

        if len(runs) == 1:
            runs[0].text = rewritten
            continue

        # Distribute rewritten text proportionally across runs
        pos = 0
        for j, run in enumerate(runs):
            if j == len(runs) - 1:
                run.text = rewritten[pos:]
            else:
                ratio = run_lengths[j] / total_len
                chunk = max(1, round(ratio * rw_len))
                remaining_runs = len(runs) - j - 1
                chunk = min(chunk, rw_len - pos - remaining_runs)
                if chunk < 1:
                    chunk = 1
                run.text = rewritten[pos:pos + chunk]
                pos += chunk
```

- [ ] **Step 2: 验证后端启动无语法错误**

```bash
cd backend && python -c "from main import _replace_content_paragraphs; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "fix: docx 导出保留段落内 run 级格式（加粗/字体/字号），按原比例分配改写文本"
```

---

### Task 2: 参考文献检测与跳过

**Files:**
- Modify: `frontend/lib/docx-parser.ts:32-82`

- [ ] **Step 1: 修改 `classifyParagraph` 增加参考文献状态**

将 `classifyParagraph` 函数签名和逻辑改为（`frontend/lib/docx-parser.ts:32-82`）：

```typescript
function classifyParagraph(
  text: string,
  styleName: string | null,
  index: number,
  referencesStarted: boolean,
): { type: ParagraphType; label: MetadataLabel; referencesStarted: boolean } {
  const t = text.trim()

  // Already in references section
  if (referencesStarted) {
    return { type: 'metadata', label: '正文', referencesStarted: true }
  }

  // Detect start of references section
  if (/^(参考文献|參考文獻|References|Bibliography)\s*$/i.test(t) && t.length < 30) {
    return { type: 'metadata', label: '正文', referencesStarted: true }
  }

  // Detect reference entry: [1], [1-3], [1,2] followed by content
  if (/^\[\d+([\-–,]\d+)*\]/.test(t) && t.length > 50) {
    return { type: 'metadata', label: '正文', referencesStarted: true }
  }

  // Empty / very short paragraphs are metadata
  if (t.length < 5) {
    return { type: 'metadata', label: '标题', referencesStarted: false }
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
```

- [ ] **Step 2: 更新 `parseDocx` 中 `classifyParagraph` 的调用**

修改 `parseDocx` 函数，在循环中传递并更新 `referencesStarted` 状态（`frontend/lib/docx-parser.ts:84-113`）：

```typescript
export async function parseDocx(file: File): Promise<ParsedParagraph[]> {
  const arrayBuffer = await file.arrayBuffer()
  const collected: ParsedParagraph[] = []
  let referencesStarted = false

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

  return collected
}
```

注意：`ParsedParagraph` 接口不需要改，`label` 字段在参考文献情况下设为 `'正文'` 即可（前端预览组件会用 label 来决定颜色标签，参考文献在预览中显示为「正文-跳过」样式也没问题）。

- [ ] **Step 3: 验证前端编译**

```bash
cd frontend && npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: 无新增类型错误。

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/docx-parser.ts
git commit -m "feat: 段落分类器增加参考文献检测，命中后其后所有段落标记为跳过"
```

---

### Task 3: 封面识别与跳过

**Files:**
- Modify: `frontend/lib/docx-parser.ts`

- [ ] **Step 1: 新增 `detectCoverPage` 函数和封面特征检测**

在 `frontend/lib/docx-parser.ts` 文件顶部（`classifyParagraph` 上方）新增：

```typescript
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
```

- [ ] **Step 2: 修改 `toParagraphInputs` 应用封面跳过**

修改 `toParagraphInputs` 函数（`frontend/lib/docx-parser.ts:120-125`）：

```typescript
export function toParagraphInputs(parsed: ParsedParagraph[]): ParagraphInput[] {
  const coverDetected = detectCoverPage(parsed)
  const coverEnd = coverDetected ? 15 : 0

  return parsed.map((p, i) => ({
    text: p.text,
    skip: p.type === 'metadata' || i < coverEnd,
  }))
}
```

- [ ] **Step 3: 新增 metadata label 类型 '封面'**

更新 `MetadataLabel` 类型和分类逻辑，让封面段落在预览中显示为「封面」标签。修改 `parseDocx` 中收集段落的逻辑：

```typescript
export type MetadataLabel = '标题' | '摘要' | '关键词' | '正文' | '封面'
```

修改 `parseDocx` 函数，在收集段落后统一处理封面标记：

```typescript
export async function parseDocx(file: File): Promise<ParsedParagraph[]> {
  const arrayBuffer = await file.arrayBuffer()
  const collected: ParsedParagraph[] = []
  let referencesStarted = false

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
      if (collected[i].type === 'content') {
        collected[i].type = 'metadata'
        collected[i].label = '封面'
      }
    }
  }

  return collected
}
```

同时更新 `DocPreview.tsx` 中的 `labelColors` 增加封面颜色：

```typescript
const labelColors: Record<MetadataLabel, string> = {
  '标题': 'bg-pg-surface text-pg-subtle',
  '摘要': 'bg-amber-50 text-amber-600',
  '关键词': 'bg-purple-50 text-purple-600',
  '正文': 'bg-brand-50 text-brand-600',
  '封面': 'bg-sky-50 text-sky-600',
}
```

- [ ] **Step 4: 验证前端编译**

```bash
cd frontend && npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: 无新增类型错误。

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/docx-parser.ts frontend/components/process/DocPreview.tsx
git commit -m "feat: 封面识别 — 前15段命中>=2个特征关键词则整个封面区域跳过处理"
```

---

### Task 4: ZWNJ 标注 — 后端引擎 + API

**Files:**
- Modify: `backend/engines/zwnj.py`
- Modify: `backend/engines/orchestrator.py`
- Modify: `backend/schemas/__init__.py`
- Modify: `backend/main.py`

- [ ] **Step 1: `zwnj.py` 新增带标注的注入函数**

在 `backend/engines/zwnj.py` 文件末尾新增：

```python
def inject_zwnj_with_annotation(text: str, prob: float = 0.6) -> tuple[str, str, int]:
    """
    Like inject_zwnj but also returns an HTML-annotated version
    where ZWNJ positions are wrapped in <mark class="zwnj-spot"> for web preview.

    Returns (processed_text_with_real_zwnj, annotated_html, insertion_count).
    """
    result: list[str] = []
    annotated: list[str] = []
    count = 0

    for i in range(len(text) - 1):
        result.append(text[i])
        annotated.append(text[i])

        curr_is_cjk = _is_cjk(text[i])
        next_is_cjk = _is_cjk(text[i + 1])

        if curr_is_cjk and next_is_cjk and random.random() < prob:
            if text[i] not in '，。；：！？、""''）】》' and text[i + 1] not in '，。；：！？、""''）】》':
                result.append(ZWNJ)
                annotated.append('<mark class="zwnj-spot">‌</mark>')
                count += 1

    if text:
        result.append(text[-1])
        annotated.append(text[-1])

    return ''.join(result), ''.join(annotated), count
```

- [ ] **Step 2: `orchestrator.py` 返回 annotated 文本**

修改 `backend/engines/orchestrator.py` 的 `process_paragraph` 函数：

```python
def process_paragraph(text: str, mode: str, intensity: str,
                      zwnj_prob: float = 0.0, skip: bool = False) -> tuple[str, dict]:
    """
    Process a single paragraph through the selected engine pipeline.

    Returns (processed_text, stats_dict) where stats_dict now includes
    'annotated' when ZWNJ is active.
    """
    stats = {
        "total_replacements": 0,
        "zwnj_insertions": 0,
        "ai_patterns_removed": 0,
        "annotated": text,  # defaults to original if no ZWNJ
    }

    if skip:
        return text, stats

    result = text

    if mode == "rewrite":
        result, stats["total_replacements"] = rewrite_text(text, intensity)

    elif mode == "de_ai":
        result, stats["ai_patterns_removed"] = deai_text(text, intensity)

    elif mode == "both":
        result, stats["ai_patterns_removed"] = deai_text(text, intensity)
        result, stats["total_replacements"] = rewrite_text(result, intensity)

    # ZWNJ as final pass in ALL modes
    if zwnj_prob > 0:
        from .zwnj import inject_zwnj_with_annotation
        result, annotated, count = inject_zwnj_with_annotation(result, zwnj_prob)
        stats["zwnj_insertions"] = count
        stats["annotated"] = annotated
    else:
        stats["annotated"] = result

    return result, stats
```

- [ ] **Step 3: `schemas/__init__.py` 的 `RewritePair` 新增 `annotated` 字段**

修改 `RewritePair`（`backend/schemas/__init__.py:16-19`）：

```python
class RewritePair(BaseModel):
    original: str
    rewritten: str
    changes: int
    annotated: str | None = None
```

- [ ] **Step 4: `main.py` 的 `/api/process` 传递 annotated**

修改 `backend/main.py` 的 process 端点中构建 RewritePair 的部分（`main.py:55-59`）：

```python
        results.append(RewritePair(
            original=p.text,
            rewritten=rewritten,
            changes=stats["total_replacements"] + stats["zwnj_insertions"] + stats["ai_patterns_removed"],
            annotated=stats.get("annotated"),
        ))
```

- [ ] **Step 5: 验证后端启动和 API 响应**

```bash
cd backend && python -c "
from engines.zwnj import inject_zwnj_with_annotation
text, annotated, count = inject_zwnj_with_annotation('人工智能技术发展迅速', 0.8)
print('Count:', count)
print('Annotated:', annotated[:100])
print('Has marks:', '<mark class=\"zwnj-spot\">' in annotated)
"
```

Expected: `Count > 0`, `Has marks: True`

- [ ] **Step 6: Commit**

```bash
git add backend/engines/zwnj.py backend/engines/orchestrator.py backend/schemas/__init__.py backend/main.py
git commit -m "feat: ZWNJ 注入后返回 annotated HTML，标记位置供前端预览高亮"
```

---

### Task 5: ZWNJ 标注 — 前端预览渲染

**Files:**
- Modify: `frontend/lib/api.ts:73-77`
- Modify: `frontend/components/process/ResultsView.tsx`

- [ ] **Step 1: `api.ts` 的 `RewritePair` 新增 `annotated` 字段**

修改 `frontend/lib/api.ts:73-77`：

```typescript
export interface RewritePair {
  original: string
  rewritten: string
  changes: number
  annotated?: string | null
}
```

- [ ] **Step 2: `ResultsView.tsx` 改写列渲染 annotated HTML**

修改 `ResultsView.tsx:131-134`，改写列使用 `annotated`（如有）渲染 HTML，同时增加 `.zwnj-spot` 样式：

```tsx
// 在对比列表中，改写列改为渲染 annotated
<div className="text-sm text-pg-text leading-relaxed border-l-2 border-accent-300 pl-3">
  <span className="text-xs text-accent-500 font-medium block mb-1">改写</span>
  {p.annotated ? (
    <span dangerouslySetInnerHTML={{ __html: p.annotated }} />
  ) : (
    p.rewritten
  )}
</div>
```

同时在文件顶部或全局 CSS 中添加 `.zwnj-spot` 样式。检查项目中是否存在全局样式文件：

```bash
# 如果使用 Tailwind，可以通过任意值方式内联样式，无需额外 CSS 文件
```

使用 Tailwind 的 `[&_mark.zwnj-spot]:` 方式给父容器加样式。将对比卡片的容器加上样式类：

```tsx
<div className="text-sm text-pg-text leading-relaxed border-l-2 border-accent-300 pl-3 [&_mark.zwnj-spot]:bg-yellow-200 [&_mark.zwnj-spot]:text-transparent [&_mark.zwnj-spot]:rounded [&_mark.zwnj-spot]:px-px [&_mark.zwnj-spot]:select-none">
```

这样 `<mark class="zwnj-spot">` 会显示为一个小黄点标记，提示用户此处有零宽不连词。

- [ ] **Step 3: 验证前端编译**

```bash
cd frontend && npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: 无新增类型错误。

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/api.ts frontend/components/process/ResultsView.tsx
git commit -m "feat: 前端预览渲染 ZWNJ 标注为黄色标记点，仅预览显示不进入导出"
```

---

### Task 6: 端到端验证

- [ ] **Step 1: 启动后端并测试 process API**

```bash
cd backend && uvicorn main:app --port 8000 &
sleep 2
curl -s -X POST http://localhost:8000/api/process \
  -H 'Content-Type: application/json' \
  -d '{"paragraphs":[{"text":"人工智能技术正在快速发展，深度学习模型已经在图像识别领域取得了显著的成果。","skip":false}],"mode":"both","intensity":"medium","zwnj_prob":0.5}' | python -m json.tool | head -30
```

Expected: JSON 响应中 `results[0].annotated` 包含 `<mark class="zwnj-spot">` 标签

- [ ] **Step 2: 验证 export API 不含标记**

创建一个测试 docx 并测试导出：

```bash
# 使用 Python 创建测试 docx
cd backend && python -c "
from docx import Document
doc = Document()
p = doc.add_paragraph()
run1 = p.add_run('这是加粗文字')
run1.bold = True
run2 = p.add_run('这是普通文字')
doc.save('/tmp/test_bold.docx')
print('Test docx created')
"

# 测试导出
curl -s -X POST http://localhost:8000/api/export \
  -F 'file=@/tmp/test_bold.docx' \
  -F 'data={"results":[{"original":"这是加粗文字这是普通文字","rewritten":"那是强调文字那是常规文字","changes":2}],"format":"single"}' \
  -o /tmp/test_export.docx

# 验证导出文件中的加粗格式
python -c "
from docx import Document
doc = Document('/tmp/test_export.docx')
for p in doc.paragraphs:
    for r in p.runs:
        print(f'Text: {r.text!r}, Bold: {r.bold}')
"
```

Expected: 两个 run 都存在，第一个 run 保持 bold=True

- [ ] **Step 3: 清理并 Commit（如有修改）**

```bash
# 停止后台 uvicorn
kill %1 2>/dev/null || true
git status
```

如果验证过程中有任何修复，提交它们。

---

### 完成标准

1. 导出的 docx 中，原文有加粗的 run，改写后仍保持加粗
2. 参考文献段落（"参考文献" 标题后的所有段落）在预览中显示为跳过
3. 封面特征段落（含 "学位论文"、"大学" 等）被标记为跳过
4. Web 预览结果中，ZWNJ 位置显示黄色标记点；导出的 docx 中为真实 ZWNJ 字符（不可见）
