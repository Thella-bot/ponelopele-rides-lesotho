import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl, { type Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../../App';

// Env-based tokens
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY as string | undefined;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function Pickup() {
  const navigate = useNavigate();
  const { setPickupData } = useRide();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [w3w, setW3w] = useState<string>('Tap the map to choose pickup');
  const [sat, setSat] = useState<boolean>(false);
  const currentStyle = useMemo(
    () => (sat ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/streets-v12'),
    [sat]
  );

  useEffect(() => {
    if (!MAPBOX_TOKEN) return; // Guard: no token
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // initialize once

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: currentStyle,
      center: [27.4969, -29.3098],
      zoom: 17,
    });

    const onClick = async (e: mapboxgl.MapMouseEvent) => {
      try {
        const { lng, lat } = e.lngLat;
        if (!W3W_API_KEY) {
          console.warn('Missing VITE_W3W_API_KEY; skipping W3W lookup');
          const w = `(${lat.toFixed(5)}, ${lng.toFixed(5)})`;
          setW3w(w);
          setPickupData({ lat, lng, w3w: w });
          navigate('/destination');
          return;
        }
        const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${W3W_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`W3W HTTP ${res.status}`);
        const data = await res.json();
        const words = data?.words ? `///${data.words}` : `(${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        setW3w(words);
        setPickupData({ lat, lng, w3w: words });
        navigate('/destination');
      } catch (err: any) {
        console.error('W3W error', err?.message || err);
        const { lng, lat } = (e as any).lngLat || {};
        if (typeof lat === 'number' && typeof lng === 'number') {
          const fallback = `(${lat.toFixed(5)}, ${lng.toFixed(5)})`;
          setW3w(fallback);
          setPickupData({ lat, lng, w3w: fallback });
          navigate('/destination');
        }
      }
    };

    map.on('click', onClick);
    mapRef.current = map;

    return () => {
      map.off('click', onClick);
      map.remove();
      mapRef.current = null;
    };
  }, [currentStyle, setPickupData, navigate]);

  // Update style without re-creating the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const targetStyle = currentStyle;
    if (map.getStyle()?.sprite?.includes(sat ? 'satellite' : 'streets')) return; // naive check
    map.setStyle(targetStyle);
    map.once('styledata', () => {
      map.setZoom(sat ? 19 : 17);
    });
  }, [currentStyle, sat]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="pickup-map-unavailable-container">
        <h3 className="pickup-map-unavailable-title">Map unavailable</h3>
        <p>Please set VITE_MAPBOX_TOKEN in your environment to enable maps.</p>
      </div>
    );
  }

  return (
    <div className="pickup-full-container">
      <div ref={mapContainerRef} className="pickup-map" />
      <div className="pickup-panel">
        <h3 className="pickup-w3w">{w3w}</h3>
        <button
          type="button"
          onClick={() => setSat((v) => !v)}
          className="pickup-btn"
          aria-pressed={sat}
          aria-label={sat ? 'Switch to street view' : 'Enable roof tap (satellite) mode'}
        >
          {sat ? 'Street View' : '🛰️ Tap Your Roof Mode'}
        </button>
      </div>
    </div>
  );
}
