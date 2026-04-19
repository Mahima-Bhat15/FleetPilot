# FleetPilot — Web App (React)

AI-powered fleet dispatch intelligence. Runs in any browser via `npm run start`.

## Quick Start

```bash
npm install
npm run start
```

Opens at **http://localhost:3000** — no device, no Xcode, no Android Studio needed.

## Optional: API Keys

Copy `.env.example` to `.env` and fill in your keys.  
Without keys the app runs in **demo mode** with realistic mock data — everything works.

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `REACT_APP_NAVPRO_API_TOKEN` | Live fleet data from NavPro |
| `REACT_APP_ANTHROPIC_API_KEY` | Claude AI features |

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Development server at localhost:3000 |
| `npm run build` | Production build in `/build` |
| `npm test` | Run tests |

## Project Structure

```
src/
├── App.jsx                       # Root — tab + layout
├── index.js / index.css          # Entry + global styles
├── components/
│   ├── UI.jsx                    # Chip, Card, Btn, StatBox, HOSBar…
│   ├── Topbar.jsx                # Header with KPIs
│   ├── LiveSyncBar.jsx           # NavPro connection status
│   ├── BottomNav.jsx             # Tab navigation
│   ├── DriverRightPanel.jsx      # Driver detail sidebar
│   └── VoiceModal.jsx            # "Ask Fleet" AI voice modal
├── screens/
│   ├── SmartDispatch.jsx         # AI driver ranking
│   ├── HOSCompliance.jsx         # FMCSA HOS monitoring
│   ├── ELDSafety.jsx             # Live map + ELD telemetry
│   ├── Alerts.jsx                # Fleet alerts
│   ├── Billing.jsx               # Document upload + OCR
│   ├── Inspection.jsx            # DVIR / vehicle inspection
│   └── Profit.jsx                # Cost per mile + bonuses
├── hooks/
│   ├── useFleetData.js           # Data fetching + polling
│   └── usePersistedTab.js        # Tab state via localStorage
├── data/
│   ├── mockData.js               # Demo fleet data
│   └── api.js                    # NavPro + Claude API calls
└── utils/
    ├── theme.js                  # Color helpers
    ├── constants.js              # HOS thresholds, weights
    └── hosUtils.js               # FMCSA calculation engine
```
