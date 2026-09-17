from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from engine.models import engine
from engine.similarity import find_similar_problems
from schemas import AnalysisRequest, SimilarityRequest, TextRequest

load_dotenv()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    engine.load()
    yield


app = FastAPI(title="NeuroX Local AI Engine API", description="Local BERT-Tiny classification, MiniLM embeddings, and similarity analysis.", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def api_error(error: Exception) -> HTTPException:
    return HTTPException(status_code=400 if isinstance(error, ValueError) else 503, detail=str(error))


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "neurox-ai", "classifier": "loaded" if engine.state.classifier_loaded else "not_loaded", "embedding_model": "loaded" if engine.state.embedding_loaded else "not_loaded"}


@app.post("/classify")
@app.post("/api/classify")
def classify(request: TextRequest):
    try:
        return engine.classify(request.text)
    except (ValueError, RuntimeError) as error:
        raise api_error(error) from error


@app.post("/embed")
@app.post("/api/embed")
def embed(request: TextRequest):
    try:
        vector = engine.embed(request.text)
        return {"dimensions": len(vector), "embedding": vector}
    except (ValueError, RuntimeError) as error:
        raise api_error(error) from error


@app.post("/similar")
@app.post("/api/similar")
def similar(request: SimilarityRequest):
    try:
        return find_similar_problems(request.embedding, [item.model_dump() for item in request.existing_embeddings])
    except ValueError as error:
        raise api_error(error) from error


@app.post("/analysis")
@app.post("/api/analysis")
def analysis(request: AnalysisRequest):
    try:
        text = f"{request.title.strip()}\n{request.description.strip()}"
        classification = engine.classify(text)
        vector = engine.embed(text)
        result = {**classification, "embedding": vector, "embedding_dimensions": len(vector)}
        if request.existing_embeddings:
            result["similarity"] = find_similar_problems(vector, [item.model_dump() for item in request.existing_embeddings])
        return result
    except (ValueError, RuntimeError) as error:
        raise api_error(error) from error

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("AI_PORT", os.getenv("PORT", 8000)))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False)
