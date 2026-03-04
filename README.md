# GraphQL Playground Lite

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A lightweight local GraphQL playground that introspects your schema, generates all queries and mutations, and lets you run tests with one click—no manual query writing.

## Features

- **Schema introspection** – Automatically reads your GraphQL schema from any endpoint
- **One-click operations** – Click "Add" on any query or mutation to insert it into the editor
- **Multiple endpoints** – Save and switch between GraphQL URLs (stored in localStorage)
- **Access token** – Paste your Bearer token; it's sent with every request
- **Dark mode** – Clean dark theme optimized for local development
- **No CORS issues** – Requests are proxied through the app (works with localhost and remote APIs)

## Setup

```bash
yarn install   # or npm install
yarn dev
```

The app runs at **http://localhost:3030**.

## Usage

1. **Manage Endpoints** – Open the burger menu and go to "Manage Endpoints"
2. **Add an endpoint** – Enter your GraphQL URL and click Add
3. **Optional: Add access token** – Paste your Bearer token if your API requires authentication
4. **Connect** – Click Connect to introspect the schema; you'll be redirected to the Playground
5. **Add operations** – In the sidebar, click any query or mutation to insert it into the editor
6. **Edit variables** – Fill in the variables panel (opens automatically when the operation has variables)
7. **Run** – Click the green play button to execute

## Tech Stack

- Next.js 14, React 18
- GraphiQL, GraphQL
- Tailwind CSS
- TypeScript

## Local Only

This app is designed for local development and testing. It stores endpoints in `localStorage` and tokens in `sessionStorage` (cleared when the browser closes).

## Scripts

- `yarn dev` – Start dev server on port 3030
- `yarn build` – Production build
- `yarn start` – Start production server
- `yarn lint` – Run ESLint
- `yarn format` – Format with Prettier

## License

MIT – see [LICENSE](LICENSE)
