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
      
      const circleMarker = L.circleMarker(pos, {
        radius: 8,
        fillColor: "#facc15", // tailwind yellow-400
        color: "#ffffff",      // white for border
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
        pane: 'markerPane' // Ensure it's on top of polylines
      });

      const climbColor = syncedPoint.climbRate >= 0 ? '#4ade80' : '#f87171';

      const tooltipContent = `
        <div style="font-family: monospace; font-size: 12px; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            <span style="color: #9ca3af;">ALT</span>
            <span>${syncedPoint.altitude.toFixed(0)}m</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            <span style="color: #9ca3af;">AGL</span>
            <span>${syncedPoint.agl.toFixed(0)}m</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            <span style="color: #9ca3af;">VEL</span>
            <span>${syncedPoint.speed.toFixed(1)}km/h</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            <span style="color: #9ca3af;">SUB</span>
            <span style="color: ${climbColor}; font-weight: bold;">${syncedPoint.climbRate.toFixed(1)}m/s</span>
          </div>
        </div>
      `;

      circleMarker.bindTooltip(tooltipContent, {
        permanent: true,
        direction: 'right',
        offset: [12, 0],
        className: 'pilot-info-tooltip'
      });

      syncLayerRef.current.addLayer(circleMarker);
    }
  }, [syncedPoint]);

  return <div ref={mapContainerRef} className="h-full w-full bg-gray-700" />;
};

export default MapDisplay;