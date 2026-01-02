import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { bounds, polygon } = await req.json();

        // If bounds (south, west, north, east)
        let query = "";
        if (bounds) {
            const { s, w, n, e } = bounds;
            query = `
                [out:json][timeout:25];
                (
                  node["addr:housenumber"](${s},${w},${n},${e});
                  way["addr:housenumber"](${s},${w},${n},${e});
                  relation["addr:housenumber"](${s},${w},${n},${e});
                );
                out center;`;
        } else if (polygon) {
            // Polygon format: [[lat, lng], ...] -> Overpass expects "lat lng lat lng ..."
            const polyStr = polygon.map((p: number[]) => `${p[0]} ${p[1]}`).join(" ");
            query = `
                [out:json][timeout:25];
                (
                  node["addr:housenumber"](poly:"${polyStr}");
                  way["addr:housenumber"](poly:"${polyStr}");
                  relation["addr:housenumber"](poly:"${polyStr}");
                );
                out center;`;
        }

        if (!query) {
            return NextResponse.json({ error: "Invalid area selection" }, { status: 400 });
        }

        const response = await axios.post("https://overpass-api.de/api/interpreter",
            `data=${encodeURIComponent(query)}`,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const elements = response.data.elements || [];

        // Extract and deduplicate addresses
        const addressMap = new Map();

        elements.forEach((el: any) => {
            const tags = el.tags;
            if (tags["addr:street"] && tags["addr:housenumber"]) {
                const street = tags["addr:street"];
                const house = tags["addr:housenumber"];
                const fullAddress = `${house}, ${street}`;

                // Use coordinates or tags for better uniqueness if needed
                addressMap.set(fullAddress, {
                    title: fullAddress,
                    lat: el.lat || el.center?.lat,
                    lon: el.lon || el.center?.lon,
                    street: street,
                    house: house
                });
            }
        });

        const addresses = Array.from(addressMap.values());

        return NextResponse.json({
            count: addresses.length,
            addresses: addresses
        });

    } catch (error: any) {
        console.error("Overpass API Error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to fetch map data" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
