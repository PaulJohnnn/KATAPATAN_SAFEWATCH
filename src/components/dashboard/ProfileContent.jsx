import React, { useState } from 'react';
import { ShieldCheck, Trash2, Phone, MapPin, Mail, Pencil, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, currentUser, updateUser, initials } from '../../lib/store';

const inputCls = 'w-full px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-800 bg-white dark:bg-slate-800 dark:text-white outline-none text-sm font-bold placeholder-blue-300';

const ProfileContent = () => {
  const user = useStore(currentUser);
  const reports = useStore((s) => s.reports);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  if (!user) return null;

  const contacts = user.contacts || [];
  const myReports = reports.filter((r) => r.authorId === user.id).length;

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.number.trim()) return;
    updateUser({ contacts: [...contacts, { id: Date.now(), name: newContact.name.trim(), number: newContact.number.trim() }] });
    setNewContact({ name: '', number: '' });
    setIsAddingContact(false);
  };

  const startEdit = () => { setDraft({ fullName: user.fullName, phone: user.phone, address: user.address }); setEditing(true); };
  const saveEdit = (e) => { e.preventDefault(); updateUser({ fullName: draft.fullName.trim() || user.fullName, phone: draft.phone.trim(), address: draft.address.trim() }); setEditing(false); };

  const rows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Mobile', value: user.phone || 'Not set' },
    { icon: MapPin, label: 'Address', value: user.address || 'Not set' },
    { icon: FileText, label: 'Reports filed', value: String(myReports) },
  ];

  return (
    <div className="flex flex-col h-full px-4 md:px-0 max-w-4xl mx-auto pb-24 pt-6 md:pt-0">
      <div className="mb-8">
        <h2 className="font-black text-blue-950 dark:text-white text-3xl md:text-4xl tracking-tight">My Profile</h2>
        <p className="text-gray-400 dark:text-slate-500 font-medium mt-1">Your resident identity and emergency contacts.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-50 dark:border-slate-800 flex flex-col items-center text-center mb-10 relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-50/60 dark:from-blue-900/10 to-transparent"></div>
        <div className="relative mb-6 z-10">
          <div className="w-32 h-32 bg-blue-600 text-white rounded-[2.75rem] rotate-6 flex items-center justify-center border-8 border-white dark:border-slate-900 shadow-2xl text-4xl font-black">
            <span className="-rotate-6">{initials(user.fullName)}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-2xl p-3 border-4 border-white dark:border-slate-900 shadow-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <h3 className="font-black text-3xl md:text-4xl text-blue-950 dark:text-white mb-3 z-10 tracking-tight">{user.fullName}</h3>
        <span className="text-blue-600 dark:text-blue-400 font-black text-xs bg-blue-50 dark:bg-blue-900/30 px-6 py-2 rounded-full mb-2 z-10 uppercase tracking-[0.2em]">Resident</span>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest z-10">Member since {new Date(user.joinedAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-5">
          <div className="flex items-center justify-between ml-2">
            <h3 className="font-black text-blue-950 dark:text-white text-xs uppercase tracking-[0.2em]">Details</h3>
            {!editing && (
              <button onClick={startEdit} className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveEdit} className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-3">
              <input className={inputCls} value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} placeholder="Full name" aria-label="Full name" required />
              <input className={inputCls} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="Mobile number" aria-label="Mobile number" />
              <input className={inputCls} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Home address" aria-label="Home address" />
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-black py-3 rounded-xl border border-blue-100 dark:border-slate-600 text-xs uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
              {rows.map((r, i) => (
                <div key={r.label} className={`p-6 flex items-center justify-between gap-4 ${i < rows.length - 1 ? 'border-b border-gray-50 dark:border-slate-800/50' : ''}`}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4">
                      <r.icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="font-bold text-blue-950 dark:text-slate-200">{r.label}</span>
                  </div>
                  <span className="text-gray-500 dark:text-slate-400 font-bold text-sm text-right break-all">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between ml-2">
            <h3 className="font-black text-blue-950 dark:text-white text-xs uppercase tracking-[0.2em]">Emergency Contacts</h3>
            <button onClick={() => setIsAddingContact(!isAddingContact)} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
              + Add new
            </button>
          </div>

          <AnimatePresence>
            {isAddingContact && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddContact}
                className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 overflow-hidden space-y-3"
              >
                <input type="text" placeholder="Name (e.g. Mama)" aria-label="Contact name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className={inputCls} required />
                <input type="tel" placeholder="Phone number" aria-label="Contact phone number" value={newContact.number} onChange={(e) => setNewContact({ ...newContact, number: e.target.value })} className={inputCls} required />
                <div className="flex space-x-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest">Save</button>
                  <button type="button" onClick={() => setIsAddingContact(false)} className="flex-1 bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-black py-3 rounded-xl border border-blue-100 dark:border-slate-600 text-xs uppercase tracking-widest">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-slate-800 overflow-hidden">
            {contacts.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-bold text-sm">No contacts yet. They show up when you send an SOS.</div>
            ) : (
              contacts.map((c, i) => (
                <div key={c.id} className={`flex items-center justify-between p-6 ${i !== contacts.length - 1 ? 'border-b border-gray-50 dark:border-slate-800/50' : ''}`}>
                  <a href={`tel:${c.number.replace(/[^\d+]/g, '')}`} className="min-w-0">
                    <p className="font-black text-blue-950 dark:text-white tracking-tight text-lg leading-none mb-2">{c.name}</p>
                    <p className="text-sm font-bold text-gray-400 dark:text-slate-500">{c.number}</p>
                  </a>
                  <button onClick={() => updateUser({ contacts: contacts.filter((x) => x.id !== c.id) })} aria-label={`Remove ${c.name}`} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
