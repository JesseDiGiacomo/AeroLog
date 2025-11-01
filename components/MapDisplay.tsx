import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { TrackPoint, DetailedTrackPoint } from '../types';

interface MapDisplayProps {
  track: TrackPoint[];
  interactive?: boolean;
  faiTriangleTurnpoints?: TrackPoint[];
  syncedPoint?: DetailedTrackPoint | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ track, interactive = true, faiTriangleTurnpoints, syncedPoint }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trackLayerRef = useRef<L.FeatureGroup | null>(null);
  const faiLayerRef = useRef<L.FeatureGroup | null>(null);
  const syncLayerRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
      }).setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;
      // Initialize all layers once map is created
      trackLayerRef.current = L.featureGroup().addTo(map);
      faiLayerRef.current = L.featureGroup().addTo(map);
      syncLayerRef.current = L.featureGroup().addTo(map);
    }
    
    if (!trackLayerRef.current || !faiLayerRef.current) return;

    // --- Track Layer ---
    trackLayerRef.current.clearLayers();
    
    if (track && track.length > 0) {
      const latlngs = track.map(p => L.latLng(p[0], p[1]));
      const polyline = L.polyline(latlngs, { color: '#06b6d4', weight: 3 });
      trackLayerRef.current.addLayer(polyline);

      if (track.length > 0) {
        const takeoffMarker = L.marker(track[0], { 
            icon: L.divIcon({ className: 'bg-green-500 rounded-full w-3 h-3 border-2 border-white', html: '' }) 
        }).bindTooltip("Decolagem");
        trackLayerRef.current.addLayer(takeoffMarker);

        const landingMarker = L.marker(track[track.length - 1], { 
            icon: L.divIcon({ className: 'bg-red-500 rounded-full w-3 h-3 border-2 border-white', html: '' }) 
        }).bindTooltip("Pouso");
        trackLayerRef.current.addLayer(landingMarker);
      }

      if (latlngs.length > 0) {
        mapRef.current?.fitBounds(polyline.getBounds(), { padding: [20, 20] });
      }
    }

    // --- FAI Layer ---
    faiLayerRef.current.clearLayers();

    if (faiTriangleTurnpoints && faiTriangleTurnpoints.length === 3) {
      const faiLatLngs = faiTriangleTurnpoints.map(p => L.latLng(p[0], p[1]));
      const faiPolygon = L.polygon(faiLatLngs, { 
          color: '#facc15', 
          weight: 2, 
          dashArray: '5, 5',
          fillOpacity: 0.1,
          fillColor: '#facc15'
      });
      faiLayerRef.current.addLayer(faiPolygon);
      
      faiTriangleTurnpoints.forEach((tp, index) => {
        const turnpointMarker = L.marker(tp, {
            icon: L.divIcon({
                className: 'bg-yellow-400 rounded-full w-4 h-4 border-2 border-white text-black flex items-center justify-center font-bold text-xs',
                html: `<span>${index + 1}</span>`
            })
        }).bindTooltip(`Pilão FAI ${index + 1}`);
        faiLayerRef.current.addLayer(turnpointMarker);
      });
    }

  }, [track, interactive, faiTriangleTurnpoints]);

  // --- Sync Marker Effect ---
  useEffect(() => {
    if (!syncLayerRef.current) return;

    syncLayerRef.current.clearLayers();

    if (syncedPoint) {
      const pos = L.latLng(syncedPoint.lat, syncedPoint.lon);
      const icon = L.divIcon({
        className: 'sync-marker',
        html: '',
        iconSize: [22, 22], // width: 16px + border: 3px * 2 = 22px
        iconAnchor: [11, 11], // Center the icon
      });

      const marker = L.marker(pos, { icon, zIndexOffset: 1000 });
      syncLayerRef.current.addLayer(marker);
      syncLayerRef.current.bringToFront();
    }
  }, [syncedPoint]);

  return <div ref={mapContainerRef} className="h-full w-full bg-gray-700" />;
};

export default MapDisplay;