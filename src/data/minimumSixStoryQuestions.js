const questionMeta = {
  人名: ['一个人名', '比如：Amy'],
  人名2: ['另一个人名', '比如：Jay'],
  动作: ['一个动作', '比如：眨眼'],
  动物: ['一种动物', '比如：熊猫'],
  发型: ['一种发型', '比如：光头'],
  发型2: ['另一种发型', '比如：大波浪'],
  口味: ['一种口味', '比如：甜味'],
  口味2: ['另一种口味', '比如：咸味'],
  口头禅: ['一句你最近常说的话', '比如：问题不大'],
  商品: ['一件商品', '比如：面粉'],
  商品2: ['另一件商品', '比如：洗衣液'],
  地点: ['一个具体地点', '比如：电影院'],
  城市: ['一座城市', '比如：北京'],
  城市2: ['另一座城市', '比如：首尔'],
  声音: ['一种声音', '比如：狗叫声'],
  天气: ['一种天气', '比如：暴雨'],
  天气2: ['另一种天气', '比如：暴雪'],
  年代: ['一个年代', '比如：明朝'],
  形容词: ['一个形容词', '比如：杂乱'],
  心情: ['一种心情', '比如：激动'],
  数字: ['一个数字', '比如：17'],
  服装: ['一件衣服', '比如：风衣'],
  气味: ['一种气味', '比如：蜜瓜味'],
  气味2: ['另一种气味', '比如：香蕉味'],
  水果: ['一种水果', '比如：阳光玫瑰'],
  水果2: ['另一种水果', '比如：猕猴桃'],
  物品: ['一件日常用品', '比如：充电器'],
  物品2: ['另一件日常用品', '比如：眼镜'],
  职业: ['一个职业', '比如：理发师'],
  节目: ['一种节目类型', '比如：选秀节目'],
  蔬菜: ['一种蔬菜', '比如：西红柿'],
  表演: ['一种表演', '比如：音乐剧'],
  读物: ['一种读物', '比如：漫画书'],
  身体部位: ['一个身体部位', '比如：鼻子'],
  配饰: ['一件配饰', '比如：耳钉'],
  风格: ['一种穿衣风格', '比如：复古'],
  鞋子: ['一双鞋', '比如：高跟鞋'],
  颜色: ['一种颜色', '比如：蓝色'],
  食物: ['一种食物', '比如：华夫饼'],
  食物2: ['另一种食物', '比如：麻辣香锅'],
  饮料: ['一种饮料', '比如：奶茶'],
  电影类型: ['一种电影类型', '比如：恐怖电影'],
  歌曲类型: ['一种歌曲风格或语言', '比如：英文歌'],
  语言: ['语言', '比如：英语'],
  爱好: ['一种爱好', '比如：摄影'],
  运动: ['一种运动', '比如：游泳'],
  称呼: ['一个称呼', '比如：老板'],
  节日: ['一个节日', '比如：春节'],
  交通工具: ['一种交通工具', '比如：公交车'],
  时间: ['一个时间', '比如：晚上八点'],
  音乐类型: ['一种音乐类型', '比如：摇滚乐'],
  烦恼: ['一种烦恼', '比如：工作压力'],
  演出类型: ['一种演出类型', '比如：音乐剧'],
};

const legacyExtras = {
  4: { keys: ['人名2', '地点'], text: '团建安排在{地点}，同事{人名2}负责记录每个人的展示。' },
  15: { keys: ['物品'], text: '工作人员找到那张评价表时，它正压在一件{物品}下面。' },
  22: { keys: ['物品'], text: '会议桌中央还放着一件{物品}，从开场到结束都没人解释用途。' },
  30: { keys: ['人名2'], text: '同事{人名2}是第一个发现这场身份误会的人。' },
  31: { keys: ['物品'], text: '比赛开始前，键盘旁还放着一件{物品}，被当成临时警戒线。' },
  35: { keys: ['人名2', '地点'], text: '游戏在{地点}进行，{人名2}负责发词卡和记录答案。' },
  65: { keys: ['物品'], text: '秘密借阅区的桌角还放着一件{物品}，像是有人刚刚离开。' },
};

const requiredNameInsertions = {
  70: {
    text: '这次联名由负责人{人名}统筹。',
    replace: [['负责人带着{心情}的心情回答', '{人名}带着{心情}的心情回答']],
  },
  72: {
    text: '榜单的评审理由由编辑{人名}负责撰写。',
    replace: [['于是他们重新设计了城市宣传语', '于是旅游局请{人名}重新设计城市宣传语']],
  },
  79: {
    text: '礼物清单由负责人{人名}统一准备。',
    replace: [['负责准备礼物的人心情开始变得{心情}', '{人名}的心情开始变得{心情}']],
  },
};

const groupRules = [
  {
    from: 101, to: 109, keys: ['天气', '服装', '心情'],
    text: { 天气: '那天正好是{天气}。', 服装: '{人名}当时穿着{服装}。', 心情: '事情开始前，{人名}的心情其实很{心情}。' },
  },
  {
    from: 110, to: 117, keys: ['地点', '食物', '心情'],
    text: { 地点: '观影前，大家先在{地点}会合。', 食物: '{人名}还带了一份{食物}进场。', 心情: '开场时，{人名}的心情是{心情}。' },
  },
  {
    from: 118, to: 125, keys: ['物品', '口味', '气味'],
    text: { 物品: '动手前，{人名}特意准备了一件{物品}。', 口味: '他原本希望成品是{口味}。', 气味: '厨房里很快出现了明显的{气味}。' },
  },
  {
    from: 126, to: 133, keys: ['天气', '心情', '食物'],
    text: { 天气: '那天外面是{天气}。', 心情: '事情开始前，{人名}的心情是{心情}。', 食物: '{人名}原本打算结束后去吃{食物}。' },
  },
  {
    from: 134, to: 142, keys: ['天气', '服装', '心情'],
    text: { 天气: '出门时正好是{天气}。', 服装: '{人名}当时穿着{服装}。', 心情: '出门前，{人名}的心情是{心情}。' },
  },
  {
    from: 143, to: 150, keys: ['地点', '食物', '心情', '物品'],
    text: { 地点: '两个人约在{地点}见面。', 食物: '见面前，他们刚一起吃过{食物}。', 心情: '事情开始时，两个人的心情都很{心情}。', 物品: '{人名}随手带着一件{物品}。' },
  },
];

function insertAfterFirstParagraph(template, addition) {
  const divider = template.indexOf('\n\n');
  if (divider < 0) return `${template}\n\n${addition}`;
  return `${template.slice(0, divider)}\n\n${addition}\n\n${template.slice(divider + 2)}`;
}

function questionFor(key) {
  const [prompt, placeholder] = questionMeta[key];
  return { key, prompt, placeholder };
}

function normalizeNameOrder(questions) {
  const canonical = questions.map((question) => {
    const meta = questionMeta[question.key];
    return meta ? { ...question, prompt: meta[0], placeholder: meta[1] } : question;
  });
  const firstName = canonical.find((question) => question.key === '人名');
  const secondName = canonical.find((question) => question.key === '人名2');
  const remaining = canonical.filter((question) => question.key !== '人名' && question.key !== '人名2');
  if (!firstName) return canonical;
  return [
    firstName,
    ...(secondName ? [secondName] : []),
    ...remaining,
  ];
}

export function ensureMinimumSixQuestions(story) {
  const storyNumber = Number(story.id.replace('story-', ''));
  let questions = [...story.questions];
  let template = story.template;

  const requiredName = requiredNameInsertions[storyNumber];
  if (!questions.some((question) => question.key === '人名')) {
    if (!requiredName) throw new Error(`Story ${story.id} has no name question.`);
    questions.push(questionFor('人名'));
    template = insertAfterFirstParagraph(template, requiredName.text);
    for (const [from, to] of requiredName.replace) template = template.replace(from, to);
  }

  const legacy = legacyExtras[storyNumber];
  if (legacy) {
    const existingKeys = new Set(questions.map((question) => question.key));
    const keys = legacy.keys.filter((key) => !existingKeys.has(key));
    questions.push(...keys.map(questionFor));
    template = insertAfterFirstParagraph(template, legacy.text);
  }

  if (questions.length < 6) {
    const rule = groupRules.find(({ from, to }) => storyNumber >= from && storyNumber <= to);
    if (!rule) throw new Error(`Story ${story.id} has fewer than six questions and no enrichment rule.`);

    const existingKeys = new Set(questions.map((question) => question.key));
    const neededKeys = rule.keys.filter((key) => !existingKeys.has(key)).slice(0, 6 - questions.length);
    questions.push(...neededKeys.map(questionFor));
    template = insertAfterFirstParagraph(template, neededKeys.map((key) => rule.text[key]).join('\n\n'));
  }

  return { ...story, questions: normalizeNameOrder(questions), template };
}
