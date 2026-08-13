import os
from typing import Any

import httpx


def _provider() -> str:
    name = os.getenv("AI_PROVIDER", "").lower()
    if name == "gemini" and os.getenv("GEMINI_API_KEY"):
        return "gemini"
    if name == "deepseek" and os.getenv("DEEPSEEK_API_KEY"):
        return "deepseek"
    if os.getenv("AI_OPENAI_BASE_URL") and os.getenv("AI_OPENAI_API_KEY") and os.getenv("AI_OPENAI_MODEL"):
        return "openai"
    return "mock"


def _call_openai_compat(prompt: str, base_url: str, api_key: str, model: str) -> str:
    res = httpx.post(
        f"{base_url.rstrip('/')}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 1500,
        },
        timeout=60,
    )
    res.raise_for_status()
    data = res.json()
    return (data.get("choices", [{}])[0].get("message", {}).get("content", "") or "").strip()


async def _call_gemini(prompt: str, api_key: str, model: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
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


async def generate_text(prompt: str, ai: dict[str, Any] | None = None) -> str:
    if ai and ai.get("api_key") and ai.get("model"):
        if ai.get("provider") == "gemini":
            return await _call_gemini(prompt, ai["api_key"], ai["model"])
        base_url = ai.get("base_url")
        if base_url:
            return _call_openai_compat(prompt, base_url, ai["api_key"], ai["model"])

    provider = _provider()
    if provider == "gemini":
        return await _call_gemini(prompt, os.environ["GEMINI_API_KEY"], "gemini-2.0-flash")
    if provider == "deepseek":
        return await _call_deepseek(prompt)
    if provider == "openai":
        return _call_openai_compat(
            prompt,
            os.environ["AI_OPENAI_BASE_URL"],
            os.environ["AI_OPENAI_API_KEY"],
            os.environ["AI_OPENAI_MODEL"],
        )
    raise RuntimeError("No AI provider configured (set AI_PROVIDER + key or Settings > AI)")


def configured_provider() -> str:
    return _provider()
