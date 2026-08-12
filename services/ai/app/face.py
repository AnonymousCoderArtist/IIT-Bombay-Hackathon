import base64
import json
import os
import threading

import numpy as np

try:
    from uniface import FaceAnalyzer

    _AVAILABLE = True
except ImportError:
    FaceAnalyzer = None
    _AVAILABLE = False

_analyzer: FaceAnalyzer | None = None
_analyzer_lock = threading.Lock()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
STORE_PATH = os.path.join(DATA_DIR, "face_store.json")

DEFAULT_THRESHOLD = 0.45


def _get_analyzer() -> FaceAnalyzer:
    global _analyzer
    if not _AVAILABLE:
        raise RuntimeError("uniface install nahi hai - 'pip install uniface[cpu]' karo")
    with _analyzer_lock:
        if _analyzer is None:
            _analyzer = FaceAnalyzer()
        return _analyzer


_store_lock = threading.Lock()


def _load_store() -> dict[str, list[float]]:
    if not os.path.exists(STORE_PATH):
        return {}
    try:
        with open(STORE_PATH) as f:
            return json.load(f)
    except Exception:
        return {}


def _save_store(store: dict[str, list[float]]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp = f"{STORE_PATH}.tmp"
    with open(tmp, "w") as f:
        json.dump(store, f)
    os.replace(tmp, STORE_PATH)


def _decode_image(image: str) -> np.ndarray:
    import cv2

    if image.startswith("data:"):
        image = image.split(",", 1)[-1]
    raw = base64.b64decode(image)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("image decode nahi hui")
    return img


def _embedding(image: np.ndarray) -> np.ndarray | None:
    analyzer = _get_analyzer()
    faces = analyzer.analyze(image)
    if not faces:
        return None

    def area(f) -> float:
        x1, y1, x2, y2 = f.bbox[:4]
        return float(max(0, x2 - x1) * max(0, y2 - y1))

    face = max(faces, key=area)
    if face.embedding is None:
        return None
    emb = np.asarray(face.embedding, dtype=np.float32).reshape(-1)
    norm = float(np.linalg.norm(emb))
    return emb / norm if norm > 0 else emb


def available() -> bool:
    return _AVAILABLE


def enroll(user_id: str, image: str) -> dict:
    emb = _embedding(_decode_image(image))
    if emb is None:
        raise ValueError("chehra detect nahi hua - dobara try karo")

    with _store_lock:
        store = _load_store()
        store[user_id] = emb.tolist()
        _save_store(store)

    return {"enrolled": True, "user_id": user_id, "dim": int(emb.shape[0])}


def recognize(image: str, threshold: float = DEFAULT_THRESHOLD) -> dict:
    emb = _embedding(_decode_image(image))
    if emb is None:
        raise ValueError("chehra detect nahi hua - camera ke samne aao")

    store = _load_store()
    if not store:
        raise ValueError("koi face enrolled nahi hai - pehle profile me face enroll karo")

    scores: list[tuple[str, float]] = []
    for user_id, vec in store.items():
        ref = np.asarray(vec, dtype=np.float32).reshape(-1)
        if ref.shape != emb.shape:
            continue
        cosine = float(np.dot(emb, ref))
        scores.append((user_id, cosine))

    if not scores:
        raise ValueError("store me embeddings format mismatch hai - dobara enroll karo")

    scores.sort(key=lambda s: s[1], reverse=True)
    best_id, best_score = scores[0]
    matches = [{"user_id": uid, "confidence": round(score, 4)} for uid, score in scores[:3]]

    if best_score < threshold:
        return {"matched": False, "user_id": None, "confidence": round(best_score, 4), "matches": matches}

    return {"matched": True, "user_id": best_id, "confidence": round(best_score, 4), "matches": matches}


def count() -> int:
    return len(_load_store())
