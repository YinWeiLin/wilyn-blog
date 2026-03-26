# 文件目录规范

## 组件放置规则

1. **跨页面复用的组件**放在 `app/components/common/` 下
   - 若该组件有子组件，建立同名子目录，入口文件命名为 `index.tsx`
   - 例：`app/components/common/ControlBar/index.tsx`

2. **页面私有组件**放在对应页面目录的 `components/` 子目录下
   - 例：`app/components/homePage/components/HeroSection.tsx`

3. **副作用类组件**（不渲染 UI，只执行副作用）放在 `app/components/common/providers/` 下
   - 例：`app/components/common/providers/ThemeUpdater.tsx`

4. **状态管理**放在 `app/store/` 下，文件命名为 `[name]Store.ts`
   - 例：`app/store/themeStore.ts`

## i18n 文案规范

1. 组件内**禁止硬编码**任何用户可见文字
2. 所有文案统一在 `messages/zh.json` 和 `messages/en.json` 中维护
3. 新增文案时两个文件必须同步更新
