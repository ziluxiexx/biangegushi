# 编个故事

一个把随手填词变成意外故事的轻量小游戏，面向手机端和小红书小工具容器设计。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

故事内容与界面代码分离，最终运行使用 `src/data/finalStories.js` 中的本地故事库，不依赖后端或实时 AI 生成。
