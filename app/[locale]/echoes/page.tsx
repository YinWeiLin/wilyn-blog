import fs from 'fs';
import path from 'path';
import EchoesPage, { Message } from '@/components/echoes';

const dataPath = path.join(process.cwd(), 'data', 'echoes.json');

const EchoesRoute = () => {
    let messages: Message[] = [];
    try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        messages = JSON.parse(raw);
    } catch {
        messages = [];
    }

    return <EchoesPage messages={messages} />;
};

export default EchoesRoute;
