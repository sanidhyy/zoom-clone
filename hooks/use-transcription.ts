"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Call } from "@stream-io/video-react-sdk";
import { AudioEnhancer } from "@/lib/audio/enhancer";

interface Transcript {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

interface UseTranscriptionOptions {
  meetingId: string;
  userName?: string;
  call?: Call;
  onTranscript?: (transcript: Transcript) => void;
}

export function useTranscription({ meetingId, userName, call, onTranscript }: UseTranscriptionOptions) {
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
    if (!meetingId || !text.trim()) return;

    try {
      await fetch("/api/transcribe/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: meetingId,
          user_name: userName || "Unknown",
          original_text: text,
          is_final: isFinal,
        }),
      });
    } catch (error) {
      console.error("Failed to save transcript:", error);
    }
  }, [meetingId, userName]);

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

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(dest);

      if (call) {
        call.state.participants.forEach((p) => {
          // @ts-ignore
          if (!p.isLocalParticipant && !p.isLocal) {
            // @ts-ignore
            const audioTrack = p.publishedTracks.find((t) => t.audioTrack)?.audioTrack || p.publishedTracks.find((t) => t.track?.kind === "audio")?.track;
            if (audioTrack) {
              try {
                const remoteStream = new MediaStream([audioTrack]);
                const remoteSource = audioContext.createMediaStreamSource(remoteStream);
                remoteSource.connect(dest);
              } catch (e) {}
            }
          }
        });
      }

      const mixedStream = dest.stream;
      
      // AI Audio Enhancement
      const enhancer = new AudioEnhancer();
      const enhancedStream = enhancer.processStream(mixedStream);
      streamRef.current = mixedStream; // Keep original for cleanup, but use enhanced for recording

      // Direct Deepgram connection
      const deepgramKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      
      if (!deepgramKey) {
        console.error("Deepgram API Key is missing. Transcription cannot start.");
        setIsConnecting(false);
        return;
      }

      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&interim_results=true`;
      const socket = new WebSocket(wsUrl, ["token", deepgramKey]);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsEnabled(true);

        const mediaRecorder = new MediaRecorder(enhancedStream, {
          mimeType: "audio/webm;codecs=opus",
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
              saveTranscript(transcript, true);
            } else {
              setCurrentText(transcript);
            }
          }
        } catch (e) {
          console.error("Error parsing transcript:", e);
        }
      };

      socket.onerror = (e) => {
        console.error("Transcription WebSocket error:", e);
        stopTranscription();
      };

      socket.onclose = () => stopTranscription();

    } catch (error) {
      console.error("Failed to start transcription:", error);
      setIsConnecting(false);
      stopTranscription();
    }
  }, [isEnabled, isConnecting, onTranscript, saveTranscript, stopTranscription, call]);

  const toggleTranscription = useCallback(() => {
    if (isEnabled) {
      stopTranscription();
    } else {
      startTranscription();
    }
  }, [isEnabled, startTranscription, stopTranscription]);

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
