# Smart Campus AI Service (Python)

IIT Bombay campus knowledge RAG + lecture intelligence + placement matching.
Next.js app ka modular AI backend. Alag se chalta hai (venv me).

## Setup

```bash
cd services/ai
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # AI_PROVIDER + API key daalo
.venv/bin/uvicorn app.main:app --port 8000
```

## Free LLM options

- `AI_PROVIDER=gemini` + `GEMINI_API_KEY` — Google AI Studio se free key
  (https://aistudio.google.com/apikey)
- `AI_PROVIDER=deepseek` + `DEEPSEEK_API_KEY` — DeepSeek platform se key

Key nahi set kiya toh bhi service chalti hai — RAG retrieval + mock responses
deti hai, app kabhi toot-ta nahi.

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/health` | Status + provider + KB size |
| POST | `/chat` | Campus FAQ RAG chatbot (citations ke saath) |
| POST | `/summarize` | Lecture transcript → structured study notes |
| POST | `/match` | Student skills → placement match % |
| POST | `/sentiment` | Feedback sentiment analysis |

FastAPI docs: `http://localhost:8000/docs` (Swagger/OpenAPI — PS bonus item).

## Env vars (`.env`)

```
AI_PROVIDER=gemini
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
```

> `.venv`, `.env`, `__pycache__` sab gitignored hain. Service file ko restart
> karna padta hai knowledge base ya code badalne ke baad (`--reload` dev me use karo).
