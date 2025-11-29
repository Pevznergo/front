'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Loader2, Settings, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react'
import AdminTariffModal from '@/components/admin/AdminTariffModal'
import AdminPartnerModal, { Partner } from '@/components/admin/AdminPartnerModal'
import { revalidateAll } from '@/app/actions/revalidate'

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPartnerForTariffs, setSelectedPartnerForTariffs] = useState<Partner | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [filter, setFilter] = useState<'all' | 'platform' | 'partner'>('all')
    const [isClearingCache, setIsClearingCache] = useState(false)

    useEffect(() => {
        fetchPartners()
    }, [])

    const fetchPartners = async () => {
        try {
            const res = await fetch('/api/admin/partners')
            const data = await res.json()
            if (Array.isArray(data)) {
                setPartners(data)
            } else {
                console.error('API returned non-array:', data)
                setPartners([])
            }
        } catch (error) {
            console.error('Failed to fetch partners', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClearCache = async () => {
        setIsClearingCache(true)
        try {
            const result = await revalidateAll()
            if (result.success) {
                alert('Cache cleared successfully!')
                fetchPartners() // Refresh local list too
            } else {
                alert('Failed to clear cache')
            }
        } catch (error) {
            console.error('Clear cache error:', error)
            alert('Error clearing cache')
        } finally {
            setIsClearingCache(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will delete the partner and ALL their tariffs.')) return

        try {
            const res = await fetch(`/api/admin/partners?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setPartners(partners.filter(p => p.id !== id))
            } else {
                alert('Failed to delete partner')
            }
        } catch (error) {
            console.error('Failed to delete partner', error)
        }
    }

    const handleCreateSuccess = (newPartner: Partner) => {
        setPartners([newPartner, ...partners])
    }

    const filteredPartners = partners.filter(p => {
        if (filter === 'platform') return p.is_platform
        if (filter === 'partner') return p.is_partner
        return true
    })

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Partners & Tariffs</h1>
                    <p className="text-gray-500 mt-1">Manage your ecosystem partners and their pricing plans.</p>
                </div>
                <div className="flex gap-3 self-start md:self-auto">
                    <button
                        onClick={handleClearCache}
                        disabled={isClearingCache}
                        className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isClearingCache ? 'animate-spin' : ''}`} />
                        {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-500 text-white py-2.5 px-5 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add Partner
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-gray-200/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('platform')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'platform' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Platforms
                </button>
                <button
                    onClick={() => setFilter('partner')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'partner' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Partners
                </button>
            </div>

            {/* List View */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading partners...</div>
                ) : filteredPartners.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No partners found matching your filter.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredPartners.map(partner => (
                            <div key={partner.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                {/* Left: Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <img src={partner.logo} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100 bg-white" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">{partner.name}</h3>
                                            <div className="flex gap-1">
                                                {partner.is_platform && (
                                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Platform
                                                    </span>
                                                )}
                                                {partner.is_partner && (
                                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        Partner
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">{partner.age}</p>
                                    </div>
                                </div>

                                {/* Middle: Details (Hidden on mobile) */}
                                <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 flex-1 justify-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-semibold uppercase text-gray-400">Discount</span>
                                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-xs">Dynamic</span>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={() => setSelectedPartnerForTariffs(partner)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Manage Tariffs
                                    </button>
                                    <button
                                        onClick={() => handleDelete(partner.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Partner"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AdminPartnerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={fetchPartners}
            />

            {selectedPartnerForTariffs && (
                <AdminTariffModal
                    isOpen={!!selectedPartnerForTariffs}
                    onClose={() => setSelectedPartnerForTariffs(null)}
                    partner={selectedPartnerForTariffs}
                />
            )}
        </div>
    )
}
