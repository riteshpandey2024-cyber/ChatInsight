/**
 * History — Left sidebar showing past summaries as styled cards.
 */
export default function History({ items, onSelect, onDelete }) {
  return (
    <aside className="history-sidebar">
      {/* Header */}
      <div className="history-sidebar__header">
        <span className="history-sidebar__title">History</span>
        {items.length > 0 && (
          <span className="history-sidebar__count">{items.length}</span>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="history-sidebar__empty">
          <span className="history-sidebar__empty-icon">🕐</span>
          <p>No summaries yet.</p>
          <p style={{ marginTop: 4, fontSize: "0.75rem" }}>
            Your history will appear here.
          </p>
        </div>
      ) : (
        <div className="history-sidebar__list">
          {items.map((item) => (
            <div
              key={item.id}
              className="history-item"
              onClick={() => onSelect(item)}
            >
              <div className="history-item__preview">
                {item.inputPreview}
              </div>
              <div className="history-item__meta">
                <span className="history-item__time">{item.time}</span>
                <span className="history-item__reduction">
                  −{item.reduction}%
                </span>
                <button
                  className="history-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
