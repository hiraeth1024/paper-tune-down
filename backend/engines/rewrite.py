import json
import random
import re
from pathlib import Path

import jieba

_SYNONYM_DATA: dict | None = None


def _load_synonyms() -> dict:
    global _SYNONYM_DATA
    if _SYNONYM_DATA is None:
        path = Path(__file__).parent.parent / "data" / "synonyms.json"
        with open(path, encoding="utf-8") as f:
            _SYNONYM_DATA = json.load(f)
    return _SYNONYM_DATA


def rewrite_text(text: str, intensity: str) -> tuple[str, int]:
    """
    Rewrite Chinese text using jieba tokenization + synonym replacement.

    Returns (rewritten_text, replacement_count).
    """
    data = _load_synonyms()
    synonyms: dict[str, list[str]] = data["synonyms"][intensity]
    ratio: float = data["ratios"][intensity]

    words = list(jieba.cut(text))
    count = 0
    result: list[str] = []

    for w in words:
        if w in synonyms and random.random() < ratio:
            result.append(random.choice(synonyms[w]))
            count += 1
        else:
            result.append(w)

    rewritten = "".join(result)

    # Deep mode: additional sentence structure variation
    if intensity == "deep":
        rewritten, punct_count = _vary_punctuation(rewritten)
        count += punct_count
        rewritten, voice_count = _vary_voice(rewritten)
        count += voice_count

    return rewritten, count


def _vary_punctuation(text: str) -> tuple[str, int]:
    """Randomly swap some periods for semicolons and vice versa."""
    count = 0
    chars = list(text)
    for i, ch in enumerate(chars):
        if ch == "。" and random.random() < 0.15:
            chars[i] = "；"
            count += 1
        elif ch == "，" and random.random() < 0.08:
            chars[i] = "；"
            count += 1
    return "".join(chars), count


# Chinese passive/active voice patterns
_PASSIVE_PATTERNS: list[tuple[str, str]] = [
    (r"被(\w{1,4})", r"受到\1"),
    (r"把(\w{1,4})", r"将\1"),
    (r"对(\w{1,4})进行", r"加以\1"),
]


def _vary_voice(text: str) -> tuple[str, int]:
    """Apply voice variation patterns (passive/active swap)."""
    count = 0
    result = text
    for pattern, replacement in _PASSIVE_PATTERNS:
        if re.search(pattern, result) and random.random() < 0.2:
            result = re.sub(pattern, replacement, result)
            count += 1
    return result, count
