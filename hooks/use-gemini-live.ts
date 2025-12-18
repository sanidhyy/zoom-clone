"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Call, useCallStateHooks } from "@stream-io/video-react-sdk";
import { OrbState } from "@/components/translator-orbs";

interface Transcript {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

interface UseGeminiLiveOptions {
  call: Call | undefined;
  meetingId: string;
}

interface TranslatorStateEvent {
  mode: "IDLE" | "A_SPEAK" | "B_SPEAK";
  orbState: OrbState;
  userId: string;
}

export function useGeminiLive({ call, meetingId }: UseGeminiLiveOptions) {
  const [mode, setMode] = useState<"IDLE" | "A_SPEAK" | "B_SPEAK">("IDLE");
  const [orbState, setOrbState] = useState<OrbState>("IDLE");
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentText, setCurrentText] = useState("");
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackTrackRef = useRef<MediaStreamTrack | null>(null);
  const currentTranscriptRef = useRef<string>("");

  const { useMicrophoneState, useLocalParticipant } = useCallStateHooks();
  const { microphone } = useMicrophoneState();
  const localParticipant = useLocalParticipant();

  const broadcastState = useCallback((newMode: typeof mode, newOrb: OrbState) => {
    if (call) {
      call.sendCustomEvent({
        type: "translator:state_change",
        mode: newMode,
        orbState: newOrb,
        userId: localParticipant?.userId,
      });
    }
  }, [call, localParticipant]);

  const updateOrbAndBroadcast = useCallback((newOrb: OrbState) => {
    setOrbState(newOrb);
    broadcastState(mode, newOrb);
  }, [mode, broadcastState]);

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
    setTranscripts([]);
    setCurrentText("");
    broadcastState("IDLE", "IDLE");
  }, [call, broadcastState]);

  const startTranslation = useCallback(async (targetMode: "A_SPEAK" | "B_SPEAK") => {
    if (!call || isConnecting) return;
    
    await stopTranslation();
    setIsConnecting(true);
    setMode(targetMode);

    try {
      console.log(`Starting translation session for mode: ${targetMode}`);
      // 1. Setup Audio Context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      if (audioContext.state === "suspended") {
        console.log("Resuming audio context...");
        await audioContext.resume();
      }
      const dest = audioContext.createMediaStreamDestination();

      // 2. Capture Source Audio
      if (targetMode === "A_SPEAK") {
        console.log("Capturing local audio for A_SPEAK");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(dest);
        setOrbState("LISTENING");
      } else {
        // B_SPEAK: Capture from remote participant
        console.log("Searching for remote participant for B_SPEAK");
        const remoteParticipant = call.state.participants.find((p: any) => !p.isLocal);
        if (remoteParticipant) {
           console.log(`Remote participant found: ${remoteParticipant.userId}`);
           // @ts-ignore
          const audioTrack = remoteParticipant.publishedTracks.find((t) => t.audioTrack)?.audioTrack || remoteParticipant.publishedTracks.find((t) => t.track?.kind === "audio")?.track;
          if (audioTrack) {
            console.log("Remote audio track captured, connecting to destination");
            const stream = new MediaStream([audioTrack]);
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(dest);
            setOrbState("LISTENING");
          } else {
            console.warn("No audio track found for remote participant");
          }
        } else {
          console.warn("No remote participant found to translate");
        }
      }

      // 3. Connect to Backend
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/^https?:\/\//, "") || window.location.host;
      const wsUrl = `${protocol}://${host}/api/live-audio`;
      
      const socket = new WebSocket(wsUrl);
      socket.binaryType = "blob"; // Explicitly set binary type
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Gemini WebSocket Connected");
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
        console.log("Socket message received:", typeof event.data);
        if (typeof event.data === "string") {
          try {
            const msg = JSON.parse(event.data);
            if (msg.text) {
              console.log("Gemini Text:", msg.text);
              setCurrentText(prev => prev + msg.text);
              currentTranscriptRef.current += msg.text;
            }
          } catch (e) {
            console.error("Error parsing socket JSON:", e);
          }
          return;
        }

        // --- READ-ALOUD MODE START ---
        // 1. Separation: Stop current recording to avoid feedback
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.pause();
        }
        
        updateOrbAndBroadcast("TRANSLATING");
        
        // Handle binary audio data from Gemini
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;

          // In A_SPEAK, we want the remote Peer to hear our translation.
          // In B_SPEAK, we want the Local Peer (us) to hear their translation.
          if (targetMode === "A_SPEAK") {
            const broadcastDest = audioContext.createMediaStreamDestination();
            source.connect(broadcastDest);
            
            const track = broadcastDest.stream.getAudioTracks()[0];
            if (!playbackTrackRef.current) {
              playbackTrackRef.current = track;
              // @ts-ignore
              await call.publishTrack(track);
            }
          } else {
            // Local playback for us to understand them
            source.connect(audioContext.destination);
          }
          
          source.start();
          source.onended = () => {
             // --- LISTENING MODE RESUME ---
             updateOrbAndBroadcast("LISTENING");
             if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
               mediaRecorderRef.current.resume();
             }
             
             // Save to Supabase after the translation segment
             if (currentTranscriptRef.current) {
                const finalTranscript: Transcript = {
                  id: `${Date.now()}-${Math.random()}`,
                  text: currentTranscriptRef.current,
                  isFinal: true,
                  timestamp: new Date(),
                };
                setTranscripts(prev => [...prev.slice(-10), finalTranscript]);
                setCurrentText("");

                fetch("/api/transcribe/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    session_id: meetingId,
                    user_name: localParticipant?.name || "Unknown",
                    original_text: "Audio Speech",
                    translated_text: currentTranscriptRef.current,
                    language_pair: targetMode === "A_SPEAK" ? "en-tl" : "tl-en",
                  }),
                }).catch(err => console.error("Failed to save transcript:", err));
                currentTranscriptRef.current = "";
             }
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

  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on("custom", (event: any) => {
      if (event.type === "translator:state_change") {
        const data = event.payload as any;
        if (data.userId !== localParticipant?.userId) {
          // If another participant is TRANSLATING, we should show it
          // and mute our mic
          if (data.orbState === "TRANSLATING") {
            setOrbState("TRANSLATING");
            call.microphone.disable();
          } else if (data.orbState === "LISTENING") {
            setOrbState("LISTENING");
          } else {
            setOrbState("IDLE");
            // Only re-enable if we weren't manually muted
            // Actually, keep it simple for now as requested: "B mic OFF while B is hearing"
            call.microphone.enable();
          }
        }
      }
    });

    return () => unsubscribe();
  }, [call, localParticipant]);

  useEffect(() => {
    return () => {
      stopTranslation();
    };
  }, [stopTranslation]);

  return {
    mode,
    orbState,
    isConnecting,
    transcripts,
    currentText,
    startTranslation,
    stopTranslation,
    toggleA: () => mode === "A_SPEAK" ? stopTranslation() : startTranslation("A_SPEAK"),
    toggleB: () => mode === "B_SPEAK" ? stopTranslation() : startTranslation("B_SPEAK"),
  };
}
