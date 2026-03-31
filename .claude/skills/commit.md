---
name: commit
description: "完整提交流程：自动更新文档 → git add → git commit → git push"
user-invocable: true
---

# commit

完整提交流程：自动更新文档 → git add → git commit → git push。

**用法：**
- `/commit <commit message>` — 使用指定的提交信息
- `/commit` — 自动归纳提交信息，确认后再提交

## 执行步骤

### 第一步：收集本次变更

```bash
git diff HEAD --stat
git diff HEAD
git status
```

### 第二步：确定 commit message

- 如果用户**有传入** commit message，直接使用，跳到第三步。
- 如果用户**没有传入**，根据变更内容自动归纳一条简洁的 commit message，**用 AskUserQuestion 工具展示给用户确认**，用户修改或确认后再继续。未获确认前不得执行后续步骤。

### 第三步：阅读当前文档

读取以下所有文档文件：
- `.claude/CLAUDE.md`
- `.claude/rules/code-style.md`
- `.claude/rules/file-structure.md`

### 第四步：对比分析并更新文档

根据代码变更，逐一检查文档中以下几类内容是否需要更新：

1. **新增文件/目录** → 检查 `CLAUDE.md` 的「组件目录结构」和 `file-structure.md` 是否需要补充
2. **新增技术依赖** → 检查 `CLAUDE.md` 的「核心技术栈」是否需要补充
3. **新增编码模式或约定** → 检查 `code-style.md` 或 `CLAUDE.md` 是否需要记录
4. **新增 i18n namespace** → 检查 `CLAUDE.md` 的「国际化」章节是否需要更新
5. **新增 API 路由** → 检查是否需要在 `CLAUDE.md` 中记录
6. **修正了已有文档中的错误描述** → 直接修正对应内容

有需要更新的内容则直接修改对应文件，没有则跳过。

### 第五步：git add

```bash
git add -A
```

### 第六步：git commit

```bash
git commit -m "<确认后的 commit message>"
```

### 第七步：git push

```bash
git push
```

### 第八步：汇报结果

简洁输出：
- 文档更新了哪些内容（或「文档无需更新」）
- commit hash
- push 结果
