import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { MapPin, RefreshCcw, Loader2 } from 'lucide-react';
import L from 'leaflet';
import { useStore, CENTER, SAFE_ZONES, TYPE_STYLE, styleFor, timeAgo } from '../../lib/store';

// Colored pins drawn with CSS, so no image files are needed.
const pin = (color, { pulse = false, label = '' } = {}) =>
  L.divIcon({
    className: '',
    html: `<div class="sw-pin${pulse ? ' sw-pin--pulse' : ''}" style="--c:${color}"><span>${label}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 120); return () => clearTimeout(t); }, [map]);
  return null;
};

// Fly to the item that "View on map" was pressed for, and open its popup.
const FocusOn = ({ target, markers }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 18, { duration: 0.8 });
    const t = setTimeout(() => markers.current[target.id]?.openPopup(), 850);
    return () => clearTimeout(t);
  }, [target, map, markers]);
  return null;
};

const MapContent = ({ focusId, onRefresh, isLoading }) => {
  const reports = useStore((s) => s.reports);
  const sos = useStore((s) => s.sos);
  const markers = useRef({});
  const activeSos = sos.filter((s) => s.status === 'active');

  const target = useMemo(
    () => [...reports, ...sos, ...SAFE_ZONES].find((x) => x.id === focusId) || null,
    [focusId, reports, sos],
  );

  const keep = (id) => (m) => { if (m) markers.current[id] = m; };

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto pb-10 pt-6 md:pt-0">
      <div className="flex justify-between items-center mb-8 px-4 md:px-0">
        <div>
          <h2 className="font-black text-blue-950 dark:text-white text-3xl md:text-4xl tracking-tight">Live Community Map</h2>
          <p className="text-gray-400 dark:text-slate-500 font-medium mt-1">
            {reports.filter((r) => r.status !== 'resolved').length} open reports · {activeSos.length} active SOS · {SAFE_ZONES.length} safe zones
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 min-h-[520px] w-full bg-slate-100 dark:bg-slate-900 md:rounded-[3rem] border border-gray-100 dark:border-slate-800 relative overflow-hidden shadow-2xl shadow-blue-950/5"
        style={{ zIndex: 1 }}
      >
        <MapContainer
          center={CENTER}
          zoom={16}
          style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
          zoomControl={false}
          className="dark:brightness-[0.8]"
        >
          <MapInvalidator />
          <FocusOn target={target} markers={markers} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {SAFE_ZONES.map((z) => (
            <Marker key={z.id} ref={keep(z.id)} position={[z.lat, z.lng]} icon={pin('#16a34a', { label: '✚' })}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">{z.kind}</p>
                  <p className="font-black text-blue-950 text-base leading-tight">{z.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {reports.map((r) => (
            <Marker key={r.id} ref={keep(r.id)} position={[r.lat, r.lng]} icon={pin(styleFor(r.type).hex)} opacity={r.status === 'resolved' ? 0.55 : 1}>
              <Popup>
                <div className="min-w-[200px]">
                  <span className={`${styleFor(r.type).chip} text-[10px] font-black px-3 py-1.5 rounded-lg mb-2 uppercase tracking-widest inline-block`}>
                    {r.type}{r.status === 'resolved' ? ' · resolved' : ''}
                  </span>
                  <h3 className="font-black text-blue-950 mb-1 text-base leading-tight">{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium !my-1">{r.description}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-blue-600" /> {r.location}</span>
                    <span>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {sos.map((s) => (
            <Marker key={s.id} ref={keep(s.id)} position={[s.lat, s.lng]} icon={pin(s.status === 'active' ? '#dc2626' : '#94a3b8', { pulse: s.status === 'active', label: '!' })}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">{s.status === 'active' ? 'Active SOS' : 'Resolved SOS'}</p>
                  <p className="font-black text-blue-950 text-base leading-tight">{s.name}</p>
                  <p className="text-xs text-gray-500 font-medium !my-1">Sent {timeAgo(s.createdAt)}{s.precise ? '' : ' · approximate location'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-6 right-6 z-[1000]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh map"
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-50 dark:border-slate-700 text-blue-600 dark:text-blue-400 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6" />}
          </motion.button>
        </div>

        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 md:p-5 rounded-3xl shadow-xl border border-gray-50 dark:border-slate-700 max-w-[calc(100%-2rem)]">
          <h4 className="font-black text-blue-950 dark:text-white text-[10px] uppercase tracking-widest mb-3">Map legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2">
            {[['Active SOS', '#dc2626'], ['Safe zone', '#16a34a'], ...Object.entries(TYPE_STYLE).map(([k, v]) => [k, v.hex])].map(([label, c]) => (
              <div key={label} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c }} />
                <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MapContent;
