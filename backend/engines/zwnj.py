import random
import re

ZWNJ = '‌'


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

        curr_is_cjk = _is_cjk(text[i])
        next_is_cjk = _is_cjk(text[i + 1])

        if curr_is_cjk and next_is_cjk and random.random() < prob:
            # Avoid inserting near punctuation
            if text[i] not in '，。；：！？、""''）】》' and text[i + 1] not in '，。；：！？、""''）】》':
                result.append(ZWNJ)
                count += 1

    if text:
        result.append(text[-1])

    return ''.join(result), count


def _is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return (
        0x4E00 <= cp <= 0x9FFF or
        0x3400 <= cp <= 0x4DBF or
        0x20000 <= cp <= 0x2A6DF or
        0xF900 <= cp <= 0xFAFF
    )
