# Eburon Transcription Server

A Python-based transcription API powered by Deepgram, whitelabeled as Eburon Transcription.

## Features

- **Nova-3 Model** - Latest Deepgram model for highest accuracy
- **Language Detection** - Automatic language identification
- **Entity Detection** - Extracts names, locations, etc.
- **Sentiment Analysis** - Identifies emotional tone
- **Speaker Diarization** - Separates multiple speakers
- **Smart Formatting** - Numbers, dates, currencies formatted
- **Paragraphs & Utterances** - Structured text output

## Setup

```bash
cd eburon_server
pip install -r requirements.txt
```

## Environment Variables

Add to `.env.local` in the parent directory:
```
DEEPGRAM_API_KEY=your_deepgram_key
```

## Run Server

```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Transcribe URL
```bash
curl -X POST http://localhost:8000/transcribe/url \
  -H "Authorization: Bearer eb_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/audio.wav",
    "model": "nova-3",
    "detect_language": true,
    "diarize": true
  }'
```

### Response
```json
{
  "success": true,
  "transcript": "Hello, how are you?",
  "language": "en",
  "confidence": 0.98,
  "words": [...],
  "paragraphs": [...],
  "sentiments": [...],
  "entities": [...],
  "provider": "Eburon Transcription",
  "version": "1.0"
}
```
