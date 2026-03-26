"use client";

import { useTranslations } from 'next-intl';
import ThreeBackground from "./ThreeBackground";
import { useTheme } from "@/store/themeStore";

const HeroSection = () => {
    const isDark = useTheme((state) => state.isDark);
    const t = useTranslations('hero');

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 overflow-hidden md:items-end md:justify-end md:pb-24 md:pr-24">
            <ThreeBackground isDark={isDark} />
            <h1 className="relative z-10 text-center text-5xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-6xl md:text-right md:text-7xl">
                {t('title')}
            </h1>
            <p className="relative z-10 text-center text-xl text-zinc-600 dark:text-zinc-400 sm:text-2xl md:text-right">
                {t('subtitle')}
            </p>
            <button className="relative z-10 mt-4 rounded-lg bg-zinc-900 px-8 py-3 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                {t('cta')}
            </button>
        </section>
    );
};

export default HeroSection;
