"use client";

import { useTranslations } from 'next-intl';

const ContactSection = () => {
    const t = useTranslations('contact');

    return (
        <section className="flex min-h-[50vh] flex-col items-center justify-center bg-zinc-900 px-6 py-20 dark:bg-zinc-950">
            <div className="w-full max-w-4xl text-center">
                <h2 className="mb-8 text-4xl font-bold text-zinc-50">
                    {t('title')}
                </h2>
                <p className="mb-8 text-lg text-zinc-300">
                    {t('subtitle')}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <a
                        href="mailto:contact@example.com"
                        className="rounded-lg bg-zinc-50 px-6 py-3 text-zinc-900 transition-colors hover:bg-zinc-200"
                    >
                        {t('email')}
                    </a>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-zinc-50 px-6 py-3 text-zinc-50 transition-colors hover:bg-zinc-800"
                    >
                        GitHub
                    </a>
                </div>
                <p className="mt-12 text-sm text-zinc-500">
                    {t('copyright')}
                </p>
            </div>
        </section>
    );
};

export default ContactSection;
