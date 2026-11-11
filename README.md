# Katapatan SafeWatch

A community safety app for Katapatan Homes, Barangay Banaybanay, Cabuyao. Residents report incidents, see them on a live map, and send an SOS with one press.

**Live demo:** https://pauljohnnn.github.io/KATAPATAN_SAFEWATCH/

Press **Launch App**, then **Try the demo resident account**, or create your own account.

## What works
- **Accounts**: sign up, log in, log out. You stay logged in after a refresh.
- **Incident reports**: file a report (pinned to your location if you allow it), search, filter by open, resolved or your own, confirm a neighbor's report, and mark your own as resolved.
- **Live community map**: color-coded pins for every report, active SOS alerts and safe zones. "View on map" flies to the pin.
- **SOS**: press and hold for one second, so it can't go off by accident. It pins your location and shows hotlines and your emergency contacts to call.
- **Profile**: edit your details and manage emergency contacts.
- **Settings**: dark mode, Ghost Reporting (hides your name on reports) and a reset for the sample data.

## How data is stored
By default everything is kept in the browser (localStorage), so the demo works for anyone with no server. To share reports and SOS alerts between all residents, create a Supabase project, run `supabase_setup.sql`, and build with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Run it locally
```
npm install
npm run dev
```

Built with React 19, Vite, Tailwind CSS 4, Framer Motion and Leaflet (OpenStreetMap).
