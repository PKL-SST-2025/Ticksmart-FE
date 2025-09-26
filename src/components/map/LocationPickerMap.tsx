import { Component, createEffect, on, onMount, onCleanup, createSignal } from 'solid-js';
import L from 'leaflet';

// --- Type Definitions ---
export interface LocationData {
  latitude: number; longitude: number; address_line_1: string; city: string;
  state: string; postal_code: string; country: string; country_code: string; // The new 2-letter code
}

// REMOVED: No longer need the isOpen prop here
interface LocationPickerMapProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (data: LocationData) => void;
}

// --- Icon Definition ---
const mapIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const LocationPickerMap: Component<LocationPickerMapProps> = (props) => {
  let mapContainer: HTMLDivElement | undefined;
  let mapInstance: L.Map | null = null;
  let marker: L.Marker | null = null;

  // --- Reverse Geocoding Function (UPDATED) ---
  const fetchAddress = async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      
      // --- THIS IS THE CRITICAL FIX ---
      // We must provide a custom User-Agent header as required by Nominatim's Usage Policy.
      const response = await fetch(url, {
        headers: {
          // Replace 'YourAppName' and 'your.email@example.com' with your actual app info.
          'User-Agent': 'TikSmart App / 1.0 (contact@tiksmart.com)'
        }
      });

      if (!response.ok) {
        // Now we can provide a more specific error
        throw new Error(`Failed to fetch address. Status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const addr = data.address;

      const displayAddress = `${addr.road || ''} ${addr.house_number || ''}, ${addr.city || addr.town || ''}`.trim().replace(/^,|,$/g, '');
      if (marker) marker.bindPopup(displayAddress || "Coordinates selected").openPopup();

      props.onLocationChange({
        latitude: lat, longitude: lon,
        address_line_1: `${addr.road || ''} ${addr.house_number || ''}`.trim(),
        city: addr.city || addr.town || addr.village || '',
        state: addr.state || '',
        postal_code: addr.postcode || '',
        country: addr.country || '',
        country_code: addr.country_code?.toUpperCase() || '',
      });
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      if (marker) marker.bindPopup("Address lookup failed.").openPopup();
      props.onLocationChange({ latitude: lat, longitude: lon, address_line_1: '', city: '', state: '', postal_code: '', country: '', country_code: '' });
    }
  };

  // --- onMount, createEffect, onCleanup (Unchanged) ---
  onMount(() => {
    if (mapContainer && !mapInstance) {
      mapInstance = L.map(mapContainer).setView([-6.2088, 106.8456], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (!marker) {
          marker = L.marker(e.latlng, { icon: mapIcon }).addTo(mapInstance!);
        } else {
          marker.setLatLng(e.latlng);
        }
        fetchAddress(lat, lng);
      });
      
      const observer = new ResizeObserver((entries) => {
        if (entries[0].contentRect.width > 0) {
          mapInstance?.invalidateSize();
          observer.disconnect();
        }
      });
      observer.observe(mapContainer);
      onCleanup(() => observer.disconnect());
    }
  });

  createEffect(on(() => [props.latitude, props.longitude], ([lat, lon]) => {
    if (mapInstance && lat && lon) {
      const latLng = L.latLng(lat, lon);
      if (!marker) {
        marker = L.marker(latLng, { icon: mapIcon }).addTo(mapInstance);
      } else {
        marker.setLatLng(latLng);
      }
      mapInstance.flyTo(latLng, 16);
      fetchAddress(lat, lon);
    }
  }));

  onCleanup(() => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  });



  return (
    <div class="h-64 md:h-80 w-full rounded-lg z-0 relative">
      <div ref={mapContainer} class="h-full w-full rounded-lg bg-neutral-200 dark:bg-neutral-700" />
      <div class="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 px-3 rounded-full text-xs font-semibold text-neutral-700 dark:text-neutral-200 pointer-events-none shadow-md">
        Click on the map to place a marker
      </div>
    </div>
  );
};

export default LocationPickerMap;