# 核心功能优化 — 设计文档

日期: 2026-05-05

## 概述

对 PaperTune 论文降重工具进行四项核心优化：加粗格式保持、参考文献跳过、封面识别跳过、ZWNJ 标注。

## 1. 加粗格式保持

### 问题
`_replace_content_paragraphs` (main.py:124-135) 只保留段落第一个 run 的文字并删除其余 run。Word docx 中每个 `<w:r>` 元素可拥有独立格式（加粗、字体、字号）。删除后续 run 意味着段落内加粗等内联格式全部丢失。

### 方案
逐 run 处理 + 按原始比例分配改写后文本：

1. 前端解析时提取每个段落的 run 长度列表（`run_lengths: list[int]`）
2. 后端 process 时保留 run 长度信息
3. 导出 `_replace_content_paragraphs` 重写：
   - 连接所有 run 文本得到完整段落
   - 使用改写后的完整文本
   - 按各 run 原长度比例将改写文本切分分配
   - 每个 run 保留原始 `<w:rPr>`（字体、加粗、字号等）
   - 末尾 run 吸收剩余字符以处理长度差异

### 涉及文件
- `backend/schemas/__init__.py` — ParagraphInput 新增 `run_lengths: list[int] | None`
- `backend/main.py` — 重写 `_replace_content_paragraphs`
- `frontend/lib/docx-parser.ts` — 解析时提取 run 长度

## 2. 参考文献跳过

### 问题
`classifyParagraph` (docx-parser.ts:32-82) 不识别参考文献章节，参考文献条目被当作正文参与改写，可能破坏引用格式。

### 方案
段落分类器中增加参考文献检测：

1. **参考文献标题检测**：段落文本匹配 `参考文献` / `References` / `Bibliography` 且长度 < 30 字符
2. **引用条目检测**：段落匹配 `[数字]` 开头 + 总长度 > 50 字符（如 `[1] Author, Title...`）
3. 一旦检测到参考文献开始，该段落及其后所有段落标记为 `metadata`（skip=true）

### 涉及文件
- `frontend/lib/docx-parser.ts` — `classifyParagraph` 新增参考文献检测 + `inReferences` 状态标记

## 3. 封面识别跳过

### 问题
学术论文封面包含学校名、学位类型、作者、导师等信息，当前全部被当作正文参与改写。

### 方案
在前 15 段范围内检测封面特征：

封面特征关键词：
- 学术机构：`大学` / `学院` / `University` / `College` / `Institute`
- 学位类型：`学位论文` / `毕业设计` / `硕士` / `博士` / `本科` / `Thesis` / `Dissertation`
- 导师信息：`指导教师` / `导师` / `Supervisor` / `Advisor`
- 其他：`专业` / `院系` / `学号` / `Student ID` / `Department` / `Major`
- 日期模式：`二〇` / `20\d{2}年`

若前 15 段中 >= 2 段命中封面特征，则整个前 15 段全部标记为 metadata。

### 涉及文件
- `frontend/lib/docx-parser.ts` — 新增 `detectCoverPage`，修改分类流程

## 4. ZWNJ 标注（仅 Web 预览）

### 问题
ZWNJ 字符（U+200C）不可见，用户无法知道插在哪里。

### 方案

1. `backend/engines/zwnj.py` 新增 `inject_zwnj_with_annotation(text, prob)` 返回 `(processed_text, count, annotated_html)`
   - `processed_text`：含真实 ZWNJ 字符，用于导出
   - `annotated_html`：ZWNJ 位置用 `<mark class="zwnj-spot">` 包裹，用于预览（不对文本做任何修改，仅标记 ZWNJ 在字符间的位置）

2. `backend/schemas/__init__.py` — `RewritePair` 新增 `annotated: str | None`

3. `backend/engines/orchestrator.py` — process_paragraph 返回 annotated 文本

4. `backend/main.py` — `/api/process` 在响应中包含 annotated

5. 前端预览组件渲染 `annotated` HTML，`.zwnj-spot` 样式为红色下划线提示标记

导出 docx 时使用 `rewritten` 字段（含真实 ZWNJ 不含标记），预览使用 `annotated` 字段。

### 涉及文件
- `backend/engines/zwnj.py` — 新增带标注的注入函数
- `backend/engines/orchestrator.py` — 返回 annotated
- `backend/schemas/__init__.py` — RewritePair 新增 annotated 字段
- `backend/main.py` — process 和 export 适配
- `frontend/components/process/` — 预览组件渲染 annotated
