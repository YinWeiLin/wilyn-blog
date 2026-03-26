"use client";

import { useTranslations } from 'next-intl';

const FeaturesSection = () => {
    const t = useTranslations('features');
    const items = t.raw('items') as { title: string; description: string }[];

    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-6 py-20 dark:bg-zinc-800">
            <div className="w-full max-w-6xl">
                <h2 className="mb-12 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                    {t('title')}
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-700"
                        >
                            <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {item.title}
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-300">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
