/**
 * ChatInsight — API Client
 * Communicates with the FastAPI backend for text summarization.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

/**
 * Summarize a piece of text using the T5 model.
 *
 * @param {string} text         – The text to summarize
 * @param {number} [maxLength]  – Maximum summary length in tokens (30–500)
 * @returns {Promise<{
 *   summary: string,
 *   word_count_original: number,
 *   word_count_summary: number,
 *   reduction_percent: number,
 *   elapsed_ms: number
 * }>}
 */
export async function summarizeText(text, maxLength = 150) {
  const response = await fetch(`${API_BASE}/api/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, max_length: maxLength }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error (${response.status})`);
  }

  return response.json();
}

/**
 * Check if the backend API is healthy.
 * @returns {Promise<{ status: string, model_loaded: boolean, device: string }>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/api/health`);

  if (!response.ok) {
    throw new Error("Backend unreachable");
  }

  return response.json();
}
