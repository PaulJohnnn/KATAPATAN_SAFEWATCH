import React, { useRef, useState } from 'react';
import { UserCircle, AlertTriangle, Megaphone, MapPin, ShieldCheck, Badge, Bell, Phone, X, Siren, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, currentUser, sendSos, resolveSos, firstName, timeAgo, styleFor, SAFE_ZONES, HOTLINES } from '../../lib/store';

const HOLD_MS = 1200;

const Sheet = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xl" onClick={onClose}>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={title}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-blue-950 dark:text-white tracking-tight">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-blue-950 dark:hover:text-white"><X className="w-7 h-7" /></button>
      </div>
      {children}
    </motion.div>
  </div>
);

const HomeContent = ({ onNavigateTab, onShowOnMap }) => {
  const user = useStore(currentUser);
  const reports = useStore((s) => s.reports);
  const sosList = useStore((s) => s.sos);
  const [sosState, setSosState] = useState('idle'); // idle | holding | sending | sent
  const [holdPct, setHoldPct] = useState(0);
  const [lastSos, setLastSos] = useState(null);
  const [sheet, setSheet] = useState(null); // 'zones' | 'authorities'
  const holdTimer = useRef(null);

  const [openedAt] = useState(() => Date.now());
  const dayAgo = openedAt - 24 * 3600_000;
  const urgent = reports.filter((r) => r.status !== 'resolved' && new Date(r.createdAt).getTime() > dayAgo && ['Hazard', 'Suspicious', 'Theft', 'Flooding', 'Medical'].includes(r.type));
  const myActiveSos = sosList.find((s) => s.userId === user?.id && s.status === 'active');

  const fire = async () => {
    setSosState('sending');
    const result = await sendSos();
    setLastSos(result);
    setSosState('sent');
  };

  const startHold = () => {
    if (sosState !== 'idle') return;
    setSosState('holding');
    const start = performance.now();
    const tick = () => {
      const pct = Math.min(1, (performance.now() - start) / HOLD_MS);
      setHoldPct(pct);
      if (pct >= 1) { holdTimer.current = null; setHoldPct(0); fire(); return; }
      holdTimer.current = requestAnimationFrame(tick);
    };
    holdTimer.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (sosState !== 'holding') return;
    cancelAnimationFrame(holdTimer.current);
    holdTimer.current = null;
    setHoldPct(0);
    setSosState('idle');
  };

  const activity = [
    ...reports.map((r) => ({ id: r.id, kind: 'report', title: `${r.type}: ${r.title}`, at: r.createdAt, type: r.type })),
    ...sosList.map((s) => ({ id: s.id, kind: 'sos', title: `SOS from ${firstName(s.name)}${s.status === 'resolved' ? ' (resolved)' : ''}`, at: s.createdAt })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);

  const ring = 2 * Math.PI * 48;

  return (
    <div className="flex flex-col pt-6 md:pt-0 relative max-w-4xl mx-auto px-4 md:px-0">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 px-6 py-6 flex items-center rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800"
      >
        <div className="w-14 h-14 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mr-5 flex-shrink-0">
          <UserCircle className="w-10 h-10" />
        </div>
        <div className="min-w-0">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Resident · {user?.address}</p>
          <h2 className="font-black text-blue-950 dark:text-white text-xl md:text-2xl leading-tight">Magandang araw, {firstName(user?.fullName)}!</h2>
        </div>
      </motion.div>

      {/* Alerts banner, counted from real reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`mt-6 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between shadow-xl text-white ${urgent.length ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/20' : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20'}`}
      >
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-white/20 p-3 rounded-2xl mr-4 backdrop-blur-md">
            {urgent.length ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="font-black text-xl">{urgent.length ? 'Active alerts in Banaybanay' : 'All clear in Banaybanay'}</h3>
            <p className="text-white/85 font-medium">
              {urgent.length ? `${urgent.length} open incident${urgent.length > 1 ? 's' : ''} reported in the last 24 hours.` : 'No open incidents in the last 24 hours.'}
            </p>
          </div>
        </div>
        <button onClick={() => onNavigateTab('reports')} className="bg-white text-orange-600 font-black px-6 py-3 rounded-2xl shadow-lg hover:bg-orange-50 transition-colors active:scale-95">
          View reports
        </button>
      </motion.div>

      {/* SOS */}
      <div className="flex flex-col items-center justify-center my-14 md:my-20 relative select-none">
        <p className="text-gray-500 dark:text-slate-400 font-black mb-10 tracking-widest text-[10px] uppercase bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
          {myActiveSos ? 'Your SOS is active' : 'Press and hold for 1 second to send SOS'}
        </p>

        <div className="relative">
          {sosState === 'idle' && !myActiveSos && (
            <>
              <motion.div initial={{ scale: 1, opacity: 0.4 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }} className="absolute inset-0 bg-red-500 rounded-full" />
              <motion.div initial={{ scale: 1, opacity: 0.2 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }} className="absolute inset-0 bg-red-400 rounded-full" />
            </>
          )}

          <button
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(); } }}
            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') cancelHold(); }}
            onContextMenu={(e) => e.preventDefault()}
            disabled={sosState === 'sending' || Boolean(myActiveSos)}
            aria-label="Send SOS. Press and hold for one second."
            className={`relative z-10 flex items-center justify-center w-60 h-60 md:w-72 md:h-72 rounded-full text-white font-black tracking-tighter shadow-[0_20px_60px_rgba(239,68,68,0.4)] transition-all duration-300 touch-none
              ${myActiveSos ? 'bg-red-700' : sosState === 'holding' ? 'bg-red-700 scale-95' : sosState === 'sending' ? 'bg-red-500 scale-95' : 'bg-red-600 hover:scale-105'}`}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="3" strokeDasharray={ring} strokeDashoffset={ring * (1 - holdPct)} strokeLinecap="round" />
            </svg>
            <div className="flex flex-col items-center">
              <span className={sosState === 'sending' ? 'text-2xl' : myActiveSos ? 'text-4xl' : 'text-7xl md:text-8xl'}>
                {sosState === 'sending' ? 'SENDING…' : myActiveSos ? 'SOS SENT' : 'SOS'}
              </span>
              {!myActiveSos && sosState !== 'sending' && <span className="text-xs opacity-70 font-medium tracking-widest mt-2">{sosState === 'holding' ? 'KEEP HOLDING' : 'EMERGENCY'}</span>}
            </div>
          </button>
        </div>

        {myActiveSos && sosState !== 'sent' && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm font-bold text-gray-500 dark:text-slate-400">Sent {timeAgo(myActiveSos.createdAt)}. Neighbors can see you on the map.</p>
            <button onClick={() => resolveSos(myActiveSos.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> I'm safe now
            </button>
          </div>
        )}
      </div>

      {/* SOS sent */}
      <AnimatePresence>
        {sosState === 'sent' && lastSos && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              role="alertdialog"
              aria-label="SOS sent"
              className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 md:p-12 w-full max-w-lg flex flex-col items-center text-center border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center mb-6">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-3xl font-black text-blue-950 dark:text-white mb-3 leading-none">SOS sent</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6 font-medium">
                Your alert is pinned on the community map{lastSos.alert.precise ? ' at your current location' : ' (location is approximate because location access was off)'}.
              </p>
              <div className="w-full text-left bg-gray-50 dark:bg-slate-800 rounded-3xl p-5 mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Call for help now</p>
                {[...HOTLINES, ...lastSos.contacts].map((c) => (
                  <a key={c.name} href={`tel:${c.number.replace(/[^\d+]/g, '')}`} className="flex items-center justify-between py-2 font-bold text-blue-950 dark:text-slate-200 hover:text-blue-600">
                    <span>{c.name}</span>
                    <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"><Phone className="w-4 h-4" />{c.number}</span>
                  </a>
                ))}
              </div>
              <div className="w-full grid grid-cols-2 gap-3">
                <button onClick={() => { setSosState('idle'); onShowOnMap(lastSos.alert.id); }} className="bg-gray-100 dark:bg-slate-800 text-blue-950 dark:text-white font-black py-4 rounded-2xl">
                  See on map
                </button>
                <button onClick={() => setSosState('idle')} className="bg-blue-950 dark:bg-blue-600 text-white font-black py-4 rounded-2xl">
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Megaphone, label: 'Report Incident', tone: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400', go: () => onNavigateTab('reports') },
          { icon: MapPin, label: 'Live Map', tone: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', go: () => onNavigateTab('map') },
          { icon: ShieldCheck, label: 'Safe Zones', tone: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', go: () => setSheet('zones') },
          { icon: Badge, label: 'Hotlines', tone: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', go: () => setSheet('authorities') },
        ].map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={a.go}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-slate-800 flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-all group"
          >
            <div className={`${a.tone} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
              <a.icon className="w-7 h-7" />
            </div>
            <span className="text-sm font-black text-blue-950 dark:text-slate-200 text-center leading-none">{a.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Recent activity, from real data */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-black text-blue-950 dark:text-white text-2xl tracking-tight">Recent Activity</h3>
          <button onClick={() => onNavigateTab('reports')} className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">See all reports</button>
        </div>
        <div className="space-y-4">
          {activity.map((u) => (
            <motion.button
              key={u.id}
              whileHover={{ x: 5 }}
              onClick={() => onShowOnMap(u.id)}
              className="w-full text-left bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-50 dark:border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: u.kind === 'sos' ? '#fee2e2' : `${styleFor(u.type).hex}1a` }}>
                  {u.kind === 'sos' ? <Siren className="w-5 h-5 text-red-600" /> : <Bell className="w-5 h-5" style={{ color: styleFor(u.type).hex }} />}
                </div>
                <span className="text-base font-bold text-blue-950 dark:text-slate-200 truncate">{u.title}</span>
              </div>
              <span className="text-xs text-gray-400 font-black uppercase tracking-wider flex-shrink-0">{timeAgo(u.at)}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {sheet === 'zones' && (
          <Sheet title="Safe zones nearby" onClose={() => setSheet(null)}>
            <div className="space-y-3">
              {SAFE_ZONES.map((z) => (
                <button key={z.id} onClick={() => { setSheet(null); onShowOnMap(z.id); }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <span>
                    <span className="block font-black text-blue-950 dark:text-white">{z.name}</span>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{z.kind}</span>
                  </span>
                  <MapPin className="w-5 h-5 text-green-600" />
                </button>
              ))}
            </div>
          </Sheet>
        )}
        {sheet === 'authorities' && (
          <Sheet title="Emergency hotlines" onClose={() => setSheet(null)}>
            <div className="space-y-3">
              {[...HOTLINES, ...(user?.contacts || [])].map((h) => (
                <a key={h.name} href={`tel:${h.number.replace(/[^\d+]/g, '')}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <span className="font-black text-blue-950 dark:text-white">{h.name}</span>
                  <span className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400"><Phone className="w-4 h-4" />{h.number}</span>
                </a>
              ))}
              <p className="text-xs text-gray-400 font-medium pt-2">Add your own people under My Profile → Emergency Contacts.</p>
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeContent;
