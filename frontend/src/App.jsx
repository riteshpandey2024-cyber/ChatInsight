import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import TextInput from "./components/TextInput";
import SummaryOutput from "./components/SummaryOutput";
import History from "./components/History";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { summarizeText } from "./api";

const STORAGE_KEY = "chatinsight_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function App() {
  const [text, setText] = useState("");
  const [maxLength, setMaxLength] = useState(150);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Persist history
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Auto-dismiss errors
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const handleSummarize = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await summarizeText(text, maxLength);
      setResult(data);

      // Add to history
      const entry = {
        id: Date.now(),
        inputPreview: text.slice(0, 120) + (text.length > 120 ? "…" : ""),
        inputFull: text,
        summary: data.summary,
        reduction: data.reduction_percent,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [text, maxLength]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const handleHistorySelect = (item) => {
    setText(item.inputFull);
    setResult({
      summary: item.summary,
      word_count_original: item.inputFull.split(/\s+/).length,
      word_count_summary: item.summary.split(/\s+/).length,
      reduction_percent: item.reduction,
      elapsed_ms: 0,
    });
    setHistoryOpen(false);
  };

  const handleHistoryDelete = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSummarize();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSummarize]);

  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="app-layout">
        {/* History Sidebar — Left */}
        <History
          items={history}
          onSelect={handleHistorySelect}
          onDelete={handleHistoryDelete}
          isOpen={historyOpen}
        />

        <div className="main-content">
          <Header />

          <div className="main-grid">
            {/* Top-Left: Input Box */}
            <div className="grid-cell">
              <TextInput value={text} onChange={setText} />
            </div>

            {/* Top-Right: Output Box */}
            <div className="grid-cell">
              {/* Loading State */}
              {loading && (
                <div className="output-section">
                  <div className="output-card glass-card">
                    <div className="output-card__header">
                      <div className="output-card__title">
                        <span className="output-card__title-dot" style={{ background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
                        Generating…
                      </div>
                    </div>
                    <div className="loading-shimmer" />
                    <div className="loading-shimmer" style={{ marginTop: 12, height: 40 }} />
                  </div>
                </div>
              )}

              {/* Summary Result */}
              <SummaryOutput result={result} />

              {/* Empty Placeholder */}
              {!result && !loading && (
                <div className="output-section">
                  <div className="output-card glass-card">
                    <div className="output-card__header">
                      <div className="output-card__title">
                        <span className="output-card__title-dot" style={{ background: 'var(--text-muted)', boxShadow: 'none' }} />
                        Output Text
                      </div>
                    </div>
                    <div className="output-card__text output-card__text--empty" tabIndex={0}>
                      Your summary will appear here…
                    </div>
                  </div>
                </div>
              )}

              {/* Error Toast */}
              {error && <div className="toast toast--error" style={{ position: 'static', marginTop: '16px' }}>⚠️ {error}</div>}
            </div>

            {/* Bottom-Left: Controls */}
            <div className="grid-cell">
              <div className="controls-card glass-card" tabIndex={0}>
                <div className="controls__slider-group">
                  <span className="controls__slider-label">Summary length</span>
                  <input
                    id="max-length-slider"
                    type="range"
                    className="controls__slider"
                    min={30}
                    max={300}
                    value={maxLength}
                    onChange={(e) => setMaxLength(Number(e.target.value))}
                  />
                  <span className="controls__slider-value">{maxLength}</span>
                </div>

                <div className="controls__buttons">
                  <button
                    id="clear-btn"
                    className="btn btn--ghost"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Clear
                  </button>

                  <button
                    id="summarize-btn"
                    className="btn btn--primary"
                    onClick={handleSummarize}
                    disabled={loading || !text.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Summarizing…
                      </>
                    ) : (
                      <>⚡ Summarize</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom-Right: Stats */}
            <div className="grid-cell">
              {result ? (
                <div className="stats-bar">
                  <div className="stat" tabIndex={0}>
                    <div className="stat__value">{result.word_count_original}</div>
                    <div className="stat__label">Original Words</div>
                  </div>
                  <div className="stat" tabIndex={0}>
                    <div className="stat__value">{result.word_count_summary}</div>
                    <div className="stat__label">Summary Words</div>
                  </div>
                  <div className="stat" tabIndex={0}>
                    <div className="stat__value">{result.reduction_percent}%</div>
                    <div className="stat__label">Reduced</div>
                  </div>
                </div>
              ) : (
                <div className="stats-bar stats-bar--empty">
                  <div className="stat" tabIndex={0}>
                    <div className="stat__value">—</div>
                    <div className="stat__label">Original Words</div>
                  </div>
                  <div className="stat" tabIndex={0}>
                    <div className="stat__value">—</div>
                    <div className="stat__label">Summary Words</div>
                  </div>
                  <div className="stat" tabIndex={0}>
                    <div className="stat__value">—</div>
                    <div className="stat__label">Reduced</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>

        {/* Mobile toggle */}
        <button
          className="mobile-history-toggle"
          onClick={() => setHistoryOpen((v) => !v)}
          aria-label="Toggle history"
        >
          {historyOpen ? "✕" : "📚"}
        </button>
      </div>
    </div>
  );
}
