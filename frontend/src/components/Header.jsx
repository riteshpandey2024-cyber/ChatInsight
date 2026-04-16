/**
 * Header — App title with animated gradient text + model badge.
 */
export default function Header() {
  return (
    <header className="header">
      <h1 className="header__title">ChatInsight</h1>
      {/* <p className="header__subtitle">
        Transform lengthy text into clear, concise summaries — powered by AI
      </p> */}
      <div className="header__badge">
        <span className="header__badge-dot"></span>
        <span>Powered by T5 Transformer</span>
      </div>
    </header>
  );
}
