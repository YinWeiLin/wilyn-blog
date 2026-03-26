"use client";
import {
    SunOutlined,
    MoonOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/store/themeStore';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();
    const t = useTranslations('theme');

    return (
        <button
            onClick={toggleTheme}
            className="rounded-lg bg-zinc-200 p-3 text-zinc-800 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            aria-label={t('toggle')}
        >
            {isDark ? (
                <SunOutlined />
            ) : (
                <MoonOutlined />
            )}
        </button>
    );
};

export default ThemeToggle;
