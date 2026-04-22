import os
import re
import time
from collections import Counter

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field



app = FastAPI(title="ChatInsight API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Input text to summarize")
    max_length: int = Field(150, ge=30, le=500, description="Maximum summary token length")


class SummarizeResponse(BaseModel):
    summary: str
    word_count_original: int
    word_count_summary: int
    reduction_percent: float
    elapsed_ms: int

    


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def count_words(text: str) -> int:
    return len(text.split()) if text.strip() else 0


def extractive_summary(text: str, max_sentences: int = 3) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]

    if not sentences:
        return text.strip()

    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    words = re.findall(r"\b\w+\b", text.lower())
    stop_words = {
        "a", "an", "the", "and", "or", "but", "if", "then", "than", "so", "to", "of", "in", "on", "for",
        "with", "at", "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
        "be", "been", "being", "it", "this", "that", "these", "those", "i", "you", "he", "she", "we",
        "they", "me", "my", "your", "our", "their", "as", "do", "does", "did", "not", "no", "yes",
    }
    frequencies = Counter(word for word in words if word not in stop_words and len(word) > 2)

    if not frequencies:
        return " ".join(sentences[:max_sentences])

    scored_sentences = []
    for index, sentence in enumerate(sentences):
        sentence_words = re.findall(r"\b\w+\b", sentence.lower())
        score = sum(frequencies[word] for word in sentence_words)
        scored_sentences.append((score, index, sentence))

    top_sentences = sorted(scored_sentences, key=lambda item: (-item[0], item[1]))[:max_sentences]
    top_sentences = sorted(top_sentences, key=lambda item: item[1])
    return " ".join(sentence for _, _, sentence in top_sentences)


def load_model() -> None:
    return


@app.on_event("startup")
def on_startup() -> None:
    load_model()


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_loaded": True,
        "device": "remote-inference",
        "model_source": os.getenv("HF_MODEL", "facebook/bart-large-cnn"),
    }


@app.post("/api/summarize", response_model=SummarizeResponse)
def summarize(payload: SummarizeRequest) -> SummarizeResponse:
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")

    try:
        start = time.perf_counter()
        cleaned = clean_text(payload.text)
        model_name = os.getenv("HF_MODEL", "facebook/bart-large-cnn")
        hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
        api_url = f"https://api-inference.huggingface.co/models/{model_name}"

        headers = {"Content-Type": "application/json"}
        if hf_token:
            headers["Authorization"] = f"Bearer {hf_token}"

        prompt = cleaned[:4000]
        payload_data = {
            "inputs": prompt,
            "parameters": {
                "max_length": payload.max_length,
                "min_length": max(30, min(payload.max_length // 2, payload.max_length - 10)),
                "do_sample": False,
            },
            "options": {"wait_for_model": True},
        }

        summary = ""
        try:
            hf_timeout = float(os.getenv("HF_TIMEOUT_SECONDS", "45"))
            with httpx.Client(timeout=hf_timeout) as client:
                response = client.post(api_url, headers=headers, json=payload_data)

            if response.status_code < 400:
                result = response.json()
                if isinstance(result, list) and result:
                    summary = result[0].get("summary_text") or result[0].get("generated_text") or ""
                elif isinstance(result, dict):
                    summary = result.get("summary_text") or result.get("generated_text") or ""
        except httpx.HTTPError:
            summary = ""

        if not summary:
            summary = extractive_summary(cleaned, max_sentences=3)

        original_words = count_words(payload.text)
        summary_words = count_words(summary)
        reduction = 0.0
        if original_words > 0:
            reduction = round((1 - (summary_words / original_words)) * 100, 2)

        elapsed_ms = int((time.perf_counter() - start) * 1000)

        return SummarizeResponse(
            summary=summary,
            word_count_original=original_words,
            word_count_summary=summary_words,
            reduction_percent=reduction,
            elapsed_ms=elapsed_ms,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {exc}") from exc


@app.get("/")
def root() -> dict:
    return {"message": "ChatInsight backend is running"}
