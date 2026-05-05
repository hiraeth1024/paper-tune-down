# 文档预览手动跳过 — 设计文档

日期: 2026-05-05

## 概述

在策略选择页的文档预览中，让用户逐段手动切换跳过/处理状态，并提示改写可能改变格式。

## 设计

### 交互

- 每段右侧增加 toggle 开关，用户可逐段切换跳过/处理
- 自动分类结果作为默认值（metadata → 跳过，content → 处理）
- 用户点击 toggle 覆盖默认值
- 跳过行低透明度 + 灰色 toggle；处理行正常显示 + 蓝色 toggle

### 提示条

段落列表上方显示琥珀色提示：
> 改写可能改变原文格式，建议手动跳过不需要处理的部分

### 数据流

```
process/page.tsx
  manualSkip: Set<number>           ← 新增 state（用户标记跳过的段落索引）
  
  DocPreview
    manualSkip={manualSkip}
    onToggleSkip={(i) => toggle manualSkip}
  
  handleStart()
    toParagraphInputs(parsed, manualSkip)
      最终 skip = 自动分类 skip || manualSkip.has(i)
```

### 涉及文件

| 文件 | 改动 |
|------|------|
| `frontend/components/process/DocPreview.tsx` | 新增 props（manualSkip, onToggleSkip）；每段右侧 toggle 替换静态「跳过」标签；顶部提示条 |
| `frontend/app/(main)/process/page.tsx` | 新增 manualSkip state；传入 DocPreview；handleStart 传入 manualSkip |
| `frontend/lib/docx-parser.ts` | `toParagraphInputs` 新增可选参数 manualSkip |
