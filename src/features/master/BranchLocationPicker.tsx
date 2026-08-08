import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Props { latitude: number | null; longitude: number | null; onChange: (latitude: number, longitude: number) => void }

const markerIcon = L.divIcon({
  className: '',
  html: '<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:12px 12px 12px 3px;transform:rotate(-45deg);background:var(--color-primary);color:white;box-shadow:0 8px 24px rgba(15,23,42,.25);border:3px solid white"><span style="transform:rotate(45deg);font-size:15px;font-weight:900">●</span></span>',
  iconSize: [34, 34], iconAnchor: [17, 32],
});

export const BranchLocationPicker = ({ latitude, longitude, onChange }: Props) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    const hasPoint = Number.isFinite(latitude) && Number.isFinite(longitude);
    const initial: L.LatLngExpression = hasPoint ? [latitude!, longitude!] : [-2.5, 118];
    const map = L.map(elementRef.current, { scrollWheelZoom: false }).setView(initial, hasPoint ? 16 : 5);
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    const place = (lat: number, lng: number) => {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(map);
        markerRef.current.on('dragend', () => { const point = markerRef.current!.getLatLng(); onChangeRef.current(Number(point.lat.toFixed(7)), Number(point.lng.toFixed(7))); });
      } else markerRef.current.setLatLng([lat, lng]);
    };
    if (hasPoint) place(latitude!, longitude!);
    map.on('click', (event) => { place(event.latlng.lat, event.latlng.lng); onChangeRef.current(Number(event.latlng.lat.toFixed(7)), Number(event.latlng.lng.toFixed(7))); });
    window.setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
    // Map hanya dibuat satu kali untuk setiap siklus modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    if (!markerRef.current) {
      markerRef.current = L.marker([latitude!, longitude!], { draggable: true, icon: markerIcon }).addTo(map);
      markerRef.current.on('dragend', () => { const point = markerRef.current!.getLatLng(); onChangeRef.current(Number(point.lat.toFixed(7)), Number(point.lng.toFixed(7))); });
    }
    else markerRef.current.setLatLng([latitude!, longitude!]);
    map.panTo([latitude!, longitude!]);
  }, [latitude, longitude]);

  const locate = () => navigator.geolocation?.getCurrentPosition(({ coords }) => {
    const lat = Number(coords.latitude.toFixed(7)); const lng = Number(coords.longitude.toFixed(7));
    onChange(lat, lng); mapRef.current?.setView([lat, lng], 17);
  });

  return <section className="space-y-3 rounded-2xl border border-border bg-surface-soft/55 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-[13px] font-extrabold text-ink"><MapPin size={16} className="text-primary" /> Titik lokasi peta</h3><p className="mt-1 text-[11px] font-medium text-muted">Klik peta atau geser marker. Latitude dan longitude akan ikut berubah otomatis.</p></div><button type="button" onClick={locate} className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-[11px] font-extrabold text-primary hover:border-primary"><LocateFixed size={14} /> Lokasi perangkat</button></div><div ref={elementRef} className="h-72 w-full overflow-hidden rounded-2xl border border-border bg-surface sm:h-80" aria-label="Pilih titik lokasi cabang" /></section>;
};
