"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation } from "lucide-react";

interface LocationPickerProps {
  initialCoordinates?: [number, number]; // [lng, lat]
  onChange: (coords: [number, number]) => void;
}

function LocationPickerEvents({
  coords,
  setCoords,
  onChange,
}: {
  coords: [number, number]; // [lat, lng]
  setCoords: (c: [number, number]) => void;
  onChange: (c: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const newLat = e.latlng.lat;
      const newLng = e.latlng.lng;
      setCoords([newLat, newLng]);
      onChange([newLng, newLat]); // GeoJSON is [lng, lat]
    },
  });

  return (
    <Marker
      position={coords}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          setCoords([position.lat, position.lng]);
          onChange([position.lng, position.lat]);
        },
      }}
    />
  );
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({
  initialCoordinates = [72.8777, 19.076], // [lng, lat]
  onChange,
}: LocationPickerProps) {
  // Local state as [lat, lng] for Leaflet
  const [coords, setCoords] = useState<[number, number]>([
    initialCoordinates[1],
    initialCoordinates[0],
  ]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords([lat, lng]);
        onChange([lng, lat]);
        setLocating(false);
      },
      (err) => {
        alert("Could not fetch location: " + err.message);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          Click or drag pin to exact location:{" "}
          <strong className="text-slate-900 dark:text-white">
            {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
          </strong>
        </span>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-semibold text-xs transition-colors border border-teal-500/20"
        >
          <Navigation className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating..." : "Use My Current Location"}
        </button>
      </div>

      <div className="h-64 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
        <MapContainer
          center={coords}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={coords} />
          <LocationPickerEvents
            coords={coords}
            setCoords={setCoords}
            onChange={onChange}
          />
        </MapContainer>
      </div>
    </div>
  );
}
