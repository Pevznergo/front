
'use client';

import { Shield, FileWarning, Receipt, Sparkles } from 'lucide-react';

export default function DashboardWidgets() {
    return (
        <div className="flex flex-wrap gap-4 mt-8">
            <button className="bg-[#1A6334] text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-[#14522B] transition-colors">
                <Sparkles className="w-3 h-3" />
                Recommended
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-slate-50 transition-colors">
                Save Money
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-slate-50 transition-colors">
                Solve Problems
            </button>
        </div>
    );
}
