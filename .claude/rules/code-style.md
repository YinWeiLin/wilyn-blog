# 代码规范

本项目中所有代码必须严格按照以下规范来添加或修改。

## TS/JS 规范

1. `if` 关键字必须使用大括号，即使只有一条语句。

## 样式规范

1. 所有涉及颜色、背景、边框的 Tailwind 类，必须同时提供浅色和深色两套值。
   - 浅色值直接写，深色值加 `dark:` 前缀。
   - 示例：`bg-zinc-100 dark:bg-zinc-900`、`text-zinc-900 dark:text-zinc-50`、`border-zinc-200 dark:border-zinc-800`
   - 禁止只写深色值（如单独写 `bg-zinc-900`），否则浅色模式下颜色异常。
