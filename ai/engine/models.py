from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from transformers import BertConfig, BertModel, BertTokenizer

CATEGORIES = ("education", "health", "agriculture", "water_resources", "sanitation", "environment", "livelihoods", "accessibility", "infrastructure", "public_services")
CATEGORY_DESCRIPTIONS = {
    "education": "schools, students, teachers, learning, literacy, digital education, and access to education",
    "health": "hospitals, clinics, healthcare, illness, medicine, and public health",
    "agriculture": "farmers, crops, livestock, irrigation for farming, seeds, soil, and harvests",
    "water_resources": "drinking water, water supply, irrigation water, wells, rivers, drought, and water access",
    "sanitation": "toilets, sewage, waste disposal, drainage, hygiene, and sanitation services",
    "environment": "pollution, climate, forests, biodiversity, air quality, conservation, and environmental damage",
    "livelihoods": "jobs, income, employment, small businesses, skills, poverty, and economic opportunity",
    "accessibility": "disability access, ramps, assistive services, inclusive design, and accessibility barriers",
    "infrastructure": "roads, bridges, electricity, buildings, transport, public construction, and physical infrastructure",
    "public_services": "government services, civic administration, public offices, documents, safety, and municipal services",
}

@dataclass
class ModelState:
    classifier_loaded: bool = False
    embedding_loaded: bool = False

class LocalAIEngine:
    def __init__(self) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.bert_tokenizer: Any = None
        self.bert_model: Any = None
        self.embedding_model: SentenceTransformer | None = None
        self.category_vectors: np.ndarray | None = None
        self.state = ModelState()

    def load(self) -> None:
        # The cached bert-tiny artifact contains vocab.txt but no tokenizer.json.
        # Use the compatible slow WordPiece tokenizer instead of downloading extras.
        self.bert_tokenizer = BertTokenizer.from_pretrained("prajjwal1/bert-tiny", local_files_only=True)
        # This cached bert-tiny config predates the `model_type` field used by
        # newer Transformers releases, so construct the matching BERT config.
        bert_config = BertConfig(
            vocab_size=30522,
            hidden_size=128,
            num_hidden_layers=2,
            num_attention_heads=2,
            intermediate_size=512,
            hidden_act="gelu",
            hidden_dropout_prob=0.1,
            attention_probs_dropout_prob=0.1,
            max_position_embeddings=512,
            type_vocab_size=2,
            initializer_range=0.02,
        )
        self.bert_model = BertModel.from_pretrained("prajjwal1/bert-tiny", config=bert_config, local_files_only=True).to(self.device)
        self.bert_model.eval()
        self.category_vectors = self._bert_vectors([CATEGORY_DESCRIPTIONS[c] for c in CATEGORIES])
        self.state.classifier_loaded = True
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device=str(self.device), local_files_only=True)
        self.state.embedding_loaded = True
        dimension = self.embedding_model.get_embedding_dimension() if hasattr(self.embedding_model, "get_embedding_dimension") else self.embedding_model.get_sentence_embedding_dimension()
        if dimension != 384:
            raise RuntimeError("all-MiniLM-L6-v2 must produce 384-dimensional embeddings")

    @staticmethod
    def _validate_text(text: str) -> str:
        if not isinstance(text, str) or not text.strip():
            raise ValueError("text must be a non-empty string")
        return text.strip()

    def _bert_vectors(self, texts: list[str]) -> np.ndarray:
        if self.bert_tokenizer is None or self.bert_model is None:
            raise RuntimeError("BERT-Tiny is not loaded")
        tokens = self.bert_tokenizer(texts, padding=True, truncation=True, max_length=256, return_tensors="pt").to(self.device)
        with torch.inference_mode():
            output = self.bert_model(**tokens).last_hidden_state[:, 0, :]
        vectors = output.detach().cpu().numpy().astype(np.float32)
        return vectors / np.clip(np.linalg.norm(vectors, axis=1, keepdims=True), 1e-12, None)

    def classify(self, text: str) -> dict[str, Any]:
        clean_text = self._validate_text(text)
        if self.category_vectors is None:
            raise RuntimeError("BERT-Tiny classifier is not loaded")
        scores = self.category_vectors @ self._bert_vectors([clean_text])[0]
        probabilities = np.exp((scores - scores.max()) * 8.0)
        probabilities /= probabilities.sum()
        order = np.argsort(probabilities)[::-1]
        return {"category": CATEGORIES[int(order[0])], "confidence": float(probabilities[order[0]]), "top_predictions": [{"category": CATEGORIES[int(i)], "confidence": float(probabilities[i])} for i in order[:3]]}

    def embed(self, text: str) -> list[float]:
        clean_text = self._validate_text(text)
        if self.embedding_model is None:
            raise RuntimeError("MiniLM is not loaded")
        vector = self.embedding_model.encode(clean_text, normalize_embeddings=True, convert_to_numpy=True)
        return vector.astype(np.float32).tolist()

engine = LocalAIEngine()
