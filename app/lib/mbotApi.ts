const BASE_URL = 'https://wilyn.com.cn/server/api';

async function post<T>(path: string, body: object): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) {
        throw new Error(json.error ?? '请求失败');
    }
    return json.data as T;
}

export const mbotApi = {
    startSession: (message: string, userId = 'default_user') =>
        post<{ ssid: string; reply: string }>('/session/start', { user_id: userId, message }),

    chat: (ssid: string, message: string) =>
        post<{ reply: string }>('/chat', { ssid, message }),
};
