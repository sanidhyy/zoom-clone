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
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentTranscriptRef = useRef<string>("");

  const { useMicrophoneState, useLocalParticipant } = useCallStateHooks();
  const { microphone } = useMicrophoneState();
  const localParticipant = useLocalParticipant();

  const lastBroadcastRef = useRef<{ mode: string; orb: OrbState } | null>(null);

  const broadcastState = useCallback((newMode: typeof mode, newOrb: OrbState) => {
    if (call) {
      // Prevent redundant broadcasts to avoid rate limits
      if (lastBroadcastRef.current?.mode === newMode && lastBroadcastRef.current?.orb === newOrb) {
        return;
      }

      call.sendCustomEvent({
        type: "translator:state_change",
        mode: newMode,
        orbState: newOrb,
        userId: localParticipant?.userId,
      });

      lastBroadcastRef.current = { mode: newMode, orb: newOrb };
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
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
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
    setCurrentText("");
    broadcastState("IDLE", "IDLE");
    
    // Ensure microphone is re-enabled if we were in B_SPEAK
    if (call) call.microphone.enable();
  }, [call, broadcastState]);

  const skipTurn = useCallback(() => {
    console.log("Skipping current translation turn");
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
    }
    updateOrbAndBroadcast("LISTENING");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, [updateOrbAndBroadcast]);

  const startTranslation = useCallback(async (targetMode: "A_SPEAK" | "B_SPEAK") => {
    if (!call || isConnecting) return;
    
    await stopTranslation();
    setIsConnecting(true);
    setMode(targetMode);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      if (audioContext.state === "suspended") await audioContext.resume();
      const dest = audioContext.createMediaStreamDestination();

      if (targetMode === "A_SPEAK") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(dest);
        setOrbState("LISTENING");
      } else {
        const remoteParticipant = call.state.participants.find((p: any) => !p.isLocal);
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

      // Direct Gemini Live WebSocket connection for Vercel compatibility
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.LiveConnect?key=${apiKey}`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        // Send initial setup
        socket.send(JSON.stringify({
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: { voice_name: "Orus" }
                }
              }
            },
            system_instruction: {
              parts: [{ text: "You are a real-time translator. Translate everything you hear between English and Tagalog. Your output should be ONLY the translation in audio form. Be fast and accurate. Use natural pauses." }]
            }
          }
        }));

        const mediaRecorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              socket.send(JSON.stringify({
                realtime_input: {
                  media_chunks: [{ mime_type: "audio/webm;codecs=opus", data: base64 }]
                }
              }));
            };
            reader.readAsDataURL(event.data);
          }
        };
        mediaRecorder.start(100);
        setIsConnecting(false);
      };

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.serverContent?.modelTurn?.parts) {
          for (const part of msg.serverContent.modelTurn.parts) {
            // Handle Text response
            if (part.text) {
              setCurrentText(prev => prev + part.text);
              currentTranscriptRef.current += part.text;
              
              // Narrative Flow: Detect sentence completion for read-aloud synchronization
              if (/[.!?]/.test(part.text)) {
                console.log("Sentence complete, read-aloud trigger potentially handled by Gemini's AUDIO modality.");
              }
            }

            // Handle Audio response
            if (part.inlineData?.data) {
              // Narrative Flow: Mute mic during playback
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.pause();
              }
              if (targetMode === "B_SPEAK") call.microphone.disable();
              
              updateOrbAndBroadcast("TRANSLATING");

              const binaryString = window.atob(part.inlineData.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
              
              const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              activeSourceRef.current = source;

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
                source.connect(audioContext.destination);
              }

              source.start();
              source.onended = () => {
                if (activeSourceRef.current === source) activeSourceRef.current = null;
                updateOrbAndBroadcast("LISTENING");
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
                  mediaRecorderRef.current.resume();
                }
                if (targetMode === "B_SPEAK") call.microphone.enable();

                // Save to Supabase
                if (currentTranscriptRef.current) {
                  const finalTranscript: Transcript = {
                    id: `${Date.now()}-${Math.random()}`,
                    text: currentTranscriptRef.current,
                    isFinal: true,
                    timestamp: new Date(),
                  };
                  setTranscripts(prev => [...prev.slice(-10), finalTranscript]);
                  
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
                  }).catch(console.error);
                  currentTranscriptRef.current = "";
                  setCurrentText("");
                }
              };
            }
          }
        }
      };

      socket.onclose = () => stopTranslation();
      socket.onerror = () => stopTranslation();

    } catch (error) {
      console.error("Gemini Live failed:", error);
      stopTranslation();
    }
  }, [call, isConnecting, stopTranslation, updateOrbAndBroadcast]);

  useEffect(() => {
    if (!call) return;
    const unsubscribe = call.on("custom", (event: any) => {
      if (event.type === "translator:state_change") {
        const data = event.payload as any;
        if (data.userId !== localParticipant?.userId) {
          if (data.orbState === "TRANSLATING") {
            setOrbState("TRANSLATING");
            call.microphone.disable();
          } else if (data.orbState === "LISTENING") {
            setOrbState("LISTENING");
          } else {
            setOrbState("IDLE");
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
    skipTurn,
    toggleA: () => mode === "A_SPEAK" ? stopTranslation() : startTranslation("A_SPEAK"),
    toggleB: () => mode === "B_SPEAK" ? stopTranslation() : startTranslation("B_SPEAK"),
  };
}
