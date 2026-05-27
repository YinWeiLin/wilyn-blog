"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';

const FeaturesSection = () => {
    const t = useTranslations('features');
    const sections = t.raw('sections') as {
        title: string;
        items: { title: string; description: string }[];
    }[];

    return (
        <section
            className="relative flex min-h-screen items-center px-6 py-20"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0f4ff] via-[#fdf6ff] to-[#fff7f0] dark:from-[#1e1b4b] dark:via-[#1e1b4b] dark:to-[#1e3a5f]" />
            <div className="absolute inset-0 bg-[url('/imgs/feature_page_background.png')] bg-center bg-no-repeat" style={{ backgroundSize: '50%' }} />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 lg:flex-row lg:items-center">

                {/* Left */}
                <div className="flex flex-col gap-8 lg:w-2/5">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-zinc-800 dark:text-zinc-200">
                        <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <h2 className="text-5xl font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                        {t('title1')}<br />{t('title2')}
                    </h2>
                    <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t('description')}
                    </p>
                    <Link href="/mbot" className="w-fit cursor-pointer rounded-full border border-zinc-900 px-7 py-3 text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white dark:border-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-200 dark:hover:text-zinc-900">
                        {t('cta')} →
                    </Link>
                </div>

                {/* Right - Preview Card */}
                <div className="lg:w-3/5 lg:translate-x-12">
                    <div className="rounded-2xl p-8 shadow-2xl backdrop-blur-md border bg-white/60 border-white/60 dark:bg-slate-900/70 dark:border-slate-700/50">
                        {sections.map((section, si) => (
                            <div key={si} className={si < sections.length - 1 ? 'mb-8' : ''}>
                                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
                                    {section.title}
                                </h3>
                                {section.items.map((item, ii) => (
                                    <div
                                        key={ii}
                                        className={`py-3 ${ii < section.items.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-700' : ''}`}
                                    >
                                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.title}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FeaturesSection;
