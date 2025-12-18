"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Call, useCallStateHooks } from "@stream-io/video-react-sdk";
import { OrbState } from "@/components/translator-orbs";

interface UseGeminiLiveOptions {
  call: Call | undefined;
  meetingId: string;
}

export function useGeminiLive({ call, meetingId }: UseGeminiLiveOptions) {
  const [mode, setMode] = useState<"IDLE" | "A_SPEAK" | "B_SPEAK">("IDLE");
  const [orbState, setOrbState] = useState<OrbState>("IDLE");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const remoteAudioStreamRef = useRef<MediaStream | null>(null);
  const playbackTrackRef = useRef<MediaStreamTrack | null>(null);

  const { useMicrophoneState } = useCallStateHooks();
  const { microphone } = useMicrophoneState();

  const stopTranslation = useCallback(async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (playbackTrackRef.current) {
      // Unpublish if we were broadcasting
      if (call) {
        // @ts-ignore: unpublishing custom track
        await call.unpublishTrack(playbackTrackRef.current);
      }
      playbackTrackRef.current.stop();
      playbackTrackRef.current = null;
    }
    
    setOrbState("IDLE");
    setMode("IDLE");
    setIsConnecting(false);
  }, [call]);

  const startTranslation = useCallback(async (targetMode: "A_SPEAK" | "B_SPEAK") => {
    if (!call || isConnecting) return;
    
    await stopTranslation();
    setIsConnecting(true);
    setMode(targetMode);

    try {
      // 1. Setup Audio Context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      const dest = audioContext.createMediaStreamDestination();

      // 2. Capture Source Audio
      if (targetMode === "A_SPEAK") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(dest);
        setOrbState("LISTENING");
      } else {
        // B_SPEAK: Capture from remote participant
        const remoteParticipant = call.state.participants.find(p => !p.isLocal);
        if (remoteParticipant) {
           // @ts-ignore
          const audioTrack = remoteParticipant.publishedTracks.find((t) => t.audioTrack)?.audioTrack || remoteParticipant.publishedTracks.find((t) => t.track?.kind === "audio")?.track;
          if (audioTrack) {
            const stream = new MediaStream([audioTrack]);
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(dest);
            setOrbState("LISTENING");
          }
        }
      }

      // 3. Connect to Backend
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, "") || window.location.host;
      const wsUrl = `${protocol}://${host}/api/live-audio`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
             const reader = new FileReader();
             reader.onload = () => {
               const base64 = (reader.result as string).split(",")[1];
               // Update format for Gemini Live
               socket.send(JSON.stringify({ 
                 realtime_input: { 
                   media_chunks: [{ 
                     mime_type: "audio/webm;codecs=opus", 
                     data: base64 
                   }] 
                 } 
               }));
             };
             reader.readAsDataURL(event.data);
          }
        };
        mediaRecorder.start(200);
        setIsConnecting(false);
      };

      socket.onmessage = async (event) => {
        // Handle JSON messages (text responses)
        if (typeof event.data === "string") {
          try {
            const msg = JSON.parse(event.data);
            if (msg.text) {
              console.log("Gemini Text:", msg.text);
              // We could show this in the UI if needed
            }
          } catch (e) {
            console.error("Error parsing socket JSON:", e);
          }
          return;
        }

        setOrbState("TRANSLATING");
        
        // Handle binary audio data from Gemini
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;

          if (targetMode === "A_SPEAK") {
            // A Speak: Play back to B (broadcast)
            const broadcastDest = audioContext.createMediaStreamDestination();
            source.connect(broadcastDest);
            
            const track = broadcastDest.stream.getAudioTracks()[0];
            if (!playbackTrackRef.current) {
              playbackTrackRef.current = track;
              // @ts-ignore: publishing custom track to broadcast to others
              await call.publishTrack(track);
            }
          } else {
            // B Speak: Play locally for A
            source.connect(audioContext.destination);
          }
          
          source.start();
          source.onended = () => {
             setOrbState("LISTENING");
          };
        }
      };

      socket.onclose = () => stopTranslation();
      socket.onerror = () => stopTranslation();

    } catch (error) {
      console.error("Failed to start Gemini Live:", error);
      stopTranslation();
    }
  }, [call, isConnecting, stopTranslation]);

  return {
    mode,
    orbState,
    isConnecting,
    startTranslation,
    stopTranslation,
    toggleA: () => mode === "A_SPEAK" ? stopTranslation() : startTranslation("A_SPEAK"),
    toggleB: () => mode === "B_SPEAK" ? stopTranslation() : startTranslation("B_SPEAK"),
  };
}
