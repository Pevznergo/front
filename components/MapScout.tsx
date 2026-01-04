"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, Loader2, Send, Check, X, Square, CheckSquare, Trash2 } from "lucide-react";

// Fix Leaflet marker icons
if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
}

interface Address {
    title: string;
    lat: number;
    lon: number;
    street: string;
    house: string;
    city?: string;
}

interface MapScoutProps {
    onAddressesFound: (addresses: Address[]) => void;
}

function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
    const map = useMap();

    useEffect(() => {
        const handler = () => onBoundsChange(map.getBounds());
        map.on("moveend", handler);
        onBoundsChange(map.getBounds()); // Initial
        return () => { map.off("moveend", handler); };
    }, [map, onBoundsChange]);

    return null;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function MapScout({ onAddressesFound }: MapScoutProps) {
    const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
    const [loading, setLoading] = useState(false);
    const [found, setFound] = useState<Address[]>([]);
    const [deselected, setDeselected] = useState<Set<string>>(new Set());
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const handleExtract = async () => {
        if (!bounds) return;
        setLoading(true);
        try {
            const res = await fetch("/api/map/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bounds: {
                        s: bounds.getSouth(),
                        w: bounds.getWest(),
                        n: bounds.getNorth(),
                        e: bounds.getEast()
                    }
                })
            });
            const data = await res.json();
            if (res.ok) {
                setFound(data.addresses);
                setDeselected(new Set()); // Reset on new extract

                // Auto-detect city from first address that has it
                const firstCity = data.addresses.find((a: Address) => a.city)?.city;
                if (firstCity) {
                    setSelectedDistrict(firstCity);
                }

                onAddressesFound(data.addresses.map((a: Address) => ({
                    ...a,
                    district: firstCity || selectedDistrict
                })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filtered = found.filter(a => !deselected.has(a.title));
        onAddressesFound(filtered.map(a => ({ ...a, district: selectedDistrict })));
    }, [selectedDistrict, found, deselected, onAddressesFound]);

    const toggleAddress = (title: string) => {
        const newDeselected = new Set(deselected);
        if (newDeselected.has(title)) {
            newDeselected.delete(title);
        } else {
            newDeselected.add(title);
        }
        setDeselected(newDeselected);
    };

    const handleClearDeselected = () => {
        setDeselected(new Set());
    };

    const handleRemoveAll = () => {
        setFound([]);
        setDeselected(new Set());
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([59.9343, 30.3351]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
            }
        } catch (e) {
            console.error("Search error:", e);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-white/10 rounded-3xl overflow-hidden bg-slate-900/50">
            {/* Control Panel */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            placeholder="Поиск адреса (напр. Невский 1)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg text-indigo-400 disabled:opacity-50"
                        >
                            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        </button>
                    </div>

                    <div className="flex-1 max-w-sm relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            placeholder="Город (заполнится автоматически)"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {found.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-500/10 px-3 py-2 rounded-xl">
                                    Выбрано: {found.length - deselected.size}
                                </span>
                                <button
                                    onClick={handleRemoveAll}
                                    className="p-2 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-xl transition-all"
                                    title="Очистить список"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleExtract}
                            disabled={loading}
                            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Собрать адреса
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Scrollable List */}
                {found.length > 0 && (
                    <div className="w-64 border-r border-white/10 bg-black/20 flex flex-col z-10">
                        <div className="p-3 border-b border-white/10 text-[10px] uppercase font-bold text-slate-500 flex justify-between items-center">
                            <span>Список домов</span>
                            {deselected.size > 0 && (
                                <button onClick={handleClearDeselected} className="text-indigo-400 hover:text-white transition-colors">Выбрать все</button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {found.map((addr) => {
                                const isDeselected = deselected.has(addr.title);
                                return (
                                    <div
                                        key={addr.title}
                                        onClick={() => toggleAddress(addr.title)}
                                        className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all ${isDeselected ? 'opacity-40 grayscale hover:opacity-60' : 'bg-white/5 hover:bg-white/10'}`}
                                    >
                                        {isDeselected ? <Square className="w-3 h-3 text-slate-500" /> : <CheckSquare className="w-3 h-3 text-indigo-400" />}
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-medium text-white truncate">{addr.street}</span>
                                            <span className="text-[10px] text-slate-500">{addr.house}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Map */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={mapCenter}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <ChangeView center={mapCenter} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapEvents onBoundsChange={setBounds} />

                        {found.map((addr, idx) => {
                            const isDeselected = deselected.has(addr.title);
                            return (
                                <Marker
                                    key={idx}
                                    position={[addr.lat, addr.lon]}
                                    opacity={isDeselected ? 0.4 : 1}
                                    eventHandlers={{
                                        click: () => toggleAddress(addr.title)
                                    }}
                                >
                                    <Popup>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-bold text-slate-900">{addr.title}</div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleAddress(addr.title);
                                                }}
                                                className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${isDeselected ? 'bg-indigo-600 text-white' : 'bg-red-500 text-white'}`}
                                            >
                                                {isDeselected ? 'Выбрать' : 'Удалить'}
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Hint Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-950/80 backdrop-blur border border-white/10 rounded-full text-[10px] text-slate-500 uppercase tracking-widest font-medium z-[1000] pointer-events-none">
                    Нажимайте на дома или список для выбора
                </div>
            </div>
        </div>
    );
}
