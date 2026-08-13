# Smart Campus AI Service (Python)

IIT Bombay campus knowledge RAG + lecture intelligence + placement matching.
Next.js app ka modular AI backend. Alag se chalta hai (uv se managed).

## Setup (uv)

[uv](https://docs.astral.sh/uv/) install karo (faster, cleaner than pip/venv):

```bash
cd services/ai
cp .env.example .env   # AI_PROVIDER + API key daalo
uv sync                # deps install (pyproject.toml se)
uv run uvicorn app.main:app --port 8000
```

Naya dependency add karne ke liye `pyproject.toml` me `dependencies` me daalo,
phir `uv sync`. venv kharab ho jaye toh `rm -rf .venv && uv sync`.

## Face recognition (UniFace) + anti-spoofing

Attendance face check-in ke liye [UniFace](https://github.com/yakhyo/uniface) use hota hai
(SCRFD detection + ArcFace embeddings + MiniFASNet liveness). Models first use par
auto-download hote hain (`~/.uniface/models`). Enrolled embeddings
`services/ai/data/face_store.json` me save hote hain.

Anti-spoofing (MiniFASNet) har enroll/recognize pe liveness check karta hai —
printed photo ya phone screen wali fake image reject hoti hai. Threshold
`LIVENESS_THRESHOLD` env se tune karo (default 0.6). `uniface` ya models missing ho
toh liveness skip hota hai aur service chalti rehti hai — app kabhi nahi tootta.
Static photo (printed/screen) se test karna ho toh `FACE_LIVENESS_DISABLED=1` ke saath
service start karo — liveness bypass hota hai, sirf testing ke liye.

## Free LLM options

- `AI_PROVIDER=gemini` + `GEMINI_API_KEY` — Google AI Studio se free key
  (https://aistudio.google.com/apikey)
- `AI_PROVIDER=deepseek` + `DEEPSEEK_API_KEY` — DeepSeek platform se key

Key nahi set kiya toh bhi service chalti hai — RAG retrieval + mock responses
deti hai, app kabhi toot-ta nahi.

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/health` | Status + provider + KB + face/liveness |
| POST | `/chat` | Campus FAQ RAG chatbot (citations ke saath) |
| POST | `/summarize` | Lecture transcript → structured study notes |
| POST | `/match` | Student skills → placement match % |
| POST | `/sentiment` | Feedback sentiment analysis |
| POST | `/face/enroll` | Face photo → embedding store (UniFace + liveness) |
| POST | `/face/recognize` | Face photo → identity match + confidence (liveness) |

FastAPI docs: `http://localhost:8000/docs` (Swagger/OpenAPI — PS bonus item).

## Env vars (`.env`)

```
AI_PROVIDER=gemini
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
LIVENESS_THRESHOLD=0.6
```

> `.venv`, `.env`, `data/`, `__pycache__` sab gitignored hain. Service file ko
> restart karna padta hai knowledge base ya code badalne ke baad (`--reload` dev
> me use karo).
