'use client';

import ModelPageLayout from '@/components/ModelPageLayout';
import { Sparkles } from 'lucide-react';

export default function ClaudePage() {
    return (
        <ModelPageLayout
            title="Claude 3.5 Sonnet"
            subtitle="Лучшая нейросеть для написания кода, анализа больших текстов и креативного письма. Доступна в России бесплатно."
            gradient="from-orange-400 to-red-500"
            icon={<Sparkles className="w-5 h-5" />}
            features={[
                "Контекстное окно 200К токенов",
                "Лучшее понимание нюансов языка",
                "Идеальна для программирования",
                "Меньше 'галлюцинаций' чем у GPT"
            ]}
            description="Claude 3.5 Sonnet — это прорыв в области искусственного интеллекта от компании Anthropic. Эта модель превосходит GPT-4 во многих задачах, связанных с рассуждениями, написанием кода и анализом данных. Главное преимущество Claude — 'человечность' ответов и способность удерживать огромный контекст диалога без потери смысла."
        />
    );
}
