import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'minitool-dist');
const allowed = new Set(['.html','.css','.js','.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.json']);
const forbidden = [
  /fetch\s*\(/, /XMLHttpRequest/, /new\s+WebSocket\s*\(/, /new\s+EventSource\s*\(/,
  /new\s+RTCPeerConnection\s*\(/, /new\s+(?:Shared)?Worker\s*\(/,
  /navigator\.geolocation/, /navigator\.clipboard/, /document\.execCommand\s*\(\s*['"](?:copy|cut|paste)/,
  /navigator\.(?:bluetooth|usb|hid|serial|getBattery|connection|credentials|locks)/,
  /navigator\.mediaDevices\.(?:enumerateDevices|getDisplayMedia)/,
  /navigator\.storage\.persist/, /navigator\.serviceWorker/,
  /new\s+(?:Accelerometer|Gyroscope|Magnetometer)\s*\(/,
  /DeviceMotionEvent|DeviceOrientationEvent|['"](?:devicemotion|deviceorientation)['"]/,
  /requestFullscreen\s*\(|webkitRequestFullscreen\s*\(/,
  /window\.open\s*\(/, /window\.prompt\s*\(/, /WebAssembly\./,
  /eval\s*\(/, /new\s+Function\s*\(/, /<iframe\b/i, /<object\b/i,
  /<base\b/i, /javascript:/i, /target=["']_blank["']/i, /\sdownload(?:=|\s|>)/i,
];

async function filesAt(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const full = resolve(path, entry.name);
    return entry.isDirectory() ? filesAt(full) : [full];
  }));
  return nested.flat();
}

const files = await filesAt(outDir);
const errors = [];
for (const file of files) {
  if (!allowed.has(extname(file).toLowerCase())) errors.push(`不支持的文件类型：${file}`);
  if (['.html','.css','.js'].includes(extname(file))) {
    const content = await readFile(file, 'utf8');
    for (const pattern of forbidden) if (pattern.test(content)) errors.push(`禁用能力 ${pattern}：${file}`);
    if (extname(file) === '.html' && /(?:src|href)=["']https?:\/\//i.test(content)) {
      errors.push(`HTML 外部资源：${file}`);
    }
    if (extname(file) === '.css' && /url\(["']?https?:\/\//i.test(content)) {
      errors.push(`CSS 外部资源：${file}`);
    }
  }
}

const html = await readFile(resolve(outDir, 'index.html'), 'utf8');
if (!/viewport-fit=cover/.test(html)) errors.push('viewport 缺少 viewport-fit=cover');
if (/type=["']module["']/i.test(html) || /<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) errors.push('脚本不是外置经典脚本');
if (!/src=["']\.\/assets\/app\.js["']/.test(html)) errors.push('脚本路径不是相对路径');
if (!/href=["']\.\/assets\/app\.css["']/.test(html)) errors.push('样式路径不是相对路径');
if (!/^<!doctype html>/i.test(html)) errors.push('缺少 DOCTYPE');
if (!/<html\s+lang=["']zh-CN["']/i.test(html)) errors.push('HTML 语言不是 zh-CN');

const totalBytes = (await Promise.all(files.map((file) => stat(file)))).reduce((sum, item) => sum + item.size, 0);
if (totalBytes > 10 * 1024 * 1024) errors.push('未压缩产物超过 10MB');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(JSON.stringify({ status:'PASS', files:files.length, totalBytes }, null, 2));
