import math
import re
from typing import Any

import numpy as np

from .knowledge_base import IIT_BOMBAY_KNOWLEDGE

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "is", "are",
    "was", "were", "be", "been", "being", "for", "with", "from", "as", "by", "that",
    "this", "it", "its", "these", "those", "me", "my", "i", "you", "your", "he", "she",
    "we", "our", "they", "their", "not", "no", "so", "do", "does", "did", "ha", "hai",
    "hain", "me", "ka", "ki", "ke", "ko", "se", "pe", "par", "aur", "bhi", "the",
    "tum", "aap", "main", "kya", "kaise", "kab", "kyun", "kahan", "hoti", "hota", "hote",
    "ja", "jata", "jati", "jate", "kar", "karta", "karti", "karte", "batao", "bata",
    "about", "what", "when", "where", "how", "why", "which", "who", "whom", "will",
    "can", "could", "would", "should", "has", "have", "had", "please", "plz", "ji",
    "hello", "hi", "hey", "are", "there", "than", "then", "them", "also", "etc",
}


def _tokenize(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return [t for t in text.split() if t not in STOPWORDS and len(t) > 1]


class RAG:
    def __init__(self, chunks: list[dict[str, str]] | None = None):
        self.chunks = chunks or IIT_BOMBAY_KNOWLEDGE
        self.doc_tokens = [_tokenize(c["text"]) for c in self.chunks]
        self.vocab = sorted({t for toks in self.doc_tokens for t in toks})
        self.vocab_index = {t: i for i, t in enumerate(self.vocab)}
        self.idf = self._build_idf()
        self.matrix = self._build_matrix()

    def _build_idf(self) -> np.ndarray:
        n = len(self.doc_tokens)
        df = np.zeros(len(self.vocab))
        for toks in self.doc_tokens:
            for t in set(toks):
                idx = self.vocab_index.get(t)
                if idx is not None:
                    df[idx] += 1
        return np.log((n + 1) / (df + 1)) + 1

    def _build_matrix(self) -> np.ndarray:
        rows = []
        for toks in self.doc_tokens:
            vec = np.zeros(len(self.vocab))
            counts: dict[int, int] = {}
            for t in toks:
                idx = self.vocab_index.get(t)
                if idx is not None:
                    counts[idx] = counts.get(idx, 0) + 1
            for idx, c in counts.items():
                vec[idx] = (1 + math.log(c)) * self.idf[idx]
            rows.append(vec)
        matrix = np.array(rows) if rows else np.zeros((0, len(self.vocab)))
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1
        return matrix / norms

    def _query_vec(self, text: str) -> np.ndarray:
        vec = np.zeros(len(self.vocab))
        for t in _tokenize(text):
            idx = self.vocab_index.get(t)
            if idx is not None:
                vec[idx] += self.idf[idx]
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def retrieve(self, query: str, top_k: int = 4, threshold: float = 0.0) -> list[dict[str, Any]]:
        qv = self._query_vec(query)
        scores = self.matrix @ qv
        ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in ranked:
            if score <= threshold:
                continue
            results.append(
                {
                    "text": self.chunks[idx]["text"],
                    "source": self.chunks[idx]["source"],
                    "score": round(float(score), 4),
                }
            )
            if len(results) >= top_k:
                break
        return results


rag = RAG()
