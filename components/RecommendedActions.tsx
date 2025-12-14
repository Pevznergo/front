
'use client';

import { Receipt, AlertTriangle, XCircle, Bot } from 'lucide-react';

export default function RecommendedActions() {
    const actions = [
        {
            title: "Lower a bill",
            description: "Save on monthly expenses",
            icon: <Receipt className="w-5 h-5 text-pink-500" />,
            iconBg: "bg-pink-100",
            provider: "T-Mobile",
            savings: "$25 saved"
        },
        {
            title: "File a Complaint",
            description: "Get what you deserve",
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            iconBg: "bg-amber-100",
            provider: "Better Business Bureau"
        },
        {
            title: "Cancel Subscription",
            description: "Stop unwanted charges",
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            iconBg: "bg-red-100",
            provider: "Netflix"
        },
        {
            title: "Handle It For Me",
            description: "AI General Agent",
            icon: <Bot className="w-5 h-5 text-indigo-500" />,
            iconBg: "bg-indigo-100",
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {actions.map((action, index) => (
                <div key={index} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-48 relative overflow-hidden">
                    <div className="mb-auto">
                        <h3 className="font-semibold text-slate-900">{action.title}</h3>
                        {action.provider && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{action.provider}</span>
                                {action.savings && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">{action.savings}</span>}
                            </div>
                        )}
                    </div>

                    <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mt-4 self-start`}>
                        {action.icon}
                    </div>

                    {/* Decorative hover effect */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            ))}
        </div>
    );
}
