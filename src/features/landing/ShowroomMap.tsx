import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Clock3, Phone, MessageCircle } from 'lucide-react';
import type { PublicBranch } from './public.types';

const directionsUrl = (branch: PublicBranch) => `https://www.google.com/maps/dir/?api=1&destination=${branch.mapLat},${branch.mapLng}`;
const DAY_BY_INDEX = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const todayHours = (branch: PublicBranch) => {
  const schedule = branch.operatingHours?.find((item) => item.day === DAY_BY_INDEX[new Date().getDay()]);
  if (!schedule) return branch.businessHours;
  if (!schedule.isOpen) return 'Tutup hari ini';
  return `Hari ini · ${schedule.openTime}–${schedule.closeTime}`;
};
const waUrl = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;

export const ShowroomMap = ({ branches, className = '' }: { branches: PublicBranch[]; className?: string }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!elementRef.current || mapRef.current || branches.length === 0) return;
    const points = branches.filter((b) => Number.isFinite(b.mapLat) && Number.isFinite(b.mapLng));
    if (!points.length) return;
    const map = L.map(elementRef.current, { scrollWheelZoom: false, zoomControl: true });
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const bounds = L.latLngBounds([]);
    points.forEach((branch) => {
      const latlng: L.LatLngExpression = [branch.mapLat, branch.mapLng];
      bounds.extend(latlng);
      const icon = L.divIcon({
        className: '',
        html: '<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:12px 12px 12px 3px;transform:rotate(-45deg);background:var(--color-primary);color:white;box-shadow:0 8px 24px rgba(15,23,42,.25);border:3px solid white"><span style="transform:rotate(45deg);font-size:15px;font-weight:900">●</span></span>',
        iconSize: [34, 34], iconAnchor: [17, 32], popupAnchor: [0, -30],
      });
      const content = document.createElement('div');
      content.className = 'showroom-map-popup';
      const title = document.createElement('strong'); title.textContent = branch.nama;
      const address = document.createElement('p'); address.textContent = branch.lokasi;
      const link = document.createElement('a'); link.href = directionsUrl(branch); link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = 'Buka petunjuk arah';
      content.append(title, address, link);
      L.marker(latlng, { icon }).addTo(map).bindPopup(content);
    });
    if (points.length === 1) map.setView([points[0].mapLat, points[0].mapLng], 15);
    else map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    window.setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; };
  }, [branches]);

  if (!branches.length) return null;
  return <div ref={elementRef} className={`min-h-80 w-full overflow-hidden rounded-[1.75rem] border border-border bg-surface-soft ${className}`} aria-label="Peta lokasi showroom" />;
};

export const BranchCard = ({ branch, compact = false }: { branch: PublicBranch; compact?: boolean }) => (
  <article className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-card">
    <div className="flex items-start justify-between gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary"><MapPin size={20} /></div>
      <span className="rounded-full bg-accent-green/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-green">Showroom</span>
    </div>
    <h3 className="mt-4 text-[16px] font-extrabold text-ink">{branch.nama}</h3>
    {!compact && branch.publicDescription && <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted">{branch.publicDescription}</p>}
    <div className="mt-4 space-y-2 text-[12px] font-semibold text-ink-soft">
      <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-primary" />{branch.lokasi}</p>
      {todayHours(branch) && <p className="flex items-start gap-2"><Clock3 size={14} className="mt-0.5 shrink-0 text-primary" />{todayHours(branch)}</p>}
      {(branch.phone || branch.kontak) && <a href={`tel:${(branch.phone || branch.kontak).replace(/\D/g, '')}`} className="flex items-start gap-2 hover:text-primary"><Phone size={14} className="mt-0.5 shrink-0 text-primary" />{branch.phone || branch.kontak}</a>}
    </div>
    <div className="mt-5 flex flex-wrap gap-3"><a href={directionsUrl(branch)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[12px] font-extrabold text-primary hover:underline"><Navigation size={14} /> Petunjuk arah</a>{branch.whatsappNumber && <a href={waUrl(branch.whatsappNumber)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[12px] font-extrabold text-accent-green hover:underline"><MessageCircle size={14} /> WhatsApp</a>}</div>
  </article>
);
