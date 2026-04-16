# ChatInsight — AI Text Summarizer

A full-stack web application that converts long paragraphs and dialogues into concise summaries using a fine-tuned **T5 Transformer** model.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React (Vite) + Vanilla CSS         |
| Backend   | Python, FastAPI, Uvicorn            |
| AI Model  | T5-small (Hugging Face Transformers)|
| Runtime   | PyTorch (CPU / CUDA)                |

---

## Prerequisites

Make sure you have the following installed on your machine:

- **Python 3.8+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

To verify, run:

```bash
python3 --version
node --version
npm --version
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/riteshpandey2024-cyber/ChatInsight.git
cd ChatInsight
```

### 2. Set Up the Backend (Python + FastAPI)

**Create a virtual environment and install dependencies:**

```bash
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

pip install --upgrade pip
pip install -r requirements.txt
```

**Start the backend server:**

```bash
source .venv/bin/activate        # activate venv if not already active
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

You should see output like:

```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

> **Note:** If you don't have the trained model weights in `saved_summary_model/`, the server will automatically download and use the base `t5-small` model from Hugging Face Hub.

### 3. Set Up the Frontend (React + Vite)

**Open a new terminal** (keep the backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

You should see:

```
VITE ready in ~700ms
➜  Local:   http://localhost:5173/
```

### 4. Open the App

Open your browser and go to:

**➜  [http://localhost:5173](http://localhost:5173)**

---

## Quick Reference — Running the App

You need **two terminals** running simultaneously:

| Terminal | Command                                                        | URL                    |
|----------|----------------------------------------------------------------|------------------------|
| 1 (Backend)  | `source .venv/bin/activate && python -m uvicorn server:app --port 8000` | http://localhost:8000  |
| 2 (Frontend) | `cd frontend && npm run dev`                                   | http://localhost:5173  |

> **Important:** Always start the backend first. The frontend calls the API at `localhost:8000`. If the backend is not running, you'll see "API Offline" in the navbar and get connection errors.

---

## Project Structure

```
ChatInsight/
├── server.py                  # FastAPI backend (API endpoints)
├── app.py                     # Original Streamlit app (legacy)
├── summary.py                 # Model training script (Colab)
├── requirements.txt           # Python dependencies
├── config.json                # T5 model configuration
├── generation_config.json     # Generation parameters
├── saved_summary_model/       # Saved model + tokenizer files
│   ├── config.json
│   ├── tokenizer.json
│   └── tokenizer_config.json
├── frontend/                  # React frontend (Vite)
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx           # Entry point
│       ├── App.jsx            # Main app component
│       ├── api.js             # API client (fetch wrapper)
│       ├── index.css          # Design system (all styles)
│       └── components/
│           ├── Navbar.jsx     # Top navigation bar
│           ├── Header.jsx     # Title + subtitle
│           ├── TextInput.jsx  # Text input area
│           ├── SummaryOutput.jsx  # Summary result + stats
│           ├── History.jsx    # Sidebar with past summaries
│           └── Footer.jsx     # Bottom footer
└── .gitignore
```

---

## Features

- **AI-Powered Summarization** — Paste any long text and get a concise summary
- **Adjustable Summary Length** — Slider to control the max output length (30–300 tokens)
- **Live Stats** — See original word count, summary word count, and reduction percentage
- **Summary History** — Past summaries saved in the browser (localStorage)
- **Copy to Clipboard** — One-click copy of the generated summary
- **API Health Indicator** — Live green/red dot in the navbar showing backend status
- **Keyboard Shortcut** — Press `Ctrl + Enter` (or `Cmd + Enter` on Mac) to summarize
- **Responsive Design** — Works on desktop and mobile
- **Dark Mode UI** — Premium glassmorphism design

---

## API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/health`     | Server + model status    |
| POST   | `/api/summarize`  | Summarize input text     |

**Example — Summarize text:**

```bash
curl -X POST http://localhost:8000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Your long text here...", "max_length": 150}'
```

**Response:**

```json
{
  "summary": "Concise summary of the text.",
  "word_count_original": 89,
  "word_count_summary": 36,
  "reduction_percent": 59.6,
  "elapsed_ms": 2200.5
}
```

---

## Troubleshooting

| Problem                              | Solution                                                |
|--------------------------------------|---------------------------------------------------------|
| `ERR_CONNECTION_REFUSED` on port 8000 | Backend is not running. Start it with `python -m uvicorn server:app --port 8000` |
| `address already in use` on port 8000 | Kill the old process: `lsof -ti:8000 \| xargs kill -9`  |
| `command not found: npx`             | Add Node to PATH: `export PATH="/usr/local/bin:$PATH"`  |
| Model download is slow               | First run downloads ~240MB T5 model; subsequent runs use cache |
| Frontend shows "API Offline"         | Make sure backend terminal is running and healthy        |

---

## Developer

**Ritesh Pandey**

- GitHub: [riteshpandey2024-cyber](https://github.com/riteshpandey2024-cyber)

---

## License

This project is for educational purposes.
