from __future__ import annotations

from typing import Any
import numpy as np

DUPLICATE_THRESHOLD = 0.88
RELATED_THRESHOLD = 0.75
EMBEDDING_DIMENSIONS = 384

def relationship_for(score: float) -> str:
    if score >= DUPLICATE_THRESHOLD: return "duplicate"
    if score >= RELATED_THRESHOLD: return "related"
    return "different"

def _vector(values: list[float]) -> np.ndarray:
    vector = np.asarray(values, dtype=np.float32)
    if vector.ndim != 1 or vector.size != EMBEDDING_DIMENSIONS: raise ValueError(f"embedding must contain exactly {EMBEDDING_DIMENSIONS} values")
    if not np.isfinite(vector).all(): raise ValueError("embedding values must be finite")
    norm = np.linalg.norm(vector)
    if norm == 0: raise ValueError("embedding must not be the zero vector")
    return vector / norm

def find_similar_problems(problem_embedding: list[float], existing_embeddings: list[dict[str, Any]]) -> dict[str, Any]:
    source = _vector(problem_embedding)
    matches = []
    for item in existing_embeddings:
        if not isinstance(item.get("problemId"), str) or not isinstance(item.get("embedding"), list): raise ValueError("each existing embedding requires problemId and embedding")
        score = float(np.dot(source, _vector(item["embedding"])))
        matches.append({"problemId": item["problemId"], "similarity": score, "relationship": relationship_for(score)})
    matches.sort(key=lambda item: item["similarity"], reverse=True)
    return {"matches": matches}
