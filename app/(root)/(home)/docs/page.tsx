"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { ApiKeyDisplay } from "@/components/api-key-display";

const DocsPage = () => {
  const { isLoaded, user } = useUser();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"intro" | "api" | "sdk">("intro");

  const fetchApiKey = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.exists) {
        setApiKey(data.apiKey);
      }
    } catch (err) {
      console.error("Failed to fetch API key:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchApiKey();
    } else if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded, user, fetchApiKey]);

  const generateKey = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
      }
    } catch (err) {
      console.error("Failed to generate API key:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const serverUrl = "http://168.231.78.113:3744";

  return (
    <section className="flex flex-col text-white max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
          <span className="material-symbols-rounded text-sm">home</span>
          <span>/</span>
          <span>Documentation</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Introduction</h1>
        <p className="text-lg text-white/60">
          Build powerful speech-to-text applications with Eburon
        </p>
      </div>

      {/* What is Eburon */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">What is Eburon?</h2>
        <p className="text-white/70 leading-relaxed mb-4">
          Eburon is the developer platform for building speech-to-text applications. 
          We handle the complex AI infrastructure so you can focus on creating great experiences.
        </p>
        <p className="text-white/70 leading-relaxed">
          The Transcription API allows you to:
        </p>
        <ul className="mt-3 space-y-2 text-white/70">
          <li className="flex items-start gap-2">
            <span className="material-symbols-rounded text-green-1 text-lg mt-0.5">check_circle</span>
            <span>Convert audio files to accurate text transcriptions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-rounded text-green-1 text-lg mt-0.5">check_circle</span>
            <span>Capture live meeting transcriptions in real-time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-rounded text-green-1 text-lg mt-0.5">check_circle</span>
            <span>Detect language, entities, and sentiment automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-rounded text-green-1 text-lg mt-0.5">check_circle</span>
            <span>Identify multiple speakers with diarization</span>
          </li>
        </ul>
      </div>

      {/* Service Tiers */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Two service tiers</h2>
        <p className="text-white/70 mb-6">
          Choose the right transcription service for your needs:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Pro Tier */}
          <div className="soft-card p-5 border-blue-1/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-1/20 rounded-xl">
                <span className="material-symbols-rounded text-blue-1">star</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Pro</h3>
                <p className="text-xs text-white/50">Deepgram Nova-3</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-3">
              Enterprise-grade accuracy with advanced features.
            </p>
            <ul className="text-xs space-y-1.5 text-white/70">
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Language detection
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Entity extraction
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Sentiment analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Speaker diarization
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-white/10">
              <code className="text-xs text-blue-1 font-mono">
                {serverUrl}
              </code>
            </div>
          </div>

          {/* Beta Tier */}
          <div className="soft-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-1/20 rounded-xl">
                <span className="material-symbols-rounded text-purple-1">science</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Beta</h3>
                <p className="text-xs text-white/50">Fast Whisper</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-3">
              Open-source model for testing and development.
            </p>
            <ul className="text-xs space-y-1.5 text-white/70">
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Real-time streaming
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Multi-language support
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                Gradio UI interface
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-xs text-green-1">check</span>
                No API key required
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-white/10">
              <code className="text-xs text-purple-1 font-mono">
                http://168.231.78.113:7860
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Key capabilities</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-rounded text-blue-1">speed</span>
            <div>
              <h4 className="font-medium text-sm">Fast Processing</h4>
              <p className="text-xs text-white/50">Sub-second transcription latency</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-rounded text-blue-1">language</span>
            <div>
              <h4 className="font-medium text-sm">100+ Languages</h4>
              <p className="text-xs text-white/50">Automatic language detection</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-rounded text-blue-1">groups</span>
            <div>
              <h4 className="font-medium text-sm">Speaker Diarization</h4>
              <p className="text-xs text-white/50">Identify who said what</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-rounded text-blue-1">psychology</span>
            <div>
              <h4 className="font-medium text-sm">Smart Features</h4>
              <p className="text-xs text-white/50">Entities, sentiment, paragraphs</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Your API Key</h2>
        <ApiKeyDisplay
          apiKey={apiKey}
          isLoading={isLoading || !isLoaded}
          onGenerate={generateKey}
          onRegenerate={generateKey}
        />
      </div>

      {/* Quickstart */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Quickstart</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
          {[
            { id: "intro", label: "cURL", icon: "terminal" },
            { id: "api", label: "JavaScript", icon: "javascript" },
            { id: "sdk", label: "Python", icon: "code" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "intro" | "api" | "sdk")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                activeTab === tab.id
                  ? "bg-blue-1 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="material-symbols-rounded text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* cURL Example */}
        {activeTab === "intro" && (
          <div className="bg-black/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
              <span className="text-xs text-white/50 font-mono">Terminal</span>
              <button className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">content_copy</span>
                Copy
              </button>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto">
              <code className="text-white/90">
{`curl -X POST ${serverUrl}/transcribe/url \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/audio.wav",
    "model": "nova-3",
    "detect_language": true,
    "diarize": true
  }'`}
              </code>
            </pre>
          </div>
        )}

        {/* JavaScript Example */}
        {activeTab === "api" && (
          <div className="bg-black/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
              <span className="text-xs text-white/50 font-mono">JavaScript</span>
              <button className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">content_copy</span>
                Copy
              </button>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto">
              <code className="text-white/90">
{`const response = await fetch('${serverUrl}/transcribe/url', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || "YOUR_API_KEY"}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com/audio.wav',
    model: 'nova-3',
    detect_language: true,
    diarize: true
  })
});

const result = await response.json();
console.log(result.transcript);`}
              </code>
            </pre>
          </div>
        )}

        {/* Python Example */}
        {activeTab === "sdk" && (
          <div className="bg-black/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
              <span className="text-xs text-white/50 font-mono">Python</span>
              <button className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">content_copy</span>
                Copy
              </button>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto">
              <code className="text-white/90">
{`import requests

response = requests.post(
    '${serverUrl}/transcribe/url',
    headers={
        'Authorization': 'Bearer ${apiKey || "YOUR_API_KEY"}',
        'Content-Type': 'application/json'
    },
    json={
        'url': 'https://example.com/audio.wav',
        'model': 'nova-3',
        'detect_language': True,
        'diarize': True
    }
)

result = response.json()
print(result['transcript'])`}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* API Reference */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">API Reference</h2>

        {/* Transcribe URL */}
        <div className="soft-card p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-green-1/20 text-green-1 text-xs font-bold rounded">POST</span>
            <code className="text-sm font-mono text-white/80">/transcribe/url</code>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Transcribe audio from a URL with advanced AI features.
          </p>
          
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Request Body</h4>
          <div className="bg-black/30 rounded-lg overflow-hidden text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-white/50 font-medium text-xs">Parameter</th>
                  <th className="text-left p-3 text-white/50 font-medium text-xs">Type</th>
                  <th className="text-left p-3 text-white/50 font-medium text-xs">Description</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">url</code></td>
                  <td className="p-3">string</td>
                  <td className="p-3">Audio file URL (required)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">model</code></td>
                  <td className="p-3">string</td>
                  <td className="p-3">Model to use (default: nova-3)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">detect_language</code></td>
                  <td className="p-3">boolean</td>
                  <td className="p-3">Auto-detect language</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">diarize</code></td>
                  <td className="p-3">boolean</td>
                  <td className="p-3">Identify speakers</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">sentiment</code></td>
                  <td className="p-3">boolean</td>
                  <td className="p-3">Analyze sentiment</td>
                </tr>
                <tr>
                  <td className="p-3"><code className="text-blue-1">detect_entities</code></td>
                  <td className="p-3">boolean</td>
                  <td className="p-3">Extract entities</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Response */}
        <div className="soft-card p-5">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Response</h4>
          <pre className="bg-black/30 rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <code className="text-white/90">
{`{
  "success": true,
  "transcript": "Hello, this is a test...",
  "language": "en",
  "confidence": 0.98,
  "words": [...],
  "paragraphs": [...],
  "sentiments": [...],
  "entities": [...],
  "provider": "Eburon Transcription",
  "version": "1.0"
}`}
            </code>
          </pre>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Supported formats</h2>
        <div className="flex flex-wrap gap-2">
          {["WAV", "MP3", "FLAC", "OGG", "WEBM", "M4A", "AAC", "MP4", "MOV", "WMA"].map((format) => (
            <span
              key={format}
              className="px-3 py-1.5 bg-white/5 rounded-lg text-sm font-mono text-white/70"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      {/* TTS API */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Text-to-Speech API</h2>
        
        {/* TTS Endpoint */}
        <div className="soft-card p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-green-1/20 text-green-1 text-xs font-bold rounded">POST</span>
            <code className="text-sm font-mono text-white/80">/api/realtime-speech</code>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Convert text to speech. Choose between Pro (Cartesia) or Beta (Edge-TTS) tier.
          </p>
          
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Request Body</h4>
          <div className="bg-black/30 rounded-lg overflow-hidden text-sm mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-white/50 font-medium text-xs">Parameter</th>
                  <th className="text-left p-3 text-white/50 font-medium text-xs">Type</th>
                  <th className="text-left p-3 text-white/50 font-medium text-xs">Description</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">text</code></td>
                  <td className="p-3">string</td>
                  <td className="p-3">Text to synthesize (required)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">tier</code></td>
                  <td className="p-3">string</td>
                  <td className="p-3">&quot;pro&quot; (Cartesia) or &quot;beta&quot; (Edge-TTS)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">cartesia_voice_id</code></td>
                  <td className="p-3">string</td>
                  <td className="p-3">Cartesia voice ID (Pro tier)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-3"><code className="text-blue-1">voice</code></td>
                  <td className="p-3">string</td>
                  <td className="p-3">Edge-TTS voice name (Beta tier)</td>
                </tr>
                <tr>
                  <td className="p-3"><code className="text-blue-1">speed</code></td>
                  <td className="p-3">float</td>
                  <td className="p-3">Speed multiplier (Pro tier, default: 1.0)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pro Voices */}
        <div className="soft-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-1/20 text-blue-1 text-xs font-bold rounded">PRO</span>
            <span className="text-sm text-white/60">Cartesia Sonic-3</span>
          </div>
          <div className="bg-black/30 rounded-lg overflow-hidden text-xs">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-2 text-white/50">Voice ID</th>
                  <th className="text-left p-2 text-white/50">Name</th>
                  <th className="text-left p-2 text-white/50">Type</th>
                </tr>
              </thead>
              <tbody className="text-white/70 font-mono">
                <tr className="border-b border-white/5 bg-purple-1/10">
                  <td className="p-2">0e9bf92b-0a2a-406e-b55e-c1db92ceb9ca</td>
                  <td className="p-2 font-sans">Eburon Clone ⭐</td>
                  <td className="p-2 font-sans">Cloned</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-2">228fca29-3a0a-435c-8728-5cb483251068</td>
                  <td className="p-2 font-sans">Sarah</td>
                  <td className="p-2 font-sans">Female</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-2">bf991597-6c13-47e4-8411-91ec2de5c466</td>
                  <td className="p-2 font-sans">Barbershop Man</td>
                  <td className="p-2 font-sans">Male</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-2">c45bc5ec-dc68-4feb-8829-6e6b2748095d</td>
                  <td className="p-2 font-sans">Confident British Man</td>
                  <td className="p-2 font-sans">Male</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-2">e13cae5c-ec59-4f71-b0a6-266df3c9bb8e</td>
                  <td className="p-2 font-sans">Salesman</td>
                  <td className="p-2 font-sans">Male</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-2">156fb8d2-335b-4950-9cb3-a2d33befec77</td>
                  <td className="p-2 font-sans">Soothing Woman</td>
                  <td className="p-2 font-sans">Female</td>
                </tr>
                <tr>
                  <td className="p-2">d46abd1d-2571-4dfa-9685-28e56e0e6666</td>
                  <td className="p-2 font-sans">Young Woman</td>
                  <td className="p-2 font-sans">Female</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Beta Voices */}
        <div className="soft-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-purple-1/20 text-purple-1 text-xs font-bold rounded">BETA</span>
            <span className="text-sm text-white/60">Edge-TTS (Microsoft)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              "en-US-AriaNeural", "en-US-GuyNeural", "en-US-JennyNeural",
              "en-GB-SoniaNeural", "en-GB-RyanNeural", "en-AU-NatashaNeural",
              "ja-JP-NanamiNeural", "zh-CN-XiaoxiaoNeural", "ko-KR-SunHiNeural",
              "es-ES-ElviraNeural", "fr-FR-DeniseNeural", "de-DE-KatjaNeural",
              "it-IT-ElsaNeural", "pt-BR-FranciscaNeural", "fil-PH-BlessicaNeural"
            ].map((voice) => (
              <div key={voice} className="bg-white/5 rounded px-2 py-1.5 font-mono text-white/70">
                {voice}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Rate limits</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-1">100</div>
            <div className="text-xs text-white/50">Requests / min</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-1">100 MB</div>
            <div className="text-xs text-white/50">Max file size</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-1">4 hours</div>
            <div className="text-xs text-white/50">Max duration</div>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-gradient-to-r from-blue-1/20 to-purple-1/20 rounded-2xl p-6 text-center">
        <span className="material-symbols-rounded text-4xl text-blue-1 mb-3">support_agent</span>
        <h3 className="text-lg font-semibold mb-2">Need help?</h3>
        <p className="text-sm text-white/60 mb-4">
          Check our API docs or contact support for assistance.
        </p>
        <a
          href={`${serverUrl}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-1 rounded-lg text-sm font-medium hover:bg-blue-1/80 transition-colors"
        >
          <span className="material-symbols-rounded text-sm">open_in_new</span>
          Interactive API Docs
        </a>
      </div>
    </section>
  );
};

export default DocsPage;
