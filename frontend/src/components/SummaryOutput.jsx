import { useState } from "react";

/**
 * SummaryOutput — displays ONLY the summary card (no stats).
 * Stats are rendered separately in App.jsx for layout control.
 */
export default function SummaryOutput({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="output-section">
      {/* Summary Card */}
      <div className="output-card glass-card">
        <div className="output-card__header">
          <div className="output-card__title">
            <span className="output-card__title-dot" />
            Summary
          </div>

          <div className="output-card__actions">
            {copied ? (
              <span className="copied-badge">✓ Copied</span>
            ) : (
              <button
                className="btn--icon"
                onClick={handleCopy}
                title="Copy to clipboard"
                id="copy-summary-btn"
              >
                📋
              </button>
            )}
          </div>
        </div>

        <div className="output-card__text" tabIndex={0}>{result.summary}</div>

        <div
          style={{
            textAlign: "right",
            marginTop: 10,
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          Generated in {result.elapsed_ms}ms
        </div>
      </div>
    </div>
  );
}
