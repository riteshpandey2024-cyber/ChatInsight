import streamlit as st
import torch
import re
from transformers import T5Tokenizer, T5ForConditionalGeneration


# Page Config

st.set_page_config(
    page_title="Dialogue Summarization",
    page_icon="📄",
    layout="centered"
)


# Text Cleaning Function

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


# Load Model + Tokenizer

import os

@st.cache_resource
def load_model():
    model_path = "./saved_summary_model"   

    
    has_weights = os.path.exists(os.path.join(model_path, "model.safetensors")) or \
                  os.path.exists(os.path.join(model_path, "pytorch_model.bin"))

    if has_weights:
        
        tokenizer = T5Tokenizer.from_pretrained(model_path)
        model = T5ForConditionalGeneration.from_pretrained(model_path)
    else:
       
        st.warning("⚠️ Local model weights not found. Falling back to the base 't5-small' model. Downloading from Hugging Face (this might take a moment)...")
        tokenizer = T5Tokenizer.from_pretrained("t5-small")
        model = T5ForConditionalGeneration.from_pretrained("t5-small")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    return model, tokenizer, device

model, tokenizer, device = load_model()


# Summarization Function

def summarize_dialogue(dialogue):
    dialogue = clean_text(dialogue)

    inputs = tokenizer(
        dialogue,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=512
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    outputs = model.generate(
        inputs["input_ids"],
        max_length=150,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=2
    )

    summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return summary


# Streamlit UI

st.title("Dialogue Summarization using Fine-Tuned T5")
st.write("Enter a conversation below and generate a concise summary.")

dialogue_input = st.text_area(
    "Enter Dialogue",
    height=250,
    placeholder="Type or paste conversation here..."
)

col1, col2 = st.columns(2)

with col1:
    generate_btn = st.button("Generate Summary")

with col2:
    clear_btn = st.button("Clear")

if clear_btn:
    st.rerun()

if generate_btn:
    if dialogue_input.strip() == "":
        st.warning("⚠️ Please enter a dialogue.")
    else:
        with st.spinner("Generating summary..."):
            summary = summarize_dialogue(dialogue_input)

        st.subheader("Summary")
        st.success(summary)


# Footer

st.markdown("---")
st.caption("Built with 🤖 T5 Transformer + Streamlit")