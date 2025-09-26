import { Component, createEffect, on, onMount, onCleanup } from 'solid-js';
import L from 'leaflet'; // Import the official Leaflet library directly

// --- Type Definition for a Venue ---
interface Venue {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

// --- Custom Icons for Markers ---
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const selectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- Main Map Component ---
interface VenueMapProps {
  venues: Venue[];
  selectedVenueId: number | null;
}

const VenueMap: Component<VenueMapProps> = (props) => {
  let mapContainer: HTMLDivElement | undefined;
  // We'll store the map instance and markers in standard variables, managed by effects.
  let mapInstance: L.Map | null = null;
  let markerLayer = L.layerGroup();

  // --- onMount: Initialize the map ONCE ---
  onMount(() => {
    if (mapContainer && !mapInstance) { // Ensure it only runs once
      // Create the map instance and attach it to our div
      mapInstance = L.map(mapContainer).setView([-6.2088, 106.8456], 11);

      // Add the tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Add the marker layer to the map
      markerLayer.addTo(mapInstance);
    }
  });

  // --- createEffect: Update markers whenever venues or the selection change ---
  createEffect(() => {
    if (!mapInstance) return; // Don't run if map isn't ready

    // 1. Clear all old markers from the layer
    markerLayer.clearLayers();
    
    // 2. Create new markers for the current list of venues
    props.venues.forEach(venue => {
      if (venue.latitude && venue.longitude) {
        const marker = L.marker([venue.latitude, venue.longitude], {
          icon: props.selectedVenueId === venue.id ? selectedIcon : defaultIcon
        });
        marker.bindPopup(`<b>${venue.name}</b>`);
        markerLayer.addLayer(marker); // Add the marker to our layer
      }
    });
  });
  
  // --- createEffect: Pan the map whenever the `selectedVenueId` prop changes ---
  createEffect(on(() => props.selectedVenueId, (selectedId) => {
    const selectedVenue = props.venues.find(v => v.id === selectedId);
    
    if (mapInstance && selectedVenue && selectedVenue.latitude && selectedVenue.longitude) {
      mapInstance.flyTo([selectedVenue.latitude, selectedVenue.longitude], 15, {
        animate: true,
        duration: 1.0,
      });
    }
  }));

  // --- onCleanup: Destroy the map instance when the component is unmounted ---
  onCleanup(() => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  });

  return (
    // This is a PLAIN div. It is just a container for Leaflet to attach to.
    // It is NOT a SolidJS component named <MapContainer>.
    <div 
      ref={mapContainer} 
      class="h-full w-full rounded-xl z-0"
    />
  );
};

export default VenueMap;