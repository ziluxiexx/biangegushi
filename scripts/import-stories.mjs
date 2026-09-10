import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Usage: node scripts/import-stories.mjs <pasted-text.txt>');

const root = resolve(import.meta.dirname, '..');
const source = await readFile(sourcePath, 'utf8');
const exampleByKey = {
  人名:'比如：Amy', 职业:'比如：摄影师', 食物:'比如：麻辣烫', 食物2:'比如：蛋糕',
  物品:'比如：雨伞', 物品2:'比如：拖鞋', 动作:'比如：转圈', 动物:'比如：企鹅',
  数字:'比如：17', 地点:'比如：图书馆', 颜色:'比如：黄色', 形容词:'比如：认真',
  蔬菜:'比如：西红柿', 年代:'比如：唐朝', 口头禅:'比如：问题不大',
  饮料:'比如：豆浆', 身体部位:'比如：膝盖', 水果:'比如：榴莲', 水果2:'比如：蓝莓',
};

const parsed = [];
for (const chunk of source.split(/### STORY /).slice(1)) {
  const number = chunk.match(/^(\d+)/)?.[1];
  const title = chunk.match(/标题：(.+)/)?.[1]?.trim();
  const questionBlock = chunk.match(/用户填写：\s*\n([\s\S]*?)\n\s*故事模板：/)?.[1] ?? '';
  const template = (chunk.match(/故事模板：\s*\n([\s\S]*?)\n\s*笑点设计：/)?.[1] ?? '')
    .trim()
    .replace(/\*\*/g, '');
  const questions = questionBlock.split('\n').map((line) => {
    const match = line.match(/^\s*\d+\.\s*(.+?)\s*→\s*\{(.+?)\}\s*$/);
    if (!match) return null;
    const [, prompt, key] = match;
    return { key, prompt, placeholder: exampleByKey[key] ?? '比如：随便填一个' };
  }).filter(Boolean);
  if (!number || !title || !template || !questions.length) {
    throw new Error(`Failed to parse story near: ${chunk.slice(0, 80)}`);
  }
  parsed.push({ id:`story-${number.padStart(2,'0')}`, title, questions, template });
}

const output = `// Generated from the supplied story document.\nexport const importedStories = ${JSON.stringify(parsed, null, 2)};\n`;
await writeFile(resolve(root, 'src/data/importedStories.js'), output, 'utf8');
console.log(`Imported ${parsed.length} stories: ${parsed[0]?.id}–${parsed.at(-1)?.id}`);
