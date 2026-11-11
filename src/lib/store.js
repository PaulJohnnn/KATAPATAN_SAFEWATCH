// SafeWatch data layer.
//
// Everything the app reads or writes goes through this file. By default the
// data lives in the visitor's browser (localStorage), so the live demo works
// for anyone with no server and no sign-up email. If VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY are set at build time, reports and SOS alerts are
// also read from and written to Supabase, so every resident sees the same feed.

import { useSyncExternalStore } from 'react';
import { supabase, hasSupabase } from './supabaseClient';

const KEY = 'safewatch:v1';
export const CENTER = [14.2464, 121.1356]; // Katapatan Homes, Banaybanay, Cabuyao

export const REPORT_TYPES = ['Theft', 'Hazard', 'Vandalism', 'Suspicious', 'Flooding', 'Medical'];

// Tailwind only ships classes it can see in the source, so colors are spelled out.
export const TYPE_STYLE = {
  Theft:      { hex: '#f97316', chip: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
  Hazard:     { hex: '#ef4444', chip: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
  Vandalism:  { hex: '#3b82f6', chip: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  Suspicious: { hex: '#a855f7', chip: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
  Flooding:   { hex: '#0ea5e9', chip: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' },
  Medical:    { hex: '#10b981', chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
};
export const styleFor = (type) => TYPE_STYLE[type] || TYPE_STYLE.Vandalism;

const HOUR = 3600_000;
const ago = (h) => new Date(Date.now() - h * HOUR).toISOString();

function seed() {
  const demo = {
    id: 'demo',
    fullName: 'Jenica Dematera',
    email: 'demo@safewatch.ph',
    phone: '+63 912 345 6789',
    address: 'Block 12, Katapatan Homes',
    password: 'safewatch',
    joinedAt: ago(24 * 40),
    contacts: [
      { id: 1, name: 'Maria (Mother)', number: '+63 900 000 0001' },
      { id: 2, name: 'Paolo (Brother)', number: '+63 900 000 0002' },
    ],
    settings: { notifications: true, anonymous: false, dark: false },
  };
  return {
    users: [demo],
    sessionUserId: null,
    reports: [
      { id: 'r1', type: 'Suspicious', title: 'Unknown motorcycle circling Phase 1', location: 'Phase 1 Gate', description: 'Two riders without plates have passed the gate several times in the last hour.', lat: 14.2472, lng: 121.1349, createdAt: ago(0.25), author: 'Mark R.', status: 'open', confirms: 4 },
      { id: 'r2', type: 'Flooding', title: 'Street flooding near the drainage canal', location: 'Block 4, Katapatan Homes', description: 'Knee-deep water after the rain. Cars should take the Block 6 road instead.', lat: 14.2451, lng: 121.1367, createdAt: ago(0.55), author: 'Anonymous', status: 'open', confirms: 9 },
      { id: 'r3', type: 'Theft', title: 'Stolen bicycle at the main gate', location: 'Main Gate, Katapatan Homes', description: 'A red mountain bike was taken from a porch at around 2 PM. Please be on the lookout.', lat: 14.2468, lng: 121.1352, createdAt: ago(2), author: 'Liza M.', status: 'open', confirms: 2 },
      { id: 'r4', type: 'Vandalism', title: 'Graffiti on the park wall', location: 'Barangay Hall, Banaybanay', description: 'Someone spray painted the new retaining wall at the community park last night.', lat: 14.2455, lng: 121.136, createdAt: ago(5), author: 'Anonymous', status: 'resolved', confirms: 3 },
      { id: 'r5', type: 'Hazard', title: 'Fallen tree branch on the court', location: 'Basketball Court, Katapatan Homes', description: 'A large branch is blocking the southbound lane. Drive carefully.', lat: 14.247, lng: 121.1345, createdAt: ago(26), author: 'Barangay Tanod', status: 'resolved', confirms: 6 },
    ],
    sos: [],
  };
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage blocked: fall through to fresh data */ }
  return seed();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
}

function set(patch) {
  state = { ...state, ...patch };
  save();
  listeners.forEach((l) => l());
}

export function useStore(selector) {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => selector(state),
  );
}

export const getState = () => state;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Accounts ───
export const currentUser = (s = state) => s.users.find((u) => u.id === s.sessionUserId) || null;

export async function signIn(login, password) {
  await wait(500);
  const id = login.trim().toLowerCase();
  const user = state.users.find((u) => u.email.toLowerCase() === id || u.phone.replace(/\s/g, '') === id.replace(/\s/g, ''));
  if (!user || user.password !== password) throw new Error('That email or phone and password do not match.');
  set({ sessionUserId: user.id });
  return user;
}

export async function signUp({ fullName, email, phone, address, password }) {
  await wait(600);
  if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('An account with that email already exists. Try logging in.');
  }
  if (password.length < 6) throw new Error('Use at least 6 characters for your password.');
  const user = {
    id: uid(), fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(), password,
    joinedAt: new Date().toISOString(), contacts: [], settings: { notifications: true, anonymous: false, dark: state.users[0]?.settings?.dark ?? false },
  };
  set({ users: [...state.users, user], sessionUserId: user.id });
  return user;
}

export function signOut() { set({ sessionUserId: null }); }

export function updateUser(patch) {
  const me = currentUser();
  if (!me) return;
  set({ users: state.users.map((u) => (u.id === me.id ? { ...u, ...patch } : u)) });
}

export function updateSettings(patch) {
  const me = currentUser();
  if (me) updateUser({ settings: { ...me.settings, ...patch } });
}

export function resetDemoData() {
  const keepSession = state.sessionUserId;
  state = seed();
  if (state.users.some((u) => u.id === keepSession)) state.sessionUserId = keepSession;
  save();
  listeners.forEach((l) => l());
}

// ─── Reports ───
export async function refreshReports() {
  if (hasSupabase) {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(200);
    if (!error && data) {
      set({ reports: data.map((r) => ({ ...r, createdAt: r.created_at, author: r.author || 'Resident', status: r.status || 'open', confirms: r.confirms || 0 })) });
      return;
    }
  }
  await wait(400);
  listeners.forEach((l) => l());
}

export async function createReport({ type, title, location, description, lat, lng }) {
  const me = currentUser();
  const report = {
    id: uid(), type, title: title.trim(), location: location.trim(), description: description.trim() || 'No description provided.',
    lat, lng, createdAt: new Date().toISOString(),
    author: me?.settings?.anonymous ? 'Anonymous' : shortName(me?.fullName), authorId: me?.id, status: 'open', confirms: 0,
  };
  if (hasSupabase) {
    const { error } = await supabase.from('reports').insert([{ type, title: report.title, location: report.location, description: report.description, lat, lng, color: type }]);
    if (error) console.warn('Supabase insert failed, saved on this device only:', error.message);
  } else {
    await wait(500);
  }
  set({ reports: [report, ...state.reports] });
  return report;
}

export function confirmReport(id) {
  const me = currentUser();
  set({
    reports: state.reports.map((r) => {
      if (r.id !== id) return r;
      const by = r.confirmedBy || [];
      if (me && by.includes(me.id)) return r;
      return { ...r, confirms: (r.confirms || 0) + 1, confirmedBy: me ? [...by, me.id] : by };
    }),
  });
}

export function setReportStatus(id, status) {
  set({ reports: state.reports.map((r) => (r.id === id ? { ...r, status } : r)) });
}

export function deleteReport(id) {
  set({ reports: state.reports.filter((r) => r.id !== id) });
}

// ─── SOS ───
export function getPosition() {
  return new Promise((resolve) => {
    const fallback = { lat: CENTER[0] + (Math.random() - 0.5) * 0.003, lng: CENTER[1] + (Math.random() - 0.5) * 0.003, precise: false };
    if (!navigator.geolocation) return resolve(fallback);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, precise: true }),
      () => resolve(fallback),
      { timeout: 5000, maximumAge: 60_000 },
    );
  });
}

export async function sendSos() {
  const me = currentUser();
  const pos = await getPosition();
  const alert = { id: uid(), userId: me?.id, name: me?.fullName || 'Resident', lat: pos.lat, lng: pos.lng, precise: pos.precise, createdAt: new Date().toISOString(), status: 'active' };
  if (hasSupabase) {
    const { error } = await supabase.from('sos_alerts').insert([{ lat: pos.lat, lng: pos.lng, status: 'active' }]);
    if (error) console.warn('Supabase SOS insert failed, saved on this device only:', error.message);
  }
  set({ sos: [alert, ...state.sos] });
  return { alert, contacts: me?.contacts || [] };
}

export function resolveSos(id) {
  set({ sos: state.sos.map((s) => (s.id === id ? { ...s, status: 'resolved', resolvedAt: new Date().toISOString() } : s)) });
}

// ─── Helpers ───
export function shortName(full) {
  if (!full) return 'Resident';
  const [first, ...rest] = full.trim().split(/\s+/);
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
}

export function firstName(full) {
  return (full || 'Neighbor').trim().split(/\s+/)[0];
}

export function initials(full) {
  return (full || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}

// Places and numbers shown under "Safe Zones" and "Authorities".
export const SAFE_ZONES = [
  { id: 'z1', name: 'Banaybanay Barangay Hall', kind: 'Evacuation center', lat: 14.2457, lng: 121.1362 },
  { id: 'z2', name: 'Katapatan Homes Clubhouse', kind: 'Assembly point', lat: 14.2466, lng: 121.1341 },
  { id: 'z3', name: 'Banaybanay Elementary School', kind: 'Evacuation center', lat: 14.2441, lng: 121.1374 },
];

export const HOTLINES = [
  { name: 'National Emergency Hotline', number: '911' },
  { name: 'Philippine Red Cross', number: '143' },
];
