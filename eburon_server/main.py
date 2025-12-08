"""
Eburon Transcription Server

A whitelabeled transcription API powered by Deepgram, with advanced features including:
- Language detection
- Entity detection  
- Sentiment analysis
- Speaker diarization
- Smart formatting
- Text-to-Speech (Edge-TTS)
"""

import os
import httpx
from typing import List, Optional, Generator, AsyncGenerator
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect, Header
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepgram import DeepgramClient
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Eburon Transcription API",
    description="Enterprise-grade speech-to-text and text-to-speech powered by Eburon",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "f6f244ccff0fd0032a8fe12738097724cf6cf721")
TTS_SERVICE_URL = os.getenv("TTS_SERVICE_URL", "http://localhost:7861")
CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY", "sk_car_8b724njcx9huGZrFQYz1B8")

# Valid API keys (in production, fetch from Supabase)
VALID_API_KEYS = set()


def verify_api_key(authorization: str = Header(...)):
    """Verify the Authorization header contains a valid API key."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization[7:]
    if not api_key.startswith("eb_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")
    
    # In production, validate against Supabase
    return api_key


class TranscribeURLRequest(BaseModel):
    url: str
    language: Optional[str] = None
    model: str = "nova-3"
    detect_language: bool = True
    detect_entities: bool = True
    sentiment: bool = True
    smart_format: bool = True
    diarize: bool = True
    punctuate: bool = True
    paragraphs: bool = True
    utterances: bool = True


class TranscribeResponse(BaseModel):
    success: bool
    transcript: str
    language: Optional[str] = None
    confidence: Optional[float] = None
    words: Optional[list] = None
    paragraphs: Optional[list] = None
    sentiments: Optional[list] = None
    entities: Optional[list] = None
    provider: str = "Eburon Transcription"
    version: str = "1.0"


class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"  # Edge-TTS voice or Cartesia voice ID
    tier: str = "beta"  # "beta" (Edge-TTS) or "pro" (Cartesia)
    rate: int = 0  # -50 to +100 (Edge-TTS only)
    pitch: int = 0  # -50 to +50 (Edge-TTS only)
    speed: float = 1.0  # Cartesia speed multiplier
    cartesia_voice_id: str = "228fca29-3a0a-435c-8728-5cb483251068"  # Default Cartesia voice


class TTSResponse(BaseModel):
    success: bool
    message: str
    voice: str
    text_length: int
    provider: str = "Eburon TTS"


class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = "mistral-large-3:675b-cloud"
    tier: str = "beta"  # "beta" (Ollama) or "pro" (Gemini)
    temperature: float = 0.7
    max_tokens: int = 2048
    stream: bool = False


class ChatResponse(BaseModel):
    success: bool
    message: str
    model: str
    usage: Optional[dict] = None
    provider: str = "Eburon Chat"


OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")


@app.get("/")
async def root():
    return {
        "service": "Eburon API",
        "version": "1.0.0",
        "status": "healthy",
        "documentation": "/docs",
        "endpoints": {
            "transcribe": "/transcribe/url",
            "tts": "/api/realtime-speech",
            "chat": "/api/message",
            "voices": "/api/voices",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/transcribe/url", response_model=TranscribeResponse)
async def transcribe_url(
    request: TranscribeURLRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Transcribe audio from a URL.
    
    Features:
    - Language detection
    - Entity detection
    - Sentiment analysis
    - Speaker diarization
    - Smart formatting
    - Paragraphs & utterances
    """
    try:
        if not DEEPGRAM_API_KEY:
            raise HTTPException(status_code=500, detail="Deepgram API key not configured")

        deepgram = DeepgramClient(api_key=DEEPGRAM_API_KEY)

        response = deepgram.listen.rest.v("1").transcribe_url(
            {"url": request.url},
            {
                "model": request.model,
                "detect_language": request.detect_language,
                "detect_entities": request.detect_entities,
                "sentiment": request.sentiment,
                "smart_format": request.smart_format,
                "diarize": request.diarize,
                "punctuate": request.punctuate,
                "paragraphs": request.paragraphs,
                "utterances": request.utterances,
                "utt_split": 0.8,
            }
        )

        # Extract results
        channel = response.results.channels[0]
        alternative = channel.alternatives[0]
        
        result = TranscribeResponse(
            success=True,
            transcript=alternative.transcript,
            language=channel.detected_language if hasattr(channel, 'detected_language') else None,
            confidence=alternative.confidence if hasattr(alternative, 'confidence') else None,
            words=alternative.words if hasattr(alternative, 'words') else None,
            paragraphs=response.results.paragraphs.paragraphs if hasattr(response.results, 'paragraphs') else None,
            sentiments=response.results.sentiments.segments if hasattr(response.results, 'sentiments') else None,
            entities=response.results.entities if hasattr(response.results, 'entities') else None,
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/transcribe/file")
async def transcribe_file(
    api_key: str = Depends(verify_api_key),
):
    """
    Transcribe audio from an uploaded file.
    (Implementation placeholder)
    """
    raise HTTPException(status_code=501, detail="File upload not yet implemented")


@app.post("/api/message", response_model=ChatResponse)
async def chat_message(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Send a message and get a response using Eburon Chat (powered by Mistral).
    
    This is an OpenAI-compatible chat completion endpoint.
    
    Models available:
    - mistral-large-3:675b-cloud (default, best quality)
    - cogito-2.1:671b-cloud (alternative)
    - llama3.2:1b (fast, lightweight)
    """
    if request.tier.lower() == "pro":
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
            
            # Convert messages to Gemini format
            gemini_contents = []
            for msg in request.messages:
                gemini_contents.append(types.Content(
                    role="user" if msg.role == "user" else "model",
                    parts=[types.Part.from_text(text=msg.content)]
                ))
            
            # Tools configuration
            tools = [
                types.Tool(google_search=types.GoogleSearch()),
                types.Tool(code_execution=types.ToolCodeExecution)
            ]
            
            # Thinking config (Budget: 8192 tokens)
            generate_content_config = types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(include_thoughts=True),
                tools=tools,
                response_modalities=["TEXT"]
            )

            # Generate content
            # Note: For non-streaming request
            response = client.models.generate_content(
                model="gemini-2.0-flash-thinking-exp-1219",  # Using thinking model
                contents=gemini_contents,
                config=generate_content_config
            )
            
            # Extract text from response parts
            full_text = ""
            for part in response.candidates[0].content.parts:
                if part.text:
                    full_text += part.text
            
            return ChatResponse(
                success=True,
                message=full_text,
                model="gemini-2.0-flash-thinking-exp-1219",
                usage={
                    "prompt_tokens": response.usage_metadata.prompt_token_count if response.usage_metadata else 0,
                    "completion_tokens": response.usage_metadata.candidates_token_count if response.usage_metadata else 0,
                    "total_tokens": response.usage_metadata.total_token_count if response.usage_metadata else 0
                }
            )

        except ImportError:
             raise HTTPException(status_code=500, detail="google-genai not installed")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pro Chat failed: {str(e)}")

    # BETA: Ollama
    try:
        # Convert to Ollama format
        ollama_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": request.model,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {
                        "temperature": request.temperature,
                        "num_predict": request.max_tokens,
                    }
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502, 
                    detail=f"Chat service error: {response.text}"
                )
            
            result = response.json()
            
            return ChatResponse(
                success=True,
                message=result.get("message", {}).get("content", ""),
                model=result.get("model", request.model),
                usage={
                    "prompt_tokens": result.get("prompt_eval_count", 0),
                    "completion_tokens": result.get("eval_count", 0),
                    "total_tokens": result.get("prompt_eval_count", 0) + result.get("eval_count", 0)
                }
            )

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Chat request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/api/models")
async def list_models():
    """
    List available chat models.
    """
    return {
        "models": [
            {
                "id": "mistral-large-3:675b-cloud",
                "name": "Mistral Large 3",
                "description": "Best quality, 675B parameters",
                "context_length": 32768
            },
            {
                "id": "cogito-2.1:671b-cloud",
                "name": "Cogito 2.1",
                "description": "Advanced reasoning, 671B parameters",
                "context_length": 32768
            },
            {
                "id": "llama3.2:1b",
                "name": "Llama 3.2",
                "description": "Fast and lightweight, 1B parameters",
                "context_length": 8192
            }
        ],
        "provider": "Eburon Chat"
    }


@app.post("/api/realtime-speech")
async def realtime_speech(
    request: TTSRequest,
    api_key: str = Depends(verify_api_key),
):
    """
    Convert text to speech.
    
    Tiers:
    - **pro**: Cartesia Sonic-3 (high quality, emotional)
    - **beta**: Edge-TTS (free, Microsoft voices)
    
    Pro (Cartesia) Voices:
    - Use cartesia_voice_id field with voice ID
    
    Beta (Edge-TTS) Voices:
    - en-US-AriaNeural, en-US-GuyNeural, en-GB-SoniaNeural, etc.
    """
    
    # PRO: Cartesia TTS
    if request.tier.lower() == "pro":
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.cartesia.ai/tts/bytes",
                    headers={
                        "Cartesia-Version": "2025-04-16",
                        "X-API-Key": CARTESIA_API_KEY,
                        "Content-Type": "application/json"
                    },
                    json={
                        "model_id": "sonic-3",
                        "transcript": request.text,
                        "voice": {
                            "mode": "id",
                            "id": request.cartesia_voice_id
                        },
                        "output_format": {
                            "container": "mp3",
                            "encoding": "mp3",
                            "sample_rate": 44100
                        },
                        "speed": "normal",
                        "generation_config": {
                            "speed": request.speed,
                            "volume": 1
                        }
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=502, 
                        detail=f"Cartesia TTS error: {response.text}"
                    )
                
                return StreamingResponse(
                    iter([response.content]),
                    media_type="audio/mpeg",
                    headers={
                        "Content-Disposition": "inline; filename=speech.mp3",
                        "X-Eburon-Voice": request.cartesia_voice_id,
                        "X-Eburon-Provider": "Cartesia-Pro",
                        "X-Eburon-Tier": "pro"
                    }
                )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Cartesia TTS timed out")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pro TTS failed: {str(e)}")
    
    # BETA: Edge-TTS
    try:
        import edge_tts
        import io
        
        communicate = edge_tts.Communicate(
            request.text,
            request.voice,
            rate=f"{'+' if request.rate >= 0 else ''}{request.rate}%",
            pitch=f"{'+' if request.pitch >= 0 else ''}{request.pitch}Hz"
        )
        
        audio_data = io.BytesIO()
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
        
        audio_data.seek(0)
        
        return StreamingResponse(
            audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "X-Eburon-Voice": request.voice,
                "X-Eburon-Provider": "Edge-TTS-Beta",
                "X-Eburon-Tier": "beta"
            }
        )

    except ImportError:
        raise HTTPException(status_code=500, detail="Edge-TTS not installed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Beta TTS failed: {str(e)}")


@app.get("/api/voices")
async def list_voices():
    """
    List available TTS voices for Pro and Beta tiers.
    """
    return {
        "pro": {
            "provider": "Cartesia Sonic-3",
            "description": "High-quality emotional TTS",
            "voices": [
                {
                    "id": "0e9bf92b-0a2a-406e-b55e-c1db92ceb9ca",
                    "name": "Eburon Clone",
                    "description": "Custom cloned voice",
                    "language": "English",
                    "type": "cloned"
                },
                {
                    "id": "228fca29-3a0a-435c-8728-5cb483251068",
                    "name": "Sarah",
                    "description": "Warm, friendly female voice",
                    "language": "English (US)",
                    "type": "preset"
                },
                {
                    "id": "bf991597-6c13-47e4-8411-91ec2de5c466",
                    "name": "Barbershop Man",
                    "description": "Deep male voice",
                    "language": "English (US)",
                    "type": "preset"
                },
                {
                    "id": "c45bc5ec-dc68-4feb-8829-6e6b2748095d",
                    "name": "Confident British Man",
                    "description": "Professional British accent",
                    "language": "English (UK)",
                    "type": "preset"
                },
                {
                    "id": "e13cae5c-ec59-4f71-b0a6-266df3c9bb8e",
                    "name": "Salesman",
                    "description": "Energetic, persuasive voice",
                    "language": "English (US)",
                    "type": "preset"
                },
                {
                    "id": "00a77add-48d5-4ef6-8157-71e5437b282d",
                    "name": "Classy British Man",
                    "description": "Elegant British male",
                    "language": "English (UK)",
                    "type": "preset"
                },
                {
                    "id": "a0e99841-438c-4a64-b679-ae501e7d6091",
                    "name": "Friendly Sidekick",
                    "description": "Casual, fun voice",
                    "language": "English (US)",
                    "type": "preset"
                },
                {
                    "id": "156fb8d2-335b-4950-9cb3-a2d33befec77",
                    "name": "Soothing Woman",
                    "description": "Calm, relaxing female",
                    "language": "English (US)",
                    "type": "preset"
                },
                {
                    "id": "d46abd1d-2571-4dfa-9685-28e56e0e6666",
                    "name": "Young Woman",
                    "description": "Youthful female voice",
                    "language": "English (US)",
                    "type": "preset"
                }
            ]
        },
        "beta": {
            "provider": "Edge-TTS (Microsoft)",
            "description": "Free Microsoft neural voices",
            "voices": [
                {"id": "en-US-AriaNeural", "name": "Aria", "language": "English (US)", "gender": "Female"},
                {"id": "en-US-GuyNeural", "name": "Guy", "language": "English (US)", "gender": "Male"},
                {"id": "en-US-JennyNeural", "name": "Jenny", "language": "English (US)", "gender": "Female"},
                {"id": "en-US-ChristopherNeural", "name": "Christopher", "language": "English (US)", "gender": "Male"},
                {"id": "en-GB-SoniaNeural", "name": "Sonia", "language": "English (UK)", "gender": "Female"},
                {"id": "en-GB-RyanNeural", "name": "Ryan", "language": "English (UK)", "gender": "Male"},
                {"id": "en-AU-NatashaNeural", "name": "Natasha", "language": "English (AU)", "gender": "Female"},
                {"id": "en-AU-WilliamNeural", "name": "William", "language": "English (AU)", "gender": "Male"},
                {"id": "ja-JP-NanamiNeural", "name": "Nanami", "language": "Japanese", "gender": "Female"},
                {"id": "ja-JP-KeitaNeural", "name": "Keita", "language": "Japanese", "gender": "Male"},
                {"id": "zh-CN-XiaoxiaoNeural", "name": "Xiaoxiao", "language": "Chinese (CN)", "gender": "Female"},
                {"id": "zh-CN-YunxiNeural", "name": "Yunxi", "language": "Chinese (CN)", "gender": "Male"},
                {"id": "ko-KR-SunHiNeural", "name": "SunHi", "language": "Korean", "gender": "Female"},
                {"id": "es-ES-ElviraNeural", "name": "Elvira", "language": "Spanish (ES)", "gender": "Female"},
                {"id": "es-MX-DaliaNeural", "name": "Dalia", "language": "Spanish (MX)", "gender": "Female"},
                {"id": "fr-FR-DeniseNeural", "name": "Denise", "language": "French (FR)", "gender": "Female"},
                {"id": "fr-FR-HenriNeural", "name": "Henri", "language": "French (FR)", "gender": "Male"},
                {"id": "de-DE-KatjaNeural", "name": "Katja", "language": "German", "gender": "Female"},
                {"id": "de-DE-ConradNeural", "name": "Conrad", "language": "German", "gender": "Male"},
                {"id": "it-IT-ElsaNeural", "name": "Elsa", "language": "Italian", "gender": "Female"},
                {"id": "pt-BR-FranciscaNeural", "name": "Francisca", "language": "Portuguese (BR)", "gender": "Female"},
                {"id": "ru-RU-SvetlanaNeural", "name": "Svetlana", "language": "Russian", "gender": "Female"},
                {"id": "ar-SA-ZariyahNeural", "name": "Zariyah", "language": "Arabic (SA)", "gender": "Female"},
                {"id": "hi-IN-SwaraNeural", "name": "Swara", "language": "Hindi", "gender": "Female"},
                {"id": "fil-PH-BlessicaNeural", "name": "Blessica", "language": "Filipino", "gender": "Female"}
            ]
        },
        "provider": "Eburon TTS"
    }


@app.websocket("/api/live-audio")
async def live_audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        from google import genai
        from google.genai import types
        import asyncio
    except ImportError:
        await websocket.close(code=1011, reason="Missing google-genai dependency")
        return

    client = genai.Client(
        http_options={"api_version": "v1beta"},
        api_key=os.getenv("GEMINI_API_KEY")
    )
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        media_resolution="MEDIA_RESOLUTION_MEDIUM",
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Charon")
            )
        ),
        realtime_input_config=types.RealtimeInputConfig(turn_coverage="TURN_INCLUDES_ALL_INPUT"),
        context_window_compression=types.ContextWindowCompressionConfig(
            trigger_tokens=25600,
            sliding_window=types.SlidingWindow(target_tokens=12800),
        ),
    )
    
    model = "models/gemini-2.5-flash-native-audio-preview-09-2025"
    
    try:
        async with client.aio.live.connect(model=model, config=config) as session:
            
            async def send_to_gemini():
                try:
                    while True:
                        # Client sends: {"mime_type": "...", "data": "base64...", "end_of_turn": bool}
                        msg = await websocket.receive_json()
                        await session.send(input=msg, end_of_turn=msg.get("end_of_turn", False))
                except WebSocketDisconnect:
                    pass
                except Exception as e:
                    print(f"Error sending to Gemini: {e}")

            async def receive_from_gemini():
                try:
                    while True:
                        turn = session.receive()
                        async for response in turn:
                            if response.data:
                                await websocket.send_bytes(response.data)
                            if response.text:
                                await websocket.send_json({"text": response.text})
                except Exception as e:
                    print(f"Error receiving from Gemini: {e}")

            await asyncio.gather(send_to_gemini(), receive_from_gemini())

    except Exception as e:
        print(f"Gemini connection error: {e}")
        try:
            await websocket.close(code=1011, reason=str(e))
        except:
            pass


@app.websocket("/transcribe/ws")
async def transcribe_websocket(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # 1. Validate Deepgram Key
        if not DEEPGRAM_API_KEY:
             print("Error: DEEPGRAM_API_KEY missing")
             await websocket.close(code=1011, reason="Server misconfiguration")
             return

        # 2. Setup Deepgram Connection
        from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
        
        # Initialize client
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)
        dg_connection = deepgram.listen.asyncwebsocket.v("1")

        # 3. Define Event Handlers
        async def on_message(self, result, **kwargs):
            try:
                if result.channel and result.channel.alternatives:
                    alt = result.channel.alternatives[0]
                    transcript = alt.transcript
                    is_final = result.is_final
                    
                    if transcript:
                        response_data = {
                            "channel": {
                                "alternatives": [{
                                    "transcript": transcript
                                }]
                            },
                            "is_final": is_final
                        }
                        await websocket.send_json(response_data)
            except Exception as e:
                print(f"Error sending to client: {e}")

        async def on_metadata(self, metadata, **kwargs):
            # Optional: Forward metadata if needed
            pass

        async def on_error(self, error, **kwargs):
            print(f"Deepgram Error: {error}")

        # Register handlers
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Metadata, on_metadata)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        # 4. Connect to Deepgram
        options = LiveOptions(
            model="nova-2", 
            language="en-US", 
            smart_format=True, 
            interim_results=True,
            vad_events=True
        )
        
        if await dg_connection.start(options) is False:
            print("Failed to start Deepgram connection")
            await websocket.close(code=1011, reason="Deepgram connection failed")
            return

        # 5. Proxy Loop (Client Audio -> Deepgram)
        try:
            while True:
                data = await websocket.receive_bytes()
                await dg_connection.send(data)
        except WebSocketDisconnect:
            print("Client disconnected")
        except Exception as e:
            print(f"Connection loop error: {e}")
        finally:
            await dg_connection.finish()

    except Exception as e:
        print(f"WebSocket Setup Error: {e}")
        try:
            await websocket.close(code=1011, reason=str(e))
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3744)

