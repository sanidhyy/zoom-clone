"use client";

import { useState } from "react";

interface ApiKeyDisplayProps {
  apiKey: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export const ApiKeyDisplay = ({
  apiKey,
  isLoading,
  onGenerate,
  onRegenerate,
}: ApiKeyDisplayProps) => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskKey = (key: string) => {
    if (key.length <= 10) return key;
    return `${key.substring(0, 6)}${"•".repeat(20)}${key.substring(key.length - 4)}`;
  };

  const copyToClipboard = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="soft-card p-6 animate-pulse">
        <div className="h-4 bg-dark-3 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-dark-3 rounded w-full"></div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="soft-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Key</h3>
        <p className="text-white/60 mb-4">
          Generate an API key to start using the Eburon Transcription API.
        </p>
        <button
          onClick={onGenerate}
          className="soft-btn px-6 py-3 text-white font-medium flex items-center gap-2"
        >
          <span className="material-symbols-rounded">key</span>
          Generate API Key
        </button>
      </div>
    );
  }

  return (
    <div className="soft-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your API Key</h3>
        <button
          onClick={onRegenerate}
          className="text-sm text-blue-1 hover:text-blue-400 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-rounded text-base">refresh</span>
          Regenerate
        </button>
      </div>

      <div className="flex items-center gap-3 bg-dark-3/50 rounded-xl p-4">
        <code className="flex-1 font-mono text-sm text-white/90 break-all">
          {showKey ? apiKey : maskKey(apiKey)}
        </code>

        <button
          onClick={() => setShowKey(!showKey)}
          className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
          title={showKey ? "Hide" : "Show"}
        >
          <span className="material-symbols-rounded text-white/70">
            {showKey ? "visibility_off" : "visibility"}
          </span>
        </button>

        <button
          onClick={copyToClipboard}
          className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
          title="Copy"
        >
          <span className="material-symbols-rounded text-white/70">
            {copied ? "check" : "content_copy"}
          </span>
        </button>
      </div>

      <p className="text-white/40 text-sm mt-3">
        Keep your API key secure. Do not share it publicly.
      </p>
    </div>
  );
};
