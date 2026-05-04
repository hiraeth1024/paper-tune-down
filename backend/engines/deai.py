import re
import random

# AI-typical opening patterns (GPT-generated Chinese text often starts paragraphs with these)
_AI_OPENINGS = [
    '随着.{2,20}的发展',
    '近年来',
    '在当今',
    '本文通过',
    '本研究',
    '值得注意的是',
    '需要指出的是',
    '毫无疑问',
    '由此可见',
    '总体而言',
    '综上所述',
    '首先.{0,10}其次.{0,10}最后',
    '一方面.{0,10}另一方面',
    '不仅.{0,10}而且',
    '与此同时',
]

# AI overused connectors and their alternatives
_AI_CONNECTORS: list[tuple[str, list[str]]] = [
    ('首先', ['第一', '在初始阶段', '最开始', '起步阶段']),
    ('其次', ['第二', '紧接着', '更进一步', '在这之后']),
    ('最后', ['最终', '收尾来看', '归总而论', '总结来看']),
    ('此外', ['另外', '除此之外', '还有一点', '补充来说']),
    ('因此', ['因而', '正因如此', '由此', '所以']),
    ('所以', ['因此', '因而', '故而', '由是']),
    ('然而', ['但是', '可是', '不过', '尽管如此']),
    ('显然', ['可见', '不难发现', '容易看出', '很自然地']),
    ('综上所述', ['总体来看', '归纳而言', '整体而言', '概括地说']),
    ('值得注意的是', ['需要关注的是', '值得留意', '不容忽视的是', '']),
    ('换言之', ['也就是说', '换句话说', '即', '或者说']),
    ('事实上', ['实际上', '其实', '说到底', '究其根本']),
    ('当然', ['自然', '诚然', '固然', '不可否认']),
    ('由此可见', ['可以看出', '由此可知', '不难推断', '这表明']),
]

# AI filler words that can be removed without semantic loss
_AI_FILLERS = [
    '一定的', '相关的', '较为', '相对来说', '基本上',
    '总的来说', '从某种程度上', '一般而言', '通常来说',
    '众所周知', '所谓的', '也就是', '某种意义上',
]


def deai_text(text: str, intensity: str) -> tuple[str, int]:
    """
    Remove AI-generation patterns from Chinese text.

    Returns (processed_text, patterns_removed).
    """
    count = 0
    result = text

    # 1. Replace AI-typical openings
    for pattern in _AI_OPENINGS:
        if re.search(pattern, result):
            result = re.sub(pattern, '', result).strip()
            count += 1

    # 2. Replace AI-favored connectors
    for old, alternatives in _AI_CONNECTORS:
        if old in result:
            replacement = random.choice(alternatives)
            if intensity == 'deep':
                result = result.replace(old, replacement)
            elif random.random() < _intensity_ratio(intensity):
                result = result.replace(old, replacement)
            count += 1

    # 3. Remove filler words (more aggressive at higher intensity)
    for filler in _AI_FILLERS:
        if filler in result:
            if intensity == 'deep' or random.random() < 0.5:
                result = result.replace(filler, '')
                count += 1

    # 4. Sentence length randomization for deep mode
    if intensity == 'deep':
        result, split_count = _randomize_sentence_lengths(result)
        count += split_count

    # 5. Vary paragraph opening (if the text starts with a common AI pattern)
    result, open_count = _vary_opening(result, intensity)
    count += open_count

    return result.strip(), count


def _intensity_ratio(intensity: str) -> float:
    return {'light': 0.3, 'medium': 0.6, 'deep': 0.9}[intensity]


def _randomize_sentence_lengths(text: str) -> tuple[str, int]:
    """Split long sentences or merge short ones to break AI uniformity."""
    sentences = re.split(r'(?<=[。！？；])', text)
    if len(sentences) < 2:
        return text, 0

    result: list[str] = []
    count = 0

    for s in sentences:
        if len(s) > 50 and random.random() < 0.3:
            # Randomly split a long sentence
            mid = len(s) // 2
            comma_pos = s.find('，', mid - 10, mid + 10)
            if comma_pos > 0:
                s = s[:comma_pos] + '。' + s[comma_pos + 1:]
                count += 1
        result.append(s)

    return ''.join(result), count


def _vary_opening(text: str, intensity: str) -> tuple[str, int]:
    """Replace AI-common opening phrases with natural alternatives."""
    openings = [
        ('本文', ['这篇论文', '本项工作', '此研究', '本研究']),
        ('随着', ['伴随', '由于', '鉴于', '受']),
        ('通过', ['经由', '借助', '凭借', '依靠']),
    ]

    count = 0
    for old, alternatives in openings:
        if text.startswith(old):
            if random.random() < _intensity_ratio(intensity):
                replacement = random.choice(alternatives)
                text = replacement + text[len(old):]
                count += 1
            break

    return text, count
