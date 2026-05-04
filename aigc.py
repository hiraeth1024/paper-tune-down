import random

# 零宽不连词
ZWNJ = '\u200c'


def insert_zwnj(text, prob=0.6):
    """
    在文本中随机插入零宽不连词
    :param text: 原始文本
    :param prob: 插入概率（0~1）
    :return: 处理后的文本
    """
    result = []
    for i in range(len(text) - 1):
        result.append(text[i])

        # 随机决定是否插入（避免在空格或换行附近插入）
        if text[i].strip() and text[i + 1].strip() and random.random() < prob:
            result.append(ZWNJ)

    # 添加最后一个字符
    if text:
        result.append(text[-1])

    return ''.join(result)


def main():
    file_path = "./data/a.txt"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = insert_zwnj(content, prob=0.6)

        print("\n===== 插入零宽不连词后的文本 =====\n")
        print(new_content)

    except Exception as e:
        print("读取文件出错：", e)


if __name__ == "__main__":
    main()