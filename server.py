import os
import re
import time
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import T5ForConditionalGeneration, T5Tokenizer


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


model: Optional[T5ForConditionalGeneration] = None
tokenizer: Optional[T5Tokenizer] = None
device: Optional[torch.device] = None
model_source: str = ""


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def count_words(text: str) -> int:
    return len(text.split()) if text.strip() else 0


def load_model() -> None:
    global model, tokenizer, device, model_source

    if model is not None and tokenizer is not None and device is not None:
        return

    model_path = "./saved_summary_model"
    has_weights = os.path.exists(os.path.join(model_path, "model.safetensors")) or os.path.exists(
        os.path.join(model_path, "pytorch_model.bin")
    )

    if has_weights:
        tokenizer = T5Tokenizer.from_pretrained(model_path)
        model = T5ForConditionalGeneration.from_pretrained(model_path)
        model_source = "local"
    else:
        tokenizer = T5Tokenizer.from_pretrained("t5-small")
        model = T5ForConditionalGeneration.from_pretrained("t5-small")
        model_source = "huggingface:t5-small"

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()


@app.on_event("startup")
def on_startup() -> None:
    load_model()


@app.get("/api/health")
def health() -> dict:
    try:
        load_model()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model load failed: {exc}") from exc

    return {
        "status": "ok",
        "model_loaded": model is not None and tokenizer is not None,
        "device": str(device),
        "model_source": model_source,
    }


@app.post("/api/summarize", response_model=SummarizeResponse)
def summarize(payload: SummarizeRequest) -> SummarizeResponse:
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty")

    try:
        load_model()

        start = time.perf_counter()
        cleaned = clean_text(payload.text)

        inputs = tokenizer(
            cleaned,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=512,
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}

        outputs = model.generate(
            inputs["input_ids"],
            max_length=payload.max_length,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=2,
        )

        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)

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
