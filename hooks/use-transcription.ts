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
    if (isEnabled || isConnecting || !apiKey) return;

    try {
      setIsConnecting(true);

      // 1. Get Microphone Stream
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Get System Audio (Display Media)
      // Note: User must select a tab/window with audio and check "Share Audio"
      let sysStream: MediaStream | null = null;
      try {
        sysStream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // Video is required to capture system audio in most browsers
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      } catch (err) {
        console.warn("System audio sharing cancelled or failed", err);
      }

      // 3. Mix Audio Streams
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();

      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(dest);

      if (sysStream) {
        // Extract audio track from display media
        const sysAudioTrack = sysStream.getAudioTracks()[0];
        if (sysAudioTrack) {
          const sysSource = audioContext.createMediaStreamSource(new MediaStream([sysAudioTrack]));
          sysSource.connect(dest);
        }
      }

      const mixedStream = dest.stream;
      streamRef.current = mixedStream; // Keep reference to close later

      // 4. Connect to Eburon Server Proxy (WebSocket)
      const protocol = process.env.NEXT_PUBLIC_SERVER_URL?.startsWith("https") ? "wss" : "ws";
      const host = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, "");
      const wsUrl = `${protocol}://${host}/transcribe/ws?api_key=${apiKey}`; // Pass Eburon Key

      console.log("Connecting to Transcription Proxy:", wsUrl);

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsEnabled(true);

        // Start recording the MIXED stream
        const mediaRecorder = new MediaRecorder(mixedStream, {
          mimeType: "audio/webm;codecs=opus",
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        // Send data every 250ms
        mediaRecorder.start(250);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Eburon Proxy format: { channel: { alternatives: [{ transcript: "..." }] }, is_final: boolean }
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
              
              // Save to Supabase (Maintain existing logic)
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

      socket.onclose = () => {
        console.log("Transcription WebSocket closed");
        stopTranscription();
      };

    } catch (error) {
      console.error("Failed to start transcription:", error);
      setIsConnecting(false);
      stopTranscription();
    }
  }, [isEnabled, isConnecting, apiKey, onTranscript, saveTranscript, stopTranscription]);

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

