from pydantic import BaseModel, Field

class TextRequest(BaseModel):
    text: str = Field(min_length=1)

class SimilarityItem(BaseModel):
    problemId: str = Field(min_length=1)
    embedding: list[float]

class SimilarityRequest(BaseModel):
    embedding: list[float]
    existing_embeddings: list[SimilarityItem] = []

class AnalysisRequest(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    existing_embeddings: list[SimilarityItem] = []

class DNARequest(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1)
    priority: str = Field(min_length=1)
    location: dict[str, str | None] = {}
