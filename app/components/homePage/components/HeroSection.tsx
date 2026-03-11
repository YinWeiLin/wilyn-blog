"use client";

import ThreeBackground from "./ThreeBackground";
import { useTheme } from "@/store/themeStore";

const HeroSection = () => {
    const isDark = useTheme((state) => state.isDark);

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 overflow-hidden">
            <ThreeBackground isDark={isDark} />
            <h1 className="relative z-10 text-center text-5xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-6xl md:text-7xl">
                欢迎来到 WiLyn 的赛博宫殿
            </h1>
            <p className="relative z-10 text-center text-xl text-zinc-600 dark:text-zinc-400 sm:text-2xl">
                记录技术探索，分享生活感悟
            </p>
            <button className="relative z-10 mt-4 rounded-lg bg-zinc-900 px-8 py-3 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                开始探索
            </button>
        </section>
    );
};

export default HeroSection;
