# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Getting Started

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Backend Server

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit `server/.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Alternatively, you can use a different chat API endpoint by setting:
```
CHAT_API_URL=https://your-custom-endpoint.com/api/chat
```

### 3. Start the Development Servers

**Option A: Start servers separately (recommended for debugging)**

Terminal 1 - Start backend server:
```bash
cd server
npm start
```

Terminal 2 - Start frontend:
```bash
npm run dev
```

**Option B: Use a process manager** (if you have `concurrently` installed):
```bash
npm install -g concurrently
concurrently "cd server && npm start" "npm run dev"
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns).
The backend API will be available at `http://localhost:3001`.

### Troubleshooting

If you see "Failed to fetch" errors:
1. Ensure the backend server is running on port 3001
2. Check that `server/.env` exists and contains a valid `OPENAI_API_KEY`
3. Verify the server is accessible: `curl http://localhost:3001/health`

## Production Deployment

### Frontend (Vercel)
The frontend is deployed at: https://apex-flow-token.vercel.app/

The production build automatically uses the Render backend URL (`https://apexflow-token.onrender.com`).

### Backend (Render)
The backend is deployed at: https://apexflow-token.onrender.com

Make sure to set the following environment variables in your Render dashboard:
- `OPENAI_API_KEY` - Your OpenAI API key
- `CHAT_API_URL` (optional) - Override the chat endpoint if needed
- `NODE_ENV=production` - Set to production

The backend CORS is configured to allow requests from the Vercel frontend domain.

## Environment variables

Create a `.env` file (or `.env.local`) in the project root with the keys the app expects:

- `VITE_PRIVY_APP_ID` – Privy application ID. Optional; if unset, Privy auth is skipped and the app still renders.
- `VITE_CHATGPT5_API_URL` – Endpoint for the chat backend. Defaults to `/api/chat` when omitted.
- `VITE_CHATGPT5_API_KEY` – API key sent as `Authorization: Bearer ...` for the chat backend. Optional if your endpoint does not require it.
- `VITE_SOLANA_NETWORK` – Solana cluster (`devnet`, `testnet`, or `mainnet-beta`). Defaults to `devnet`.
- `VITE_SOLANA_RPC` – Custom RPC URL. Optional; if unset, the cluster URL derived from `VITE_SOLANA_NETWORK` is used.

Example:

```
VITE_PRIVY_APP_ID=your-privy-app-id
VITE_CHATGPT5_API_URL=https://your-chat-endpoint.example.com
VITE_CHATGPT5_API_KEY=your-chat-api-key
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC=
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
