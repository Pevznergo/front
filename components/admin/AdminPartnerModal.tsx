'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Save } from 'lucide-react'

export interface Partner {
    id: number
    name: string
    role: string
    age: string
    bio: string
    looking_for: string
    discount: string
    logo: string
    is_platform: boolean
    is_partner: boolean
}

interface AdminPartnerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (partner: Partner) => void
    partnerToEdit?: Partner | null
}

export default function AdminPartnerModal({ isOpen, onClose, onSuccess, partnerToEdit }: AdminPartnerModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<Omit<Partner, 'id'> & { id?: number }>({
        name: '',
        role: '',
        age: 'Hidden', // Default value since field is hidden
        bio: '',
        looking_for: '',
        discount: '',
        logo: '',
        is_platform: false,
        is_partner: true
    })

    useEffect(() => {
        if (isOpen) {
            if (partnerToEdit) {
                setFormData(partnerToEdit)
            } else {
                // Reset for new partner
                setFormData({
                    name: '',
                    role: '',
                    age: 'Hidden',
                    bio: '',
                    looking_for: '',
                    discount: '',
                    logo: '',
                    is_platform: false,
                    is_partner: true
                })
            }
        }
    }, [isOpen, partnerToEdit])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Determine if we are creating or updating (logic would be in API or handled here if we had separate endpoints)
            // For now, assuming this is just for creation based on previous implementation, 
            // but let's make it robust. If ID exists, it's an update (though our current API might only support POST/DELETE)
            // The current API at /api/admin/partners only supports GET, POST (create), DELETE.
            // So for now, this will primarily be for CREATION. Editing would require API update.
            // I'll implement it as Create for now.

            const res = await fetch('/api/admin/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const newPartner = await res.json()
                onSuccess(newPartner)
                onClose()
            } else {
                alert('Failed to save partner')
            }
        } catch (error) {
            console.error('Failed to save partner', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-[#F2F2F7] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-900">
                        {partnerToEdit ? 'Edit Partner' : 'Add New Partner'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Canva"
                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. The Designer"
                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Logo URL</label>
                                    <input
                                        type="text"
                                        placeholder="/logos/canva.png"
                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                                        value={formData.logo}
                                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Discount</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 50% OFF"
                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                                        value={formData.discount}
                                        onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Looking For</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Design Partners"
                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                                        value={formData.looking_for}
                                        onChange={e => setFormData({ ...formData, looking_for: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Bio</label>
                                    <textarea
                                        placeholder="Short description..."
                                        className="w-full bg-gray-50 border-0 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Roles Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Roles</h3>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-gray-300 text-purple-600 focus:ring-purple-500"
                                        checked={formData.is_platform}
                                        onChange={e => setFormData({ ...formData, is_platform: e.target.checked })}
                                    />
                                    <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">Is Platform?</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-gray-300 text-green-600 focus:ring-green-500"
                                        checked={formData.is_partner}
                                        onChange={e => setFormData({ ...formData, is_partner: e.target.checked })}
                                    />
                                    <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors">Is Partner?</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            Save Partner
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
