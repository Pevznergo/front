import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Info, Truck, ShoppingBasket, Users } from 'lucide-react'
import { useState } from 'react'
import ReferralModal from './ReferralModal'

interface TasksModalProps {
    isOpen: boolean
    onClose: () => void
    initData?: string // Pass initData to ReferralModal
}

export default function TasksModal({ isOpen, onClose, initData }: TasksModalProps) {
    const [isReferralOpen, setIsReferralOpen] = useState(false)

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        {/* Modal Panel */}
                        <motion.div
                            key="panel"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-[#252527] text-white rounded-t-3xl sm:rounded-3xl p-6 pb-0 relative z-10 flex flex-col max-h-[85vh]"
                        >
                            {/* Handle Bar (Mobile) */}
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 absolute top-3 left-1/2 -translate-x-1/2" />

                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-1">Даём монетки за задания</h2>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Они приходят в течение суток после получения заказа
                                </p>
                            </div>

                            {/* Scrollable Content Container */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6 pt-4"> {/* Negative margin to touch edges, padding to content */}
                                {/* Tasks List */}
                                <div className="flex flex-col gap-3">

                                    {/* Referral Task (NEW) */}
                                    <div
                                        onClick={() => setIsReferralOpen(true)}
                                        className="bg-[#353537] rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer border border-yellow-500/20"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold truncate text-white">Пригласи друга</span>
                                                <span className="text-[10px] text-gray-400">Бонусы за регистрацию и PRO</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex flex-col items-end leading-none">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-yellow-400 text-sm">+200₽</span>
                                                </div>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase">+30 Points</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Marketplace Task 1 */}
                                    <div className="bg-[#353537] rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shrink-0">
                                            <span className="font-bold text-lg italic text-white">M</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium truncate">Сделайте любой заказ на Маркете</span>
                                                <Info className="w-3 h-3 text-gray-500 shrink-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-white">+10</span>
                                                <div className="w-4 h-4 rounded-full border border-[#facc15] bg-[#facc15]/20 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Marketplace Task 2 */}
                                    <div className="bg-[#353537] rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shrink-0">
                                            <span className="font-bold text-lg italic text-white">M</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium leading-tight">Сделайте заказ от 5000 ₽ на Маркете</span>
                                                <Info className="w-3 h-3 text-gray-500 shrink-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-white">+50</span>
                                                <div className="w-4 h-4 rounded-full border border-[#facc15] bg-[#facc15]/20 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Marketplace Task 3 */}
                                    <div className="bg-[#353537] rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shrink-0">
                                            <span className="font-bold text-lg italic text-white">M</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium leading-tight">Сделайте заказ от 10000 ₽ на Маркете</span>
                                                <Info className="w-3 h-3 text-gray-500 shrink-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-white">+100</span>
                                                <div className="w-4 h-4 rounded-full border border-[#facc15] bg-[#facc15]/20 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>

                                </div>

                                {/* Games Header */}
                                {/* <div className="mt-6 mb-3">
                                    <h3 className="text-xl font-bold">Игры</h3>
                                </div> */}

                                {/* Games List */}
                                {/* <div className="flex flex-col gap-3">
                                    <div className="bg-[#353537] rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                            <Truck className="w-6 h-6 text-red-500 relative z-10" />
                                            <div className="absolute inset-0 bg-red-500/10" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium leading-tight">3 км без аварий в игре Маркет Rush</span>
                                                <Info className="w-3 h-3 text-gray-500 shrink-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-white">+10</span>
                                                <div className="w-4 h-4 rounded-full border border-[#facc15] bg-[#facc15]/20 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>

                                    <div className="bg-[#353537] rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                            <ShoppingBasket className="w-6 h-6 text-purple-400 relative z-10" />
                                            <div className="absolute inset-0 bg-purple-500/10" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium leading-tight">Пройдите испытание на время в Match World</span>
                                                <Info className="w-3 h-3 text-gray-500 shrink-0" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-white">+10</span>
                                                <div className="w-4 h-4 rounded-full border border-[#facc15] bg-[#facc15]/20 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>
                                </div> */}

                                {/* Footer text */}
                                <div className="mt-6 text-center pb-8">
                                    <span className="text-xs text-gray-500 underline decoration-gray-600">Условия акции</span>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ReferralModal
                isOpen={isReferralOpen}
                onClose={() => setIsReferralOpen(false)}
                initData={initData}
            />
        </>
    )
}

