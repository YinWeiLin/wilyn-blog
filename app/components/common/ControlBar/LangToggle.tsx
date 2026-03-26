"use client";

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const LangToggle = () => {
    const t = useTranslations('lang');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleToggle = () => {
        const nextLocale = locale === 'zh' ? 'en' : 'zh';
        const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        router.push(`/${nextLocale}${pathWithoutLocale}`);
    };

    return (
        <button
            onClick={handleToggle}
            className="w-[42px] rounded-lg bg-zinc-200 px-3 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
            {t('toggle')}
        </button>
    );
};

export default LangToggle;
