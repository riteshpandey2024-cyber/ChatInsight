import { useMemo } from "react";

/**
 * TextInput — Rich textarea with live word/char count.
 */
export default function TextInput({ value, onChange }) {
  const stats = useMemo(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const chars = value.length;
    return { words, chars };
  }, [value]);

  return (
    <div className="input-section">
      <div className="input-card glass-card">
        <div className="input-card__label">
          <span className="input-card__label-text">Input Text</span>
          <span className="input-card__counter">
            {stats.words} words · {stats.chars} chars
          </span>
        </div>

        <textarea
          id="text-input"
          className="input-card__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your long paragraph or dialogue here…&#10;&#10;Example:&#10;Ritesh: Hey Nancy, have you seen the latest tech reviews?&#10;Nancy: Yes! The camera quality is getting ridiculously good…"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
