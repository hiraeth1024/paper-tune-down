from .rewrite import rewrite_text
from .deai import deai_text
from .zwnj import inject_zwnj


def process_paragraph(text: str, mode: str, intensity: str,
                      zwnj_prob: float = 0.0, skip: bool = False) -> tuple[str, dict]:
    """
    Process a single paragraph through the selected engine pipeline.

    Returns (processed_text, stats_dict).
    """
    stats = {
        "total_replacements": 0,
        "zwnj_insertions": 0,
        "ai_patterns_removed": 0,
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

    # ZWNJ as final pass in ALL modes, using user-provided probability directly
    if zwnj_prob > 0:
        result, stats["zwnj_insertions"] = inject_zwnj(result, zwnj_prob)

    return result, stats
