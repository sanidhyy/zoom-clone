"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Transcript {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

interface UseTranscriptionOptions {
  meetingId: string;
  userName?: string;
  onTranscript?: (transcript: Transcript) => void;
}

export function useTranscription({ meetingId, userName, onTranscript }: UseTranscriptionOptions) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch or generate API key on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/keys");
        const data = await res.json();
        if (data.exists && data.apiKey) {
          setApiKey(data.apiKey);
        } else {
          // Generate a new key
          const genRes = await fetch("/api/keys", { method: "POST" });
          const genData = await genRes.json();
          if (genData.apiKey) {
            setApiKey(genData.apiKey);
          }
        }
      } catch (error) {
        console.error("Failed to fetch API key:", error);
      }
    };
    fetchApiKey();
  }, []);

  // Save transcript to Supabase via API
  const saveTranscript = useCallback(async (text: string, isFinal: boolean) => {
    if (!apiKey || !meetingId || !text.trim()) return;
    
    try {
      await fetch("/api/transcribe/live", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Meeting-ID": meetingId,
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          text: text,
          user_name: userName || "Unknown",
          is_final: isFinal,
        }),
      });
    } catch (error) {
      console.error("Failed to save transcript:", error);
    }
  }, [apiKey, meetingId, userName]);

  const stopTranscription = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsEnabled(false);
    setIsConnecting(false);
  }, []);

  const startTranscription = useCallback(async () => {
    if (isEnabled || isConnecting) return;

    try {
      setIsConnecting(true);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;

      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (!apiKey) {
        console.error("NEXT_PUBLIC_DEEPGRAM_API_KEY is missing");
        setIsConnecting(false);
        return;
      }

      // Connect to Deepgram WebSocket
      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&language=en`,
        ["token", apiKey]
      );
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsEnabled(true);

        // Start recording
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.start(250);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const transcript = data.channel?.alternatives?.[0]?.transcript;
          
          if (transcript) {
            const isFinal = data.is_final;
            
            if (isFinal) {
              const newTranscript: Transcript = {
                id: `${Date.now()}-${Math.random()}`,
                text: transcript,
                isFinal: true,
                timestamp: new Date(),
              };
              
              setTranscripts(prev => [...prev.slice(-20), newTranscript]);
              setCurrentText("");
              onTranscript?.(newTranscript);
              
              // Save to Supabase with API key and meeting ID
              saveTranscript(transcript, true);
            } else {
              setCurrentText(transcript);
            }
          }
        } catch {
          // Ignore parse errors
        }
      };

      socket.onerror = () => {
        console.error("Transcription connection error");
        stopTranscription();
      };

      socket.onclose = () => {
        stopTranscription();
      };

    } catch (error) {
      console.error("Failed to start transcription:", error);
      setIsConnecting(false);
      stopTranscription();
    }
  }, [isEnabled, isConnecting, onTranscript, saveTranscript, stopTranscription]);

  const toggleTranscription = useCallback(() => {
    if (isEnabled) {
      stopTranscription();
    } else {
      startTranscription();
    }
  }, [isEnabled, startTranscription, stopTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  return {
    isEnabled,
    isConnecting,
    transcripts,
    currentText,
    apiKey,
    meetingId,
    toggleTranscription,
    startTranscription,
    stopTranscription,
  };
}

