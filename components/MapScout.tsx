"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, Loader2, Send, Check } from "lucide-react";

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

export default function MapScout({ onAddressesFound }: MapScoutProps) {
    const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
    const [loading, setLoading] = useState(false);
    const [found, setFound] = useState<Address[]>([]);
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
                onAddressesFound(data.addresses.map((a: Address) => ({
                    ...a,
                    district: selectedDistrict
                })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-white/10 rounded-3xl overflow-hidden bg-slate-900/50">
            {/* Control Panel */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex-1 max-w-sm relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        placeholder="Название района для очереди (напр. Приморский)"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {found.length > 0 && (
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-500/10 px-3 py-2 rounded-xl">
                            Найдено: {found.length} адресов
                        </span>
                    )}
                    <button
                        onClick={handleExtract}
                        disabled={loading}
                        className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Собрать адреса в этой области
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[59.9343, 30.3351]} // St. Petersburg focal
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onBoundsChange={setBounds} />

                    {found.map((addr, idx) => (
                        <Marker key={idx} position={[addr.lat, addr.lon]}>
                            <Popup>
                                <div className="text-xs font-bold text-slate-900">{addr.title}</div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Hint */}
            <div className="p-2 bg-slate-950 text-[10px] text-center text-slate-500 uppercase tracking-widest font-medium">
                Перемещайте карту и нажимайте «Собрать адреса», чтобы выгрузить дома в этой зоне
            </div>
        </div>
    );
}
