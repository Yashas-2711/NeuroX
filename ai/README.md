# NeuroX Local AI Engine

Step 7 provides standalone local inference. It is not connected to the Node backend yet.

## Pipeline

```text
Problem text → BERT-Tiny category prototype classification
             → MiniLM all-MiniLM-L6-v2 384D embedding
             → cosine similarity
             → duplicate / related / different relationship
```

The cached models are loaded locally: `prajjwal1/bert-tiny` and `all-MiniLM-L6-v2`.

The repository did not contain a fine-tuned NeuroX classifier artifact or training dataset. BERT-Tiny therefore uses local category-description prototypes and returns the resulting softmax probability; no accuracy is claimed. A future training phase can replace the prototype vectors without changing the API.

## Start locally

```powershell
Set-Location ai
& .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Inference is offline-only and requires the approved model artifacts in the local Hugging Face cache.

## Endpoints

- `GET /health`
- `POST /classify` — `{ "text": "..." }`
- `POST /embed` — `{ "text": "..." }`
- `POST /similar` — embedding plus existing embeddings
- `POST /analysis` — title, description, and optional existing embeddings

`/api/...` aliases are also available. Similarity thresholds are `0.88` for duplicate and `0.75` for related.

## Tests

```powershell
& .\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

## Seed MongoDB test records

The optional Step 7 seed utility reuses an existing CITIZEN and inserts five clearly marked `[AI TEST]` problems with real local classifications and 384D embeddings. It defaults to the `test` database and does not call the Node backend:

```powershell
& .\.venv\Scripts\python.exe scripts\seed_ai_problems.py
```

Do not use this seed utility as production data migration.

Models are loaded at FastAPI startup and reused. No external AI inference API is called.
