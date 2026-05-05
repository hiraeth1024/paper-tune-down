import html
import random
import re

ZWNJ = '\u200c'

# Characters near which ZWNJ should NOT be inserted
_PUNCTUATION = '，。；：！？、""''）】》'


def _is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x4E00 <= cp <= 0x9FFF or
        0x3400 <= cp <= 0x4DBF or
        0x20000 <= cp <= 0x2A6DF or
        0xF900 <= cp <= 0xFAFF
    )


def _should_insert(text: str, i: int) -> bool:
    """Check whether ZWNJ should be inserted between text[i] and text[i+1]."""
    return (
        _is_cjk(text[i])
        and _is_cjk(text[i + 1])
        and text[i] not in _PUNCTUATION
        and text[i + 1] not in _PUNCTUATION
    )


def inject_zwnj(text: str, prob: float = 0.6) -> tuple[str, int]:
    """
    Insert zero-width non-joiner between CJK characters to break
    plagiarism detection while appearing identical to human eyes.

    Returns (processed_text, insertion_count).
    """
    result: list[str] = []
    count = 0

    for i in range(len(text) - 1):
        result.append(text[i])
        if _should_insert(text, i) and random.random() < prob:
            result.append(ZWNJ)
            count += 1

    if text:
        result.append(text[-1])

    return ''.join(result), count


def inject_zwnj_with_annotation(text: str, prob: float = 0.6) -> tuple[str, str, int]:
    """
    Like inject_zwnj but also returns an HTML-annotated version
    where ZWNJ positions are wrapped in <mark class="zwnj-spot"> for web preview.

    Returns (processed_text_with_real_zwnj, annotated_html, insertion_count).
    """
    mark_open = '<mark class="zwnj-spot">'
    mark_close = '</mark>'

    result: list[str] = []
    annotated: list[str] = []
    count = 0

    for i in range(len(text) - 1):
        result.append(text[i])
        annotated.append(html.escape(text[i]))
        if _should_insert(text, i) and random.random() < prob:
            result.append(ZWNJ)
            annotated.append(f'{mark_open}{ZWNJ}{mark_close}')
            count += 1

    if text:
        result.append(text[-1])
        annotated.append(html.escape(text[-1]))

    return ''.join(result), ''.join(annotated), count
