from pydantic import BaseModel, Field


class ParagraphInput(BaseModel):
    text: str
    skip: bool = False


class ProcessRequest(BaseModel):
    paragraphs: list[ParagraphInput]
    mode: str = Field(default="both", pattern="^(rewrite|de_ai|both)$")
    intensity: str = Field(default="medium", pattern="^(light|medium|deep)$")
    zwnj_prob: float = Field(default=0.0, ge=0.0, le=1.0)


class RewritePair(BaseModel):
    original: str
    rewritten: str
    changes: int


class ProcessStats(BaseModel):
    total_replacements: int
    zwnj_insertions: int
    ai_patterns_removed: int


class ProcessResponse(BaseModel):
    results: list[RewritePair]
    stats: ProcessStats


class ExportRequest(BaseModel):
    results: list[RewritePair]
    format: str = Field(default="compare", pattern="^(compare|single)$")
