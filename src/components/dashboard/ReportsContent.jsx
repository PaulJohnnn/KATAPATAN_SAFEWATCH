import React, { useMemo, useState } from 'react';
import { Plus, Search, MapPin, X, AlertCircle, Loader2, LocateFixed, ThumbsUp, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, currentUser, createReport, confirmReport, setReportStatus, deleteReport, getPosition, styleFor, timeAgo, REPORT_TYPES } from '../../lib/store';

const fieldCls =
  'w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-slate-700 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-gray-50 dark:bg-slate-800/50 dark:text-white outline-none font-bold placeholder-gray-300';

const FILTERS = ['All', 'Open', 'Resolved', 'Mine'];

const ReportsContent = ({ onShowOnMap }) => {
  const reports = useStore((s) => s.reports);
  const user = useStore(currentUser);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [formData, setFormData] = useState({ title: '', type: 'Theft', location: '', desc: '' });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (filter === 'Open' && r.status === 'resolved') return false;
      if (filter === 'Resolved' && r.status !== 'resolved') return false;
      if (filter === 'Mine' && r.authorId !== user?.id) return false;
      if (!q) return true;
      return [r.title, r.type, r.location, r.description].some((t) => (t || '').toLowerCase().includes(q));
    });
  }, [reports, query, filter, user]);

  const useMyLocation = async () => {
    setLocating(true);
    const pos = await getPosition();
    setCoords(pos);
    setLocating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim()) return;
    setIsSubmitting(true);
    const pos = coords || (await getPosition());
    await createReport({ type: formData.type, title: formData.title, location: formData.location, description: formData.desc, lat: pos.lat, lng: pos.lng });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setCoords(null);
    setFormData({ title: '', type: 'Theft', location: '', desc: '' });
    setFilter('All');
  };

  return (
    <div className="flex flex-col h-full px-4 md:px-0 max-w-4xl mx-auto pt-6 md:pt-0">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="font-black text-blue-950 dark:text-white text-3xl md:text-4xl tracking-tight">Incident Reports</h2>
          <p className="text-gray-400 dark:text-slate-500 font-medium mt-1">{reports.filter((r) => r.status !== 'resolved').length} open · {reports.length} total in your community</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          aria-label="New report"
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl md:px-6 md:py-4 flex items-center shadow-lg shadow-blue-500/20 flex-shrink-0"
        >
          <Plus className="w-6 h-6 md:mr-2" />
          <span className="hidden md:inline font-black uppercase tracking-wider text-sm">New Report</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="group bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 flex items-center px-6 py-5 mb-4 transition-all focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/20">
        <Search className="text-gray-400 group-focus-within:text-blue-600 w-6 h-6 mr-4" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports, places, or incident types…"
          aria-label="Search reports"
          className="w-full outline-none font-bold bg-transparent text-blue-950 dark:text-white placeholder-gray-300 dark:placeholder-slate-600"
        />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${filter === f ? 'bg-blue-950 dark:bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-6 pb-24">
        {shown.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-bold">
            {query ? `No reports match “${query}”.` : 'No reports here yet.'}
          </div>
        )}
        <AnimatePresence initial={false}>
          {shown.map((report) => {
            const st = styleFor(report.type);
            const mine = report.authorId && report.authorId === user?.id;
            const confirmed = (report.confirmedBy || []).includes(user?.id);
            const resolved = report.status === 'resolved';
            return (
              <motion.article
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={report.id}
                className={`bg-white dark:bg-slate-900 p-7 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-slate-800 flex flex-col ${resolved ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-5 gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`${st.chip} text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest`}>{report.type}</span>
                    {resolved && <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-widest">Resolved</span>}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">{timeAgo(report.createdAt)}<br />by {mine ? 'you' : report.author}</span>
                </div>
                <h3 className="font-black text-blue-950 dark:text-white text-xl md:text-2xl mb-3 tracking-tight">{report.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-base md:text-lg mb-6 leading-relaxed font-medium">{report.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-gray-50 dark:border-slate-800/50">
                  <div className="flex items-center text-sm font-black text-blue-950 dark:text-slate-300 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" /> {report.location}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!mine && (
                      <button
                        onClick={() => confirmReport(report.id)}
                        disabled={confirmed}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${confirmed ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                      >
                        <ThumbsUp className="w-4 h-4" /> {confirmed ? 'Confirmed' : 'I saw this'} · {report.confirms || 0}
                      </button>
                    )}
                    {mine && !resolved && (
                      <button onClick={() => setReportStatus(report.id, 'resolved')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                        <CheckCircle2 className="w-4 h-4" /> Mark resolved
                      </button>
                    )}
                    {mine && (
                      <button onClick={() => deleteReport(report.id)} aria-label="Delete report" className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => onShowOnMap(report.id)} className="px-3 py-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest hover:underline">
                      View on map
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* New report */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              role="dialog"
              aria-label="Create report"
              className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 md:p-12 w-full max-w-2xl flex flex-col relative border border-gray-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
            >
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="absolute top-8 right-8 text-gray-400 hover:text-blue-950 dark:hover:text-white">
                <X className="w-8 h-8" />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-blue-950 dark:text-white tracking-tighter mb-2">Create Report</h2>
                <p className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  {user?.settings?.anonymous ? 'Ghost reporting is on: your name is hidden.' : 'Posted with your short name. Turn on Ghost Reporting in Settings to hide it.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="space-y-2 block">
                    <span className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</span>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={fieldCls} placeholder="E.g. Broken streetlight" maxLength={90} />
                  </label>
                  <label className="space-y-2 block">
                    <span className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category</span>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={fieldCls}>
                      {REPORT_TYPES.map((t) => <option key={t} value={t}>{t === 'Suspicious' ? 'Suspicious Activity' : t}</option>)}
                    </select>
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Location</span>
                  <input required type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={fieldCls} placeholder="E.g. Phase 1 Gate" maxLength={80} />
                </label>
                <button type="button" onClick={useMyLocation} className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  {coords ? (coords.precise ? 'Pinned to your current location' : 'Location access is off, pinned near Katapatan Homes') : 'Pin it to my current location'}
                </button>

                <label className="space-y-2 block">
                  <span className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Details</span>
                  <textarea value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} className={`${fieldCls} h-28 resize-none`} placeholder="Tell us what's happening…" maxLength={500}></textarea>
                </label>

                <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200">Your report appears on the community feed and the live map right away.</p>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl mt-2 transition-all shadow-xl shadow-blue-500/25 uppercase tracking-widest text-sm flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Broadcast Report'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsContent;
