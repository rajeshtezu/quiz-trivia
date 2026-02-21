# Quiz Trivia

A responsive React web app: spin a wheel to pick random trivia questions. Questions are stored in the browser (IndexedDB) and loaded from configurable API URLs.

## Features

- **Spin wheel** – Equal-sized colored segments (one per question); spin to pick a random **unread** question.
- **Question modal** – Shows title and description with a close button to reset for the next spin.
- **Read state** – Picked questions are marked read and excluded from future spins.
- **Settings** – Top-right ⚙ Settings: add multiple API URLs. Fetched data is saved to IndexedDB and refreshed when you save settings.
- **On load** – Uses questions from IndexedDB if available; otherwise fetches from saved API URLs and stores them.

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## API format

Each URL should return JSON that is (or contains) an array of objects. Supported shapes:

- Root array: `[{ "title": "...", "description": "..." }, ...]`
- Wrapped: `{ "data": [...] }`, `{ "questions": [...] }`, `{ "results": [...] }`, `{ "items": [...] }`

Each item is normalized to: `title`, `description`, `isRead`. Missing fields are inferred from `question`/`text`, `answer`/`detail`/`explanation`, etc.

## Tech

- React 18, Vite 5
- IndexedDB via [idb](https://www.npmjs.com/package/idb)
- Responsive CSS (mobile, tablet, desktop)
