"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { mbotApi } from '@/lib/mbotApi';
import ReactMarkdown from 'react-markdown';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    loading?: boolean;
};

const MbotPage = () => {
    const t = useTranslations('mbot');
    const suggestions = t.raw('suggestions') as string[];
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [ssid, setSsid] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) { return; }
        setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
        setInput('');
        setMessages(prev => [...prev, { role: 'assistant', content: '', loading: true }]);
        try {
            let reply: string;
            if (!ssid) {
                const data = await mbotApi.startSession(trimmed);
                setSsid(data.ssid);
                reply = data.reply;
            } else {
                const data = await mbotApi.chat(ssid, trimmed);
                reply = data.reply;
            }
            setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 ? { role: 'assistant', content: reply } : m
            ));
        } catch (err) {
            const msg = err instanceof Error ? err.message : '请求失败';
            setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 ? { role: 'assistant', content: msg } : m
            ));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-zinc-900">

            {/* Sidebar */}
            <aside className="flex w-60 flex-shrink-0 flex-col border-r border-zinc-200 px-3 py-4 dark:border-zinc-700">
                <button
                    onClick={() => { setMessages([]); setSsid(null); }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    {t('newChat')}
                </button>
            </aside>

            {/* Main */}
            <div className="relative flex flex-1 flex-col overflow-hidden">

                {/* Welcome / Messages */}
                {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-40">
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                            {t('greeting')}
                        </h1>
                        <div className="flex max-w-3xl flex-wrap justify-center gap-3">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => send(s)}
                                    className="cursor-pointer rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-6 py-8 pb-40">
                        <div className="mx-auto flex max-w-3xl flex-col gap-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="max-w-[70%] rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="max-w-[80%] text-sm leading-7 text-zinc-800 dark:text-zinc-200 prose prose-sm dark:prose-invert">
                                            {msg.loading ? (
                                                <span className="flex items-center gap-1">
                                                    {[0, 1, 2].map(i => (
                                                        <span
                                                            key={i}
                                                            className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
                                                            style={{ animation: 'dotBounce 1.2s infinite', animationDelay: `${i * 0.2}s` }}
                                                        />
                                                    ))}
                                                </span>
                                            ) : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('inputPlaceholder')}
                            className="w-full resize-none bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                onClick={() => send(input)}
                                disabled={!input.trim()}
                                className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-1.5 text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900"
                            >
                                {t('send')}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MbotPage;
