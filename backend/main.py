import json

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from io import BytesIO
from docx import Document

from schemas import ProcessRequest, ProcessResponse, ProcessStats, RewritePair, ExportRequest
from engines.orchestrator import process_paragraph
from core.config import CORS_ORIGINS
from api.auth import router as auth_router
# from core.user_store import seed_admin  # disabled in production

app = FastAPI(title="PaperTune API", version="0.2.0")


@app.on_event("startup")
def on_startup():
    # seed_admin()  # disabled in production — register via normal flow
    pass

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.post("/api/process", response_model=ProcessResponse)
def process(request: ProcessRequest):
    if not request.paragraphs:
        raise HTTPException(status_code=400, detail="段落列表不能为空")

    results: list[RewritePair] = []
    total_replacements = 0
    total_zwnj = 0
    total_ai = 0

    for p in request.paragraphs:
        rewritten, stats = process_paragraph(
            p.text, request.mode, request.intensity,
            zwnj_prob=request.zwnj_prob,
            skip=p.skip,
        )
        results.append(RewritePair(
            original=p.text,
            rewritten=rewritten,
            changes=stats["total_replacements"] + stats["zwnj_insertions"] + stats["ai_patterns_removed"],
        ))
        total_replacements += stats["total_replacements"]
        total_zwnj += stats["zwnj_insertions"]
        total_ai += stats["ai_patterns_removed"]

    return ProcessResponse(
        results=results,
        stats=ProcessStats(
            total_replacements=total_replacements,
            zwnj_insertions=total_zwnj,
            ai_patterns_removed=total_ai,
        ),
    )


@app.post("/api/export")
async def export_docx(
    file: UploadFile | None = File(None),
    data: str = Form(...),
):
    payload = json.loads(data)
    results = [RewritePair(**r) for r in payload["results"]]
    format_type = payload.get("format", "compare")

    if format_type == "single" and file:
        # Format-preserving: open original file, replace text only
        contents = await file.read()
        doc = Document(BytesIO(contents))
        _replace_content_paragraphs(doc, results)
    elif format_type == "compare":
        doc = Document()
        _build_compare_doc(doc, results)
    else:
        doc = Document()
        _build_single_doc(doc, results)

    buf = BytesIO()
    doc.save(buf)
    buf.seek(0)

    filename = f"papertune_{format_type}.docx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _build_compare_doc(doc: Document, results: list[RewritePair]):
    """Build a side-by-side comparison document."""
    doc.styles["Normal"].font.name = "SimSun"
    doc.styles["Normal"].font.size = 140000  # 14pt in EMU

    title = doc.add_heading("PaperTune 处理对照", level=1)
    title.alignment = 1  # center

    for i, pair in enumerate(results):
        doc.add_heading(f"第 {i + 1} 段", level=2)
        doc.add_paragraph("【原文】").runs[0].bold = True
        doc.add_paragraph(pair.original)
        doc.add_paragraph("【改写】").runs[0].bold = True
        doc.add_paragraph(pair.rewritten)
        doc.add_paragraph("")  # spacer


def _replace_content_paragraphs(doc: Document, results: list[RewritePair]):
    """Replace text of content paragraphs, preserving formatting of the first run."""
    for i, pair in enumerate(results):
        if pair.changes == 0:
            continue
        if i >= len(doc.paragraphs):
            break
        para = doc.paragraphs[i]
        if para.runs:
            para.runs[0].text = pair.rewritten
            for run in para.runs[1:]:
                run._r.getparent().remove(run._r)


def _build_single_doc(doc: Document, results: list[RewritePair]):
    """Build a rewritten-only document."""
    doc.styles["Normal"].font.name = "SimSun"
    doc.styles["Normal"].font.size = 140000

    title = doc.add_heading("PaperTune 改写稿", level=1)
    title.alignment = 1

    for i, pair in enumerate(results):
        doc.add_paragraph(pair.rewritten)

        if i < len(results) - 1:
            doc.add_paragraph("")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
