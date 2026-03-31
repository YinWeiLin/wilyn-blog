"use client";

import { useState } from 'react';

interface ContentInputProps {
    maxLength?: number;
    richText?: boolean;
    onSubmit: (data: { name: string; content: string }) => Promise<void>;
    disabled?: boolean;
    namePlaceholder?: string;
    contentPlaceholder?: string;
    submitLabel?: string;
    submittingLabel?: string;
}

const ContentInput = ({
    maxLength = 500,
    richText = false,
    onSubmit,
    disabled = false,
    namePlaceholder = 'Nickname',
    contentPlaceholder = 'Your message...',
    submitLabel = 'Submit',
    submittingLabel = 'Submitting...',
}: ContentInputProps) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const remaining = maxLength - content.length;
    const isOverLimit = remaining < 0;
    const canSubmit = !disabled && !submitting && name.trim().length > 0 && content.trim().length > 0 && !isOverLimit;

    const handleSubmit = async () => {
        if (!canSubmit) { return; }
        setSubmitting(true);
        try {
            await onSubmit({ name: name.trim(), content: content.trim() });
            setName('');
            setContent('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                disabled={disabled || submitting}
                className="rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {/* richText prop 预留给未来富文本编辑器集成，当前始终使用纯文本 */}
            {!richText && (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={contentPlaceholder}
                    disabled={disabled || submitting}
                    rows={3}
                    className="resize-none rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
                />
            )}
            <div className="flex items-center justify-between">
                <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {remaining}
                </span>
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                    {submitting ? submittingLabel : submitLabel}
                </button>
            </div>
        </div>
    );
};

export default ContentInput;
