"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Call } from "@stream-io/video-react-sdk";

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

      // 2. Mix Audio Streams
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();

      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(dest);

      // Add Remote Participants Audio
      if (call) {
        const participants = call.state.participants;
        participants.forEach((p) => {
          if (!p.isLocal) {
            // @ts-ignore: handling Stream SDK track structure flexibility
            const audioTrack = p.publishedTracks.find((t) => t.audioTrack)?.audioTrack || p.publishedTracks.find((t) => t.track?.kind === "audio")?.track;
            
            if (audioTrack) {
               try {
                 const remoteStream = new MediaStream([audioTrack]);
                 const remoteSource = audioContext.createMediaStreamSource(remoteStream);
                 remoteSource.connect(dest);
               } catch (e) {
                 console.warn(`Failed to connect audio for ${p.userId}`, e);
               }
            }
          }
        });
      }

      // Check for Screen Share Audio
       if (call) {
        const localParticipant = call.state.localParticipant;
        const screenShareTrack = localParticipant?.publishedTracks.find(
          (t) => t.source === "screen_share_audio"
        )?.track;

        if (screenShareTrack) {
          console.log("Adding screen share audio to mix");
          const sysStream = new MediaStream([screenShareTrack]);
          const sysSource = audioContext.createMediaStreamSource(sysStream);
          sysSource.connect(dest);
        }
      }

      const mixedStream = dest.stream;
      streamRef.current = mixedStream;

      // 3. Connect to Proxy
      const protocol = process.env.NEXT_PUBLIC_SERVER_URL?.startsWith("https") ? "wss" : "ws";
      const host = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, "");
      const wsUrl = `${protocol}://${host}/transcribe/ws?api_key=${apiKey}`;

      console.log("Connecting to Transcription Proxy:", wsUrl);

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnecting(false);
        setIsEnabled(true);

        const mediaRecorder = new MediaRecorder(mixedStream, {
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

      socket.onclose = () => {
        console.log("Transcription WebSocket closed");
        stopTranscription();
      };

    } catch (error) {
      console.error("Failed to start transcription:", error);
      setIsConnecting(false);
      stopTranscription();
    }
  }, [isEnabled, isConnecting, apiKey, onTranscript, saveTranscript, stopTranscription, call]);

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
