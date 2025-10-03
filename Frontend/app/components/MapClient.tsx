"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
  });
}

type MapClientProps = {
  position: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
};

const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Recenter: React.FC<{ position: [number, number] | null }> = ({
  position,
}) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

export default function MapClient({ position, onMapClick }: MapClientProps) {
  const initialCenter: [number, number] = position ?? [40.7128, -74.006];

  return (
    <MapContainer
      center={initialCenter}
      zoom={position ? 10 : 4}
      style={{ width: "100%", height: "100%", borderRadius: 10 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />

      {position && (
        <>
          <Marker position={position}>
            <Popup>
              📍 Selected
              <br />
              Lat: {position[0].toFixed(4)}
              <br />
              Lng: {position[1].toFixed(4)}
            </Popup>
          </Marker>
          <Recenter position={position} />
        </>
      )}
    </MapContainer>
  );
}
