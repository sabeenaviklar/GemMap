"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Sparkles, MapPin, Star, IndianRupee, ExternalLink } from "lucide-react";

export interface MapPlaceItem {
  _id: string;
  name: string;
  slug: string;
  category: "food" | "study" | "viewpoint" | "thrift" | "hangout";
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
  area: string;
  city: string;
  pricePerPerson: number;
  avgRating: number;
  hiddenGemScore: number;
  images?: string[];
  status?: string;
}

interface InteractiveMapProps {
  places: MapPlaceItem[];
  highlightedId?: string | null;
  onSelectPlace?: (place: MapPlaceItem) => void;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

// Category color mappings
const CATEGORY_COLORS: Record<string, { bg: string; border: string; emoji: string }> = {
  food: { bg: "#ea580c", border: "#9a3412", emoji: "🍜" },
  study: { bg: "#0284c7", border: "#0369a1", emoji: "📚" },
  viewpoint: { bg: "#0d9488", border: "#115e59", emoji: "🌅" },
  thrift: { bg: "#7c3aed", border: "#5b21b6", emoji: "🛍️" },
  hangout: { bg: "#e11d48", border: "#9f1239", emoji: "☕" },
};

function createCustomPin(category: string, isHighlighted: boolean, score: number) {
  const cat = CATEGORY_COLORS[category] || { bg: "#0d9488", border: "#115e59", emoji: "💎" };
  const size = isHighlighted ? 44 : 36;
  const pulseClass = isHighlighted ? "scale-110 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" : "drop-shadow-md";

  const html = `
    <div style="width: ${size}px; height: ${size}px; transform: translate(-50%, -50%); cursor: pointer;" class="transition-all duration-200">
      <div style="
        background: ${cat.bg};
        border: 2px solid ${isHighlighted ? "#ffffff" : "rgba(255,255,255,0.85)"};
        box-shadow: ${isHighlighted ? "0 0 15px rgba(249,115,22,0.9), 0 4px 10px rgba(0,0,0,0.3)" : "0 3px 8px rgba(0,0,0,0.25)"};
        border-radius: 9999px;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${isHighlighted ? "20px" : "16px"};
        position: relative;
      " class="${pulseClass}">
        <span>${cat.emoji}</span>
        ${
          score >= 80
            ? `<div style="position: absolute; -top: 4px; -right: 4px; background: #f59e0b; border: 1.5px solid white; border-radius: 9999px; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 9px;">✨</div>`
            : ""
        }
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Controller to auto-center or adjust bounds when selected place changes
function MapRecenter({
  places,
  highlightedId,
  defaultCenter,
}: {
  places: MapPlaceItem[];
  highlightedId?: string | null;
  defaultCenter: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (highlightedId) {
      const place = places.find((p) => p._id === highlightedId);
      if (place && place.location?.coordinates) {
        const [lng, lat] = place.location.coordinates;
        map.flyTo([lat, lng], 15, { duration: 1.2 });
      }
    }
  }, [highlightedId, places, map]);

  return null;
}

export default function InteractiveMap({
  places,
  highlightedId,
  onSelectPlace,
  center = [19.076, 72.8777],
  zoom = 12,
  interactive = true,
}: InteractiveMapProps) {
  // Ensure default icon paths don't 404
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter places={places} highlightedId={highlightedId} defaultCenter={center} />

        {places.map((place) => {
          if (!place.location?.coordinates || place.location.coordinates.length < 2) return null;
          const [lng, lat] = place.location.coordinates;
          const isHighlighted = highlightedId === place._id;
          const icon = createCustomPin(place.category, isHighlighted, place.hiddenGemScore);

          return (
            <Marker
              key={place._id}
              position={[lat, lng]}
              icon={icon}
              zIndexOffset={isHighlighted ? 1000 : 0}
              eventHandlers={{
                click: () => {
                  if (onSelectPlace) onSelectPlace(place);
                },
              }}
            >
              <Popup className="custom-gem-popup">
                <div className="w-64 bg-white dark:bg-slate-900 rounded-xl overflow-hidden text-slate-900 dark:text-white shadow-xl">
                  {/* Image or gradient banner */}
                  <div className="h-24 bg-gradient-to-r from-teal-600 via-brand-700 to-sunset-600 relative overflow-hidden flex items-center justify-center">
                    {place.images && place.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl opacity-80">
                        {CATEGORY_COLORS[place.category]?.emoji || "💎"}
                      </span>
                    )}
                    {/* Score badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-400/40">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {place.hiddenGemScore}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {place.category} • {place.area}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {place.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs mt-2 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {place.avgRating?.toFixed(1) || "4.0"}
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        ₹{place.pricePerPerson}{" "}
                        <span className="text-[10px] font-normal text-slate-400">/ person</span>
                      </div>
                    </div>

                    <Link
                      href={`/places/${place.slug}`}
                      className="mt-3 block w-full text-center py-1.5 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors"
                    >
                      View Details & Tips →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
