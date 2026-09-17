# NeuroX Step 7 — Local AI Engine

Step 7 is an independent FastAPI service for local classification, embeddings, and similarity. Backend integration is intentionally deferred to Step 8.

```text
Problem title + description
          ↓
      BERT-Tiny
          ↓
category + probability
          ↓
MiniLM all-MiniLM-L6-v2
          ↓
      384D vector
          ↓
 cosine similarity
          ↓
duplicate / related / different
```

The current repository had no trained NeuroX BERT classifier artifact. The local engine uses BERT-Tiny representations against the existing ten category descriptions. This is a functional local baseline, not a measured trained-classifier benchmark.

Similarity thresholds are `0.88` for duplicate and `0.75` for related. API endpoints are `/health`, `/classify`, `/embed`, `/similar`, and `/analysis`.

No Node/Express calls or hosted AI services are used in Step 7.
