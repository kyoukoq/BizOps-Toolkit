# BizOps Toolkit

A local-first toolkit for day-to-day BizOps, RevOps, and admin work.

## Tools included

- JSON Formatter / Validator
- JWT Decoder
- Base64 Encoder / Decoder
- GUID Generator
- Diff Tool
- Time Zone Converter
- Regex Tester
- API Tester Lite
- CSV Cleaner
- HubSpot Duplicate Finder
- Bulk Update Builder
- HubSpot Property Builder
- Access Request Builder
- SOP Generator
- CSV Preview
- SQL Formatter
- Jira Assistant
- Email Assistant
- Teams Message Assistant

## Writing style support

The writing tools use a local style profile for Jira comments, Jira descriptions, email replies, and Teams messages. The tone is short, practical, status-first, and avoids overexplaining.

## Tech stack

- React
- TypeScript
- Vite
- Lucide icons
- sql-formatter

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Build

```bash
npm run build
```

## Product direction

The first version focuses on fast local utilities, practical HubSpot admin workflows, and reusable writing helpers. Future versions can add saved API collections, encrypted token storage, Excel transforms, workflow audits, sandbox-production comparison, and desktop packaging with Tauri or Electron.
