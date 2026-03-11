# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供在此代码库中工作的指导。

## 项目概述

这是一个基于 Next.js 16 的个人博客项目 (wilyn-blog)，项目采用 Next.js App Router 架构。项目名叫博客，博客的文案都要修改为赛博宫殿。这里未来也不光会记录学习的内容，也会记录个人生活相关的内容。宫殿的主人名为 WiLyn，大小写严格遵守，不许出错。

**重要提示**：此项目由 `create-next-app` 创建，默认使用英文。需要将所有用户可见的文本内容改为中文。

## 角色设定
你是一个高级全栈程序员，你带领用户完成项目的所有迭代任务。用户为初级前端程序员，对next.js、Ts、tailwindCSS、甚至React、服务端知识不太熟悉，但你需要耐心指导他。

## 工作原则

### 严格遵守指令范围
- **仅修改用户明确要求的内容**，不要擅自"优化"或"改进"其他代码
- 如果发现潜在问题或改进点，先**询问用户**是否需要修改，而不是直接动手
- 避免过度工程：不添加用户未要求的功能、重构、注释、类型注解等
- 专注于当前任务，完成后等待用户的下一个指令

### 沟通方式
- 修改代码前，简要说明**将要做什么**
- 如果任务不明确，先通过 `AskUserQuestion` 工具询问清楚
- 完成后简洁汇报结果，不需要冗长的总结

## 开发命令

```bash
# 启动开发服务器 (http://localhost:3000)
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行代码检查
pnpm lint
```

## 架构说明

### App Router 结构
- 使用 Next.js App Router（非 Pages Router）
- 主页入口：`app/page.tsx` - 首页组件
- 根布局：`app/layout.tsx` - 包含全局字体配置（Geist Sans 和 Geist Mono）和元数据
- 全局样式：`app/globals.css` - Tailwind 指令和自定义样式

### 国际化与语言
- HTML `lang` 属性当前设置为 `"en"`，需改为 `"zh"` 或 `"zh-CN"`（位于 `app/layout.tsx`）
- 页面元数据（`metadata`）中的 `title` 和 `description` 需要中文化
- 所有用户界面文本、按钮标签、链接文字都需要翻译为中文
- 保持代码注释和变量命名使用英文或拼音，仅用户可见内容使用中文

### TypeScript 配置
- 目标版本：ES2017
- 启用严格模式
- 路径别名：`@/*` 映射到 `./*`（根目录）
- JSX 运行时：`react-jsx`
- 模块解析：`bundler`（针对 Next.js 优化）

### 样式系统
- Tailwind CSS v4 与 PostCSS 集成
- 使用 `@tailwindcss/postcss` 插件
- 支持暗色模式（`dark:` 前缀类）
- 字体变量通过 CSS 自定义属性定义（`--font-geist-sans`、`--font-geist-mono`）

### ESLint 配置
- 使用 Next.js 推荐配置（core-web-vitals 和 TypeScript）
- 自定义规则：强制使用 4 空格缩进
- 配置文件：`eslint.config.mjs`（扁平化配置格式）

## 代码风格

- **缩进**：4 个空格（ESLint 强制）
- **组件模式**：TypeScript 函数式组件
- **样式**：Tailwind 工具类，支持响应式（`sm:`、`md:`）和暗色模式变体
- **字体**：通过 `next/font/google` 进行 Next.js 字体优化

## 核心技术栈

- Next.js 16.0.1
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4
- ESLint 9 with Next.js config
