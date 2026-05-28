import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sanitizeText } from '@/lib/sanitize';

const dataPath = path.join(process.cwd(), 'data', 'echoes.json');

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { name, content } = body;

    if (!name || !content) {
        return NextResponse.json({ error: 'name and content are required' }, { status: 400 });
    }


    if (String(name).length > 10 || String(content).length > 50) {
        return NextResponse.json({}, { status: 200 });
    }

    let messages = [];
    try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        messages = JSON.parse(raw);
    } catch {
        messages = [];
    }

    const newMessage = {
        id: Date.now().toString(),
        name: sanitizeText(String(name)),
        content: sanitizeText(String(content)),
        createTime: new Date().toISOString(),
    };

    messages.push(newMessage);
    fs.writeFileSync(dataPath, JSON.stringify(messages, null, 4), 'utf-8');

    return NextResponse.json(newMessage, { status: 201 });
}
