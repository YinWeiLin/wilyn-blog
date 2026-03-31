export const sanitizeText = (str: string): string => {
    return str
        // 剥离 <script> 标签及其内部内容
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        // 移除内联事件属性：onclick= / onerror=（有无引号均覆盖）
        .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
        // 移除 javascript: 协议（兼容中间有空格的变体）
        .replace(/javascript\s*:/gi, '')
        .trim();
};
