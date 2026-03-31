import { Message } from '../index';

const formatTime = (iso: string): string => {
    const d = new Date(iso);
    const Y = d.getFullYear();
    const M = d.getMonth() + 1;
    const D = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

const MessageCard = ({ message }: { message: Message }) => {
    return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center gap-2 text-sm">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{message.name}</span>
                <span className="text-zinc-400 dark:text-zinc-600">·</span>
                <span className="text-zinc-500">{formatTime(message.createTime)}</span>
            </div>
            <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{message.content}</p>
        </div>
    );
};

export default MessageCard;
