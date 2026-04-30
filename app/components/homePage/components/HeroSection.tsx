"use client";

import { useTranslations } from 'next-intl';
import ThreeBackground from "./ThreeBackground";

const HeroSection = () => {
    const t = useTranslations('hero');

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 overflow-hidden md:items-end md:justify-end md:pb-24 md:pr-24">
            <ThreeBackground />
            <h1 className="relative z-10 text-center text-5xl font-bold text-zinc-50 sm:text-6xl md:text-right md:text-7xl">
                {t('title')}
            </h1>
            <p className="relative z-10 text-center text-xl text-zinc-300 sm:text-2xl md:text-right">
                {t('subtitle')}
            </p>
            <div className="relative z-10 mt-4 flex items-center gap-3">
                <span className="text-sm text-zinc-300">{t('cta')}</span>
                <div className="h-10 w-6 rounded-full border-2 border-zinc-300 p-1">
                    <div className="h-2 w-1.5 mx-auto rounded-full bg-zinc-300 animate-scroll-dot" />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
