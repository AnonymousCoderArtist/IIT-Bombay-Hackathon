from typing import Any
import re

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .face import available as face_available, count as face_count, enroll as face_enroll, recognize as face_recognize
from .llm import configured_provider, generate_text
from .rag import rag

app = FastAPI(
    title="Smart Campus AI Service",
    version="1.0.0",
    description="IIT Bombay campus knowledge RAG + lecture intelligence + placement matching",
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)


class SummarizeRequest(BaseModel):
    title: str = Field(default="", max_length=200)
    transcript: str = Field(min_length=30, max_length=50000)


class MatchRequest(BaseModel):
    job_role: str = Field(min_length=2, max_length=200)
    job_skills: list[str] = Field(default_factory=list, max_length=50)
    job_requirements: str = Field(default="", max_length=1000)
    profile_skills: list[str] = Field(min_length=1, max_length=50)
    profile_extra: str = Field(default="", max_length=1000)


class SentimentRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)


class PlagiarismItem(BaseModel):
    id: str = Field(min_length=1, max_length=100)
    text: str = Field(default="", max_length=2000)


class PlagiarismRequest(BaseModel):
    texts: list[PlagiarismItem] = Field(min_length=2, max_length=200)


class FaceEnrollRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    image: str = Field(min_length=16)


class FaceRecognizeRequest(BaseModel):
    image: str = Field(min_length=16)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "provider": configured_provider(),
        "kb_chunks": len(rag.chunks),
        "face": {"available": face_available(), "enrolled": face_count()},
    }


CHAT_SYSTEM = """Tum IIT Bombay ka Smart Campus AI assistant ho. Sirf diye gaye knowledge base se jawab do. Har jawab ke end me "[Source: ...]" likho jahan se info li. Agar knowledge base me nahi hai toh seedha bolo ki iska jawab mere paas nahi hai, guess mat karo. Hinglish/Hindi + English mix me concise jawab do."""


@app.post("/chat")
async def chat(req: ChatRequest) -> dict[str, Any]:
    results = rag.retrieve(req.question, top_k=4)
    if not results:
        return {"answer": "Is sawal ka jawab mere campus knowledge base me nahi hai.", "sources": [], "provider": configured_provider()}

    context = "\n\n".join(f"Source: {r['source']}\n{r['text']}" for r in results)

    if configured_provider() != "mock":
        prompt = f"{CHAT_SYSTEM}\n\nKnowledge base:\n{context}\n\nQuestion: {req.question}"
        try:
            answer = await generate_text(prompt)
            return {"answer": answer, "sources": [r["source"] for r in results], "provider": configured_provider()}
        except Exception:
            pass

    best = results[0]
    return {
        "answer": f"{best['text']}\n\n[Source: {best['source']}]",
        "sources": [r["source"] for r in results],
        "provider": "mock",
    }


SUMMARY_SYSTEM = """Tum ek study assistant ho. Transcript ko structured study notes me convert karo. Exactly in sections me plain text do:
SUMMARY: 2-3 line gist.
KEY POINTS:
- point
- point
ACTION ITEMS:
- action
Concise aur exam revision ke liye useful rakho."""


@app.post("/summarize")
async def summarize(req: SummarizeRequest) -> dict[str, Any]:
    if configured_provider() == "mock":
        raise HTTPException(status_code=503, detail="AI provider configure nahi hai")

    prompt = f"{SUMMARY_SYSTEM}\n\nTranscript:\n{req.transcript}"
    raw = await generate_text(prompt)

    summary = re.search(r"SUMMARY:\s*(.*?)(?=KEY POINTS:|$)", raw, re.DOTALL | re.IGNORECASE)
    key_pts = re.search(r"KEY POINTS:\s*(.*?)(?=ACTION ITEMS:|$)", raw, re.DOTALL | re.IGNORECASE)
    act_pts = re.search(r"ACTION ITEMS:\s*(.*)$", raw, re.DOTALL | re.IGNORECASE)

    def bullets(block: str | None) -> list[str]:
        if not block:
            return []
        items = [b.strip().lstrip("-•*").strip() for b in block.splitlines()]
        return [i for i in items if i][:12]

    return {
        "summary": summary.group(1).strip() if summary else raw.strip(),
        "key_points": bullets(key_pts.group(1) if key_pts else None),
        "action_items": bullets(act_pts.group(1) if act_pts else None),
    }


MATCH_SYSTEM = """Tum placement cell ke AI advisor ho. Student ke skills ko job requirements se match karo. Output exactly:
MATCH_PERCENT: <0-100>
STRENGTHS: comma separated list
GAPS: comma separated list
ADVICE: 2 line recommendation
Numbers ke alawa koi aur formatting nahi."""


@app.post("/match")
async def match(req: MatchRequest) -> dict[str, Any]:
    req_skills = {s.strip().lower() for s in req.job_skills if s.strip()}
    prof_skills = {s.strip().lower() for s in req.profile_skills if s.strip()}

    if req_skills and prof_skills:
        overlap = req_skills & prof_skills
        percent = round(len(overlap) / len(req_skills) * 100)
        strengths = sorted(overlap)
        gaps = sorted(req_skills - prof_skills)
    else:
        percent = 0
        strengths = []
        gaps = list(req_skills)

    result = {
        "match_percent": percent,
        "strengths": strengths,
        "gaps": gaps[:10],
        "advice": "Career cell se baat karke in skills par focus karo - LinkedIn Learning ya campus workshops se gaps cover karo.",
    }

    if configured_provider() != "mock":
        prompt = (
            f"{MATCH_SYSTEM}\n\nJob role: {req.job_role}\nRequired skills: {', '.join(req.job_skills)}\n"
            f"Student skills: {', '.join(req.profile_skills)}\nRequirements: {req.job_requirements}\nStudent extra: {req.profile_extra}"
        )
        try:
            raw = await generate_text(prompt)
            m = re.search(r"MATCH_PERCENT:\s*(\d+)", raw, re.IGNORECASE)
            if m:
                result["match_percent"] = min(100, int(m.group(1)))
        except Exception:
            pass

    return result


def _text_tokens(text: str) -> set[str]:
    tokens = set(re.findall(r"[a-z0-9]+", text.lower()))
    for url in re.findall(r"https?://[^\s|]+", text.lower()):
        tokens.add(url)
    return tokens


def _text_similarity(a: str, b: str) -> int:
    ta, tb = _text_tokens(a), _text_tokens(b)
    if not ta or not tb:
        return 0
    if ta == tb:
        return 100
    overlap = len(ta & tb)
    return round(overlap / min(len(ta), len(tb)) * 100)


@app.post("/plagiarism")
async def plagiarism(req: PlagiarismRequest) -> dict[str, Any]:
    pairs = []
    for i in range(len(req.texts)):
        for j in range(i + 1, len(req.texts)):
            sim = _text_similarity(req.texts[i].text, req.texts[j].text)
            if sim >= 40:
                pairs.append({"a": req.texts[i].id, "b": req.texts[j].id, "similarity": sim, "reason": "text"})
    pairs.sort(key=lambda p: p["similarity"], reverse=True)
    return {"pairs": pairs}


@app.post("/face/enroll")
async def face_enroll_endpoint(req: FaceEnrollRequest) -> dict[str, Any]:
    if not face_available():
        raise HTTPException(status_code=503, detail="uniface install nahi hai - pip install 'uniface[cpu]'")
    try:
        return face_enroll(req.user_id, req.image)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/face/recognize")
async def face_recognize_endpoint(req: FaceRecognizeRequest) -> dict[str, Any]:
    if not face_available():
        raise HTTPException(status_code=503, detail="uniface install nahi hai - pip install 'uniface[cpu]'")
    try:
        return face_recognize(req.image)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/sentiment")
async def sentiment(req: SentimentRequest) -> dict[str, Any]:
    positive = ["great", "good", "nice", "best", "love", "helpful", "clean", "fast", "awesome", "excellent", "achha", "accha", "badhiya", "mast", "awesome"]
    negative = ["bad", "poor", "slow", "worst", "hate", "useless", "dirty", "broken", "kharab", "buri", "bura", "ghatiya", "slow", "lag"]
    neg_words = ["not", "nahi", "never", "kabhi", "bila", "un"]
    lowered = req.text.lower()
    pos_count = sum(1 for w in positive if w in lowered)
    neg_count = sum(1 for w in negative if w in lowered)
    for w in neg_words:
        if w in lowered:
            pos_count, neg_count = neg_count, pos_count
            break
    if pos_count == neg_count:
        label, score = "neutral", 0.5
    else:
        label = "positive" if pos_count > neg_count else "negative"
        score = round(pos_count / max(1, pos_count + neg_count), 2)
    return {"sentiment": label, "score": score, "text": req.text[:200]}
