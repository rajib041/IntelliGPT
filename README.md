# IntelliGPT ⚡

A modern, full-stack AI conversational platform built with **React 19**, **Vite**, **Node.js / Express**, and **MongoDB**, featuring universal multi-provider AI support (**OpenRouter**, **Groq**, **Google Gemini**, and **OpenAI**).

---

## ✨ Features

- 🎨 **Modern Dark UI/UX**: Obsidian layered dark theme, clean typography with Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*), and fluid micro-interactions.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile with a sliding navigation drawer and backdrop blur.
- 🧠 **Universal AI Auto-Detection**: Drop-in support for any API key format:
  - **OpenRouter** (`sk-or-...`): Auto-routed free models (`openrouter/free`, `gemma-4-31b-it:free`, `nemotron-3.5-lightning:free`).
  - **Groq** (`gsk_...`): Ultra-fast inference with `llama-3.3-70b-versatile`.
  - **Google Gemini** (`AQ.` / `AIzaSy...`): High-speed `gemini-3.5-flash-lite`.
  - **OpenAI** (`sk-...`): Live `gpt-4o-mini` integration.
  - **Offline / Local Simulation**: Works out of the box even without an API key for testing!
- 📝 **Rich Markdown & Code Highlighting**:
  - Full GitHub Flavored Markdown (GFM) support for tables, lists, blockquotes, and formatting.
  - Automatic single-line table preprocessor and responsive table containers.
  - Syntax highlighted code blocks with language tags and a one-click **Copy Code** button.
- ⚡ **High-Speed Streaming Effect**: Word-by-word streaming effect on active assistant responses with auto-scrolling.
- 🗂️ **Thread & History Management**:
  - Save, switch, and delete chat threads persisted in MongoDB.
  - Clean title generation and optimistic message updating.
- 💡 **Interactive Welcome Screen**: Quick-start prompt cards to explore concepts, debug code, brainstorm ideas, or draft content.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (`19.1.0`)
- **Bundler / Dev Server**: Vite 7 (`7.0.0`)
- **Markdown & Syntax Highlighting**: `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js`
- **Icons & Typography**: FontAwesome 6.7, Google Fonts (*Plus Jakarta Sans*, *JetBrains Mono*)
- **Loaders & Utilities**: `react-spinners`, `uuid`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5 (`5.1.0`)
- **Database**: MongoDB via Mongoose 8 (`8.16.1`)
- **Configuration & Utilities**: `dotenv`, `cors`, `nodemon`

---

## 📂 Project Structure

```
IntelliGPT/
├── Backend/
│   ├── models/
│   │   └── Thread.js            # MongoDB Thread & Message schemas
│   ├── routes/
│   │   └── chat.js              # REST API endpoints for chats and threads
│   ├── utils/
│   │   └── openai.js            # Universal multi-provider AI engine
│   ├── .env.example             # Template for environment variables
│   ├── .env                     # Local environment configuration
│   ├── package.json             # Backend dependencies & scripts
│   └── server.js                # Express app entrypoint & database connection
├── Frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/              # Logos and brand assets
│   │   ├── App.css / App.jsx    # Application shell & context provider
│   │   ├── Chat.css / Chat.jsx  # Chat stream, starter cards & Markdown renderer
│   │   ├── ChatWindow.css/jsx   # Navbar, profile dropdown, and input bar
│   │   ├── Sidebar.css / jsx    # Thread history, new chat & responsive drawer
│   │   ├── index.css            # Global CSS design tokens & theme variables
│   │   ├── main.jsx             # React DOM root entry
│   │   └── MyContext.jsx        # Global application state
│   ├── index.html               # HTML document & Google Fonts
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite configuration
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on port `27017` (or a remote MongoDB Atlas connection URI)
- *(Optional)* A free API key from [OpenRouter](https://openrouter.ai), [Groq](https://console.groq.com), [Google AI Studio](https://aistudio.google.com), or [OpenAI](https://platform.openai.com).

---

### 1. Backend Setup

1. Open a terminal in the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file (copy from `.env.example`):
   ```env
   PORT=8080
   MONGODB_URI=mongodb://127.0.0.1:27017/intelligpt
   OPENAI_API_KEY=your_api_key_here
   ```
   > **Note:** You can paste your **OpenRouter** (`sk-or-...`), **Groq** (`gsk_...`), **Google Gemini** (`AQ.` / `AIzaSy...`), or **OpenAI** (`sk-...`) key directly under `OPENAI_API_KEY`.

4. Start the backend server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```
   *The backend will be live at `http://localhost:8080`.*

---

### 2. Frontend Setup

1. Open a new terminal in the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be live at `http://localhost:5173`.*

4. Build for production:
   ```bash
   npm run build
   ```

5. Run ESLint code quality checks:
   ```bash
   npm run lint
   ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning server status & uptime |
| `GET` | `/api/thread` | Retrieve all conversation threads sorted by `updatedAt` descending |
| `GET` | `/api/thread/:threadId` | Fetch message history for a specific thread |
| `POST` | `/api/chat` | Send a user message and receive an AI-generated completion |
| `DELETE` | `/api/thread/:threadId` | Delete a conversation thread and its message history |

---

## 🔑 Supported Free AI Providers

| Provider | Key Prefix | Default Model | Free Tier Details |
| :--- | :--- | :--- | :--- |
| **OpenRouter** | `sk-or-v1-...` | `openrouter/free` | Free access to open-source models, no credit card required |
| **Groq** | `gsk_...` | `llama-3.3-70b-versatile` | Ultra-fast LPU inference, free tier |
| **Google Gemini** | `AQ.` / `AIzaSy...` | `gemini-3.5-flash-lite` | Free via Google AI Studio |
| **OpenAI** | `sk-...` | `gpt-4o-mini` | Standard OpenAI API access |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
