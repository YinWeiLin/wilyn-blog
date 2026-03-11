"use client";
import {
    SunOutlined,
    MoonOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/store/themeStore';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed right-6 top-6 z-50 rounded-lg bg-zinc-200 p-3 text-zinc-800 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            aria-label="切换主题"
        >
            {isDark ? (
                // 太阳图标 (亮色模式)
                <SunOutlined />
            ) : (
                // 月亮图标 (暗色模式)
                <MoonOutlined />
            )}
        </button>
    );
};

export default ThemeToggle;
