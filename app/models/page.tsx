import { sql } from '@/lib/db';
import Header from '../../components/Header';
import { SiteFooter } from '../../components/site-footer';
import { ModelsList } from '../../components/models-list';

export const dynamic = 'force-dynamic';

export default async function ModelsPage() {
    let models: any[] = [];
    try {
        models = await sql`SELECT * FROM models_new ORDER BY created_at DESC`;
    } catch (error) {
        console.error("Failed to fetch models:", error);
    }

    // Serialize dates/decimals if needed, or pass as is if they are compatible
    // pg return types might need conversion (e.g. Date to string)
    const formattedModels = models.map(m => ({
        ...m,
        created_at: m.created_at?.toISOString() || new Date().toISOString(),
        cost_fal: m.cost_fal?.toString() || null,
        cost_our: m.cost_our?.toString() || null,
    }));

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            <Header />

            <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                <ModelsList initialModels={formattedModels} />
            </div>

            <SiteFooter />
        </main>
    );
}
