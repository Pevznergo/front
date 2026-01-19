'use client';

import ModelPageLayout from '@/components/ModelPageLayout';
import { Zap } from 'lucide-react';

export default function GeminiPage() {
    return (
        <ModelPageLayout
            title="Google Gemini 1.5"
            subtitle="Самая мощная мультимодальная модель от Google. Анализирует текст, код и изображения одновременно."
            gradient="from-blue-400 to-purple-500"
            icon={<Zap className="w-5 h-5" />}
            features={[
                "Огромное контекстное окно до 1М токенов",
                "Глубокая интеграция знаний Google",
                "Высокая скорость работы",
                "Мультимодальность"
            ]}
            description="Gemini 1.5 Pro — это флагманская модель от Google DeepMind, созданная для решения самых сложных задач. Её уникальная особенность — гигантское контекстное окно, позволяющее загружать целые книги или базы кода для анализа. В Aporto вы получаете доступ к этой мощи без необходимости использовать VPN или зарубежные аккаунты Google."
        />
    );
}
