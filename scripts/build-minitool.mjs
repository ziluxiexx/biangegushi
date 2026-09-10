import { build } from 'esbuild';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'minitool-dist');
const zipPath = resolve(root, '编个故事-小红书小工具.zip');

execFileSync(process.execPath, [resolve(root, 'scripts/generate-final-stories.mjs')], { stdio: 'inherit' });

await rm(outDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(resolve(outDir, 'assets'), { recursive: true });

await build({
  entryPoints: [resolve(root, 'src/main.jsx')],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  target: ['ios15', 'chrome100'],
  outfile: resolve(outDir, 'assets/app.js'),
  legalComments: 'none',
});

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#f4f0e8" />
    <meta name="description" content="先别问为什么，随便填几个词。" />
    <title>编个故事</title>
    <link rel="stylesheet" href="./assets/app.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="./assets/app.js"></script>
  </body>
</html>
`;

await writeFile(resolve(outDir, 'index.html'), html, 'utf8');

const appJsPath = resolve(outDir, 'assets/app.js');
let js = await readFile(appJsPath, 'utf8');
// React DOM includes optional network estimation and javascript: fallback strings.
// Neither is needed in the offline mini-tool container, so remove both from the artifact.
js = js
  .replaceAll('navigator.connection.downlink', '5')
  .replaceAll('navigator.connection', 'null')
  .replaceAll('javascript:', '#blocked-');
await writeFile(appJsPath, js, 'utf8');
if (/\b(?:import|export)\b/.test(js) || /eval\s*\(|new\s+Function\s*\(/.test(js)) {
  throw new Error('Bundled script contains a module keyword or dynamic code execution.');
}

execFileSync('zip', ['-q', '-r', zipPath, '.'], { cwd: outDir });
const zipSize = (await stat(zipPath)).size;
console.log(JSON.stringify({ outDir, zipPath, zipSize }, null, 2));
