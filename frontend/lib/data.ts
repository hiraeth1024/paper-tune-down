export interface CheckService {
  name: string
  url: string
  desc: string
  price: string
  tags: string[]
  color: 'red' | 'blue' | 'indigo' | 'green' | 'teal' | 'purple' | 'orange' | 'gray'
}

export const services: CheckService[] = [
  { name: '知网查重 (CNKI)', url: 'https://cx.cnki.net', desc: '国内高校通用检测系统，覆盖学术期刊、学位论文、会议论文等数据库', price: '约 100-300 元/篇', tags: ['学术论文', '学位论文'], color: 'red' },
  { name: '维普查重 (VIP)', url: 'https://vpcs.cqvip.com', desc: '维普中文期刊检测系统，覆盖期刊论文和学位论文', price: '约 2 元/千字', tags: ['期刊论文', '学位论文'], color: 'blue' },
  { name: '万方检测', url: 'http://check.wanfangdata.com.cn', desc: '万方数据论文相似性检测系统', price: '约 1.5 元/千字', tags: ['学术论文', '学位论文'], color: 'indigo' },
  { name: 'PaperPass', url: 'https://www.paperpass.com', desc: '专业论文检测平台，性价比高，适合初稿自检', price: '1.5 元/千字', tags: ['初稿自检', '性价比高'], color: 'green' },
  { name: 'PaperYY', url: 'https://www.paperyy.com', desc: '在线论文检测，提供免费检测额度', price: '免费额度 + 约 1 元/千字', tags: ['免费额度', '在线检测'], color: 'teal' },
  { name: 'Turnitin', url: 'https://www.turnitin.com', desc: '国际通用论文查重系统，广泛应用于海外高校', price: '按账号收费', tags: ['英文论文', 'SCI 投稿'], color: 'purple' },
  { name: '大雅查重', url: 'https://www.dayainfo.com', desc: '超星旗下查重平台，图书库资源丰富', price: '约 1.5 元/千字', tags: ['图书库', '学位论文'], color: 'orange' },
  { name: '笔杆网', url: 'https://www.bigan.net', desc: '写作辅助 + 查重一体化平台', price: '按次收费', tags: ['写作辅助', '格式排版'], color: 'gray' },
]

export interface QAItem {
  q: string
  a: string
}

export const qaData: QAItem[] = [
  { q: '降重后会影响论文的学术表达吗？', a: '本工具采用规则引擎 + 句法模板，替换词均来自学术同义词库（如知网关键词体系），在降低重复率的同时尽量保留学术表达的严谨性。建议处理后人工通读微调。' },
  { q: '什么是 AI 率？为什么需要降低？', a: 'AI 率是指文本被检测系统判定为"由 AI 生成"的概率。当前高校普遍引入 AIGC 检测（如知网 AIGC 检测），AI 率过高可能导致论文被退回。本工具通过句长随机化、连接词多样化、AI 典型用语替换等方式降低 AI 特征。' },
  { q: '零宽不连词（ZWNJ）是什么？', a: '零宽不连词（U+200C）是一个不可见的 Unicode 字符，插入字词之间可以打断查重系统的连续匹配，但对人眼完全不可见。深度模式下会自动随机插入。注意：部分查重系统已能过滤此字符，仅作为辅助手段之一。' },
  { q: '会保存或泄露我的论文吗？', a: '不会。本工具采用纯前端处理，文件仅在你的浏览器本地解析和改写，不上传到任何服务器。你可以在浏览器开发者工具 Network 面板验证——处理过程中不会有任何网络请求发出。' },
  { q: '为什么只支持 .docx 格式？', a: '.docx 是 Word 2007 以来的标准格式，基于 Open XML，方便在前端使用 JSZip 解析段落结构。如果你只有 .doc 或 .pdf 文件，可用 Word 另存为 .docx 后再上传。' },
  { q: '处理后能降到多少查重率？', a: '效果取决于原文重复程度和处理强度。轻度模式保守替换约 15%，深度模式大幅改写约 55%。实测案例中，中等重复（50-70%）的论文使用中度模式通常可降至 20% 以下。但无法保证 100% 通过，建议处理后自行复查。' },
  { q: '为什么完全免费？靠什么盈利？', a: 'PaperTune 是一个开源项目，目的是帮助更多学生降低论文查重的经济负担，让大家不再为高昂的降重费用发愁。项目不盈利，服务器和 API 费用由开发者自己承担。如果你觉得好用，欢迎到 <a href="https://github.com/hiraeth1024/paper-tune-down" target="_blank" rel="noopener noreferrer" class="text-brand-600 font-medium hover:underline">GitHub 给个 Star ⭐</a>，这就是对我们最好的支持！' },
]

export const mockParagraphs = [
  '随着互联网技术的快速发展，电子商务已经成为了现代商业活动中最重要的组成部分之一。首先，电子商务不仅改变了传统的交易方式，而且对消费者的购买行为产生了深远的影响。',
  '近年来，随着移动支付技术的不断成熟和普及，消费者的购物习惯发生了显著的变化。研究表明，移动支付的便捷性显著提高了消费者的购买意愿和购买频率。',
  '本文通过对500名消费者的问卷调查发现，价格因素仍然是影响消费者在线购买决策的最主要因素，其次是商品质量和物流配送速度。因此，电商平台应当重视定价策略的优化。',
  '此外，社交媒体的兴起为电子商务提供了新的营销渠道。许多研究表明，社交电商模式能够有效提升用户的购买转化率，尤其是在年轻消费群体中表现尤为突出。',
  '综上所述，电子商务的发展受到技术进步、消费者行为变化和营销模式创新等多重因素的共同影响。未来的研究可以进一步探讨人工智能技术在电子商务中的应用前景。',
]
