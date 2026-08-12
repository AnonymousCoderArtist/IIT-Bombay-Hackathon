import os

import httpx


def _provider() -> str:
    name = os.getenv("AI_PROVIDER", "").lower()
    if name == "gemini" and os.getenv("GEMINI_API_KEY"):
        return "gemini"
    if name == "deepseek" and os.getenv("DEEPSEEK_API_KEY"):
        return "deepseek"
    return "mock"


async def _call_gemini(prompt: str) -> str:
    key = os.getenv("GEMINI_API_KEY", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            url,
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1500},
            },
        )
        res.raise_for_status()
        data = res.json()
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        return (parts[0].get("text", "") if parts else "").strip()


async def _call_deepseek(prompt: str) -> str:
    key = os.getenv("DEEPSEEK_API_KEY", "")
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            "https://api.deepseek.com/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 1500,
            },
        )
        res.raise_for_status()
        data = res.json()
        return (data.get("choices", [{}])[0].get("message", {}).get("content", "") or "").strip()


async def generate_text(prompt: str) -> str:
    provider = _provider()
    if provider == "gemini":
        return await _call_gemini(prompt)
    if provider == "deepseek":
        return await _call_deepseek(prompt)
    raise RuntimeError("No AI provider configured (set AI_PROVIDER + GEMINI_API_KEY/DEEPSEEK_API_KEY)")


def configured_provider() -> str:
    return _provider()
