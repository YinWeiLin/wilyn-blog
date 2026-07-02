"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import ControlBar from '@/components/common/ControlBar';
import ContentInput from '@/components/common/ContentInput';
import MessageCard from './components/MessageCard';
import { API_ROUTES } from '@config/apiRoutes';
import { ROUTES } from '@config/routes';

export interface Message {
    id: string;
    name: string;
    content: string;
    createTime: string;
}

interface EchoesPageProps {
    messages: Message[];
}

const EchoesPage = ({ messages }: EchoesPageProps) => {
    const t = useTranslations('echoes');
    const locale = useLocale();
    const router = useRouter();
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    const sortedMessages = [...messages].sort((a, b) => {
        const diff = new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
        return order === 'asc' ? diff : -diff;
    });

    const handleSubmit = async (data: { name: string; content: string }) => {
        const res = await fetch(API_ROUTES.echoes, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error('Submit failed');
        }
        router.refresh();
    };

    return (
        <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
            <ControlBar />
            <div className="shrink-0 border-b border-zinc-200 px-6 pb-4 pt-6 dark:border-zinc-800">
                <Link
                    href={`/${locale}${ROUTES.home}`}
                    className="mb-4 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                    ← {t('back')}
                </Link>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('title')}</h1>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
                    </div>
                    <button
                        onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
                    >
                        {order === 'desc' ? t('sortDesc') : t('sortAsc')}
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                    {sortedMessages.map((msg) => (
                        <MessageCard key={msg.id} message={msg} />
                    ))}
                </div>
            </div>
            <div className="shrink-0 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <div className="mx-auto max-w-2xl">
                    <ContentInput
                        maxLength={500}
                        onSubmit={handleSubmit}
                        namePlaceholder={t('namePlaceholder')}
                        contentPlaceholder={t('contentPlaceholder')}
                        submitLabel={t('submit')}
                        submittingLabel={t('submitting')}
                    />
                </div>
            </div>
        </div>
    );
};

export default EchoesPage;
