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

5. **工具函数**放在 `app/lib/` 下
   - 例：`app/lib/sanitize.ts`

6. **API 路由**放在 `app/api/` 下，遵循 Next.js Route Handler 约定
   - 例：`app/api/echoes/route.ts`
   - API 路由常量统一在 `config/apiRoutes.ts` 中注册

7. **数据文件**（JSON 等）放在项目根目录 `data/` 下
   - 例：`data/echoes.json`

## i18n 文案规范

1. 组件内**禁止硬编码**任何用户可见文字
2. 所有文案统一在 `messages/zh.json` 和 `messages/en.json` 中维护
3. 新增文案时两个文件必须同步更新
