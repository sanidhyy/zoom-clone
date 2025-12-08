# Eburon - Advanced AI Video Conferencing

![Eburon Banner](/public/icons/logo.png)

**Eburon** is a next-generation video conferencing application built with Next.js 15, integrated with advanced AI capabilities for real-time transcription, translation, and interactive agentic experiences.

It combines a premium Apple-inspired design with powerful backend services to deliver a "Zoom-like" experience enhanced by modern Generative AI.

---

## 🚀 Key Features

### 📹 Video & Audio
- **Crystal Clear Calls**: Powered by **GetStream.io** for low-latency HD video and audio.
- **Screen Sharing**: Seamless screen sharing capabilities.
- **Recording**: Record meetings and view them later.
- **Personal Rooms**: Dedicated meeting links for instant calls.

### 🧠 Advanced AI Capabilities (New)
- **Tiered Text-to-Speech (TTS)**:
    - **Pro Tier**: **Cartesia Sonic-3** (High-Fidelity, Emotional, Low Latency).
    - **Beta Tier**: **Edge-TTS** (Microsoft Neural Voices, Free).
- **Live Translation**: Real-time speech-to-text via **Deepgram** translated instantly to your target language.
- **Gemini Live Audio**: Real-time, bidirectional audio/video streaming with **Google Gemini 2.0 Flash**. Talk to the AI naturally with interruptibility.
- **Pro Tier Chat Agent**:
    - Powered by **Gemini 2.0 Flash Thinking** (Experimental).
    - **Thinking Mode**: 8k token budget for deep reasoning.
    - **Tools**: Live Google Search and Python Code Execution.
- **Eburon Transcription API**: Custom FastApi server acting as a unified AI gateway.

### 🎨 Premium Design
- **Apple-Style Aesthetic**: Glassmorphism, blurred backgrounds, and soft shadows.
- **Responsive**: Fully optimized for Desktop, Tablet, and Mobile.
- **Modern Typography**: Open Sans (Body) and Roboto (Heading) font stack.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Tailwind Animate
- **UI Components**: Shadcn/UI, Radix UI
- **Authentication**: [Clerk](https://clerk.com/)
- **State Management**: React Hooks + Local State

### Backend & AI Services
- **Video/Audio SDK**: [GetStream Video](https://getstream.io/video/docs/react/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Gateway Server**: Python [FastAPI](https://fastapi.tiangolo.com/)
- **Live Transcription**: [Deepgram Nova-2](https://deepgram.com/)
- **LLM / Agents**: [Google Gemini](https://ai.google.dev/) (via `google-genai`)
- **TTS**: [Cartesia](https://cartesia.ai/) & Edge-TTS

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.10 or higher
- **npm** or **yarn** or **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eburon.git
cd eburon
```

### 2. Frontend Setup
Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_STREAM_API_KEY=...
STREAM_SECRET_KEY=...

NEXT_PUBLIC_SERVER_URL=http://localhost:3744
NEXT_PUBLIC_DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
```

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

### 3. AI Server Setup (Eburon Server)
Navigate to the server directory:
```bash
cd eburon_server
```

Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Set up environment variables (create a `.env` file in `eburon_server/` or export them):
```bash
export GEMINI_API_KEY=...
export CARTESIA_API_KEY=...
export DEEPGRAM_API_KEY=...
```

Run the FastAPI server:
```bash
python main.py
```
The server will start on port `3744`.

---

## 📚 API Documentation

The Eburon Server comes with automatic interactive documentation.
Once the server is running, visit:
- **Swagger UI**: [http://localhost:3744/docs](http://localhost:3744/docs)
- **ReDoc**: [http://localhost:3744/redoc](http://localhost:3744/redoc)

### Key Endpoints
- `POST /api/message`: Chat completion (Tiered: Beta/Ollama, Pro/Gemini).
- `POST /api/realtime-speech`: TTS (Tiered: Beta/Edge, Pro/Cartesia).
- `WS /api/live-audio`: Bidirectional audio/video streaming with Gemini Live.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by Eburon Development**
