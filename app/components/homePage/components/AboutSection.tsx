"use client";

import { useTranslations } from 'next-intl';

const AboutSection = () => {
    const t = useTranslations('about');

    return (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
            <div className="w-full max-w-4xl">
                <h2 className="mb-8 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                    {t('title')}
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <p>{t('desc1')}</p>
                    <p>{t('desc2')}</p>
                    <p className="text-center text-base text-zinc-500 dark:text-zinc-400">
                        {t('desc3')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
