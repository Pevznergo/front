
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
    const faqs = [
        {
            question: "Do you guarantee removal?",
            answer: "We guarantee the best possible legal argument. No one can guarantee 100% removal as it ultimately depends on the platform's moderator. However, if our scan determines chances are low, we will tell you upfront before you pay."
        },
        {
            question: "Do you need my Google/Yelp password?",
            answer: "No. We work as an external representative. We provide you with the legal text to submit, or guide you to safe methods (like granting 'Manager' access) if deeper integration is needed. We never ask for your personal login credentials."
        },
        {
            question: "Is this legal?",
            answer: "Yes. We strictly follow the platform's own Terms of Service and Content Policies. We identify where a review violates these existing contracts and professionally flag it for removal."
        },
        {
            question: "How long does it take?",
            answer: "Our AI generates the appeal instantly (2 minutes). Platform moderators typically review appeals within 3-5 business days. Escalations via demand letter may take longer."
        }
    ];

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-8">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-start gap-3">
                                <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                                {faq.question}
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-8">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
