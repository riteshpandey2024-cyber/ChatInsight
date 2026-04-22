import { useState, useEffect } from "react";
import { checkHealth } from "../api";

/**
 * Navbar — Top navigation bar with branding and API status indicator.
 */
export default function Navbar() {
  const [status, setStatus] = useState("checking");
  const [showDetails, setShowDetails] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showGithubDetails, setShowGithubDetails] = useState(false);
  const [showAppDetails, setShowAppDetails] = useState(false);
  const [latency, setLatency] = useState(0);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      try {
        await checkHealth();
        setLatency(Date.now() - start);
        setStatus("online");
      } catch {
        setStatus("offline");
      }
    };
    
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const resetPopovers = () => {
    setShowDetails(false);
    setShowModelDetails(false);
    setShowGithubDetails(false);
    setShowAppDetails(false);
  };

  return (
    <nav className="navbar" onMouseLeave={resetPopovers}>
      <div style={{ position: "relative" }}>
        <button 
          className="navbar__brand"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, outline: 'none' }}
          onClick={() => { resetPopovers(); setShowAppDetails(!showAppDetails); }}
          onBlur={() => setTimeout(() => setShowAppDetails(false), 200)}
        >
          <span className="navbar__logo">CI</span>
          <span className="navbar__name">ChatInsight</span>
        </button>

        {showAppDetails && (
          <div className="api-details-popover" style={{ left: '0', right: 'auto', width: '280px', top: 'calc(100% + 12px)' }}>
            <div className="api-details__header">About ChatInsight</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              An advanced, fast AI conversation summarization tool powered by remote Hugging Face inference with a local fallback.
            </p>
            <div className="api-details__row">
              <span className="api-details__label">Version</span>
              <span className="api-details__value">1.0.0-beta</span>
            </div>
            <div className="api-details__row">
              <span className="api-details__label">Stack</span>
              <span className="api-details__value">React · FastAPI · Streamlit</span>
            </div>
            <div className="api-details__row">
              <span className="api-details__label">Specialty</span>
              <span className="api-details__value">Dialogue Extraction</span>
            </div>
          </div>
        )}
      </div>

      <div className="navbar__links">
        {/* Model Popover */}
        <div style={{ position: "relative" }}>
          <button
            className="navbar__link"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
            onClick={() => { resetPopovers(); setShowModelDetails(!showModelDetails); }}
            onBlur={() => setTimeout(() => setShowModelDetails(false), 200)}
          >
            Model
          </button>
          {showModelDetails && (
            <div className="api-details-popover" style={{ left: '50%', transform: 'translateX(-50%)', width: '240px' }}>
              <div className="api-details__header">AI Model Specs</div>
              <div className="api-details__row">
                <span className="api-details__label">Architecture</span>
                <span className="api-details__value">Remote Inference</span>
              </div>
              <div className="api-details__row">
                <span className="api-details__label">Task</span>
                <span className="api-details__value">Chat Summarization</span>
              </div>
              <div className="api-details__row">
                <span className="api-details__label">Parameters</span>
                <span className="api-details__value">Model-dependent</span>
              </div>
              <div className="api-details__row" style={{ marginTop: '12px' }}>
                <a 
                  href="https://huggingface.co/t5-small" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-violet)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, display: 'flex', width: '100%', justifyContent: 'center', padding: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                >
                  View on HuggingFace ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* GitHub Popover */}
        <div style={{ position: "relative" }}>
          <button
            className="navbar__link"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
            onClick={() => { resetPopovers(); setShowGithubDetails(!showGithubDetails); }}
            onBlur={() => setTimeout(() => setShowGithubDetails(false), 200)}
          >
            GitHub
          </button>
          {showGithubDetails && (
            <div className="api-details-popover" style={{ left: '50%', transform: 'translateX(-50%)', width: '240px' }}>
              <div className="api-details__header">Repository Info</div>
              <div className="api-details__row">
                <span className="api-details__label">Author</span>
                <span className="api-details__value">Ritesh Pandey</span>
              </div>
              <div className="api-details__row">
                <span className="api-details__label">Frontend</span>
                <span className="api-details__value">React + Vite</span>
              </div>
              <div className="api-details__row">
                <span className="api-details__label">License</span>
                <span className="api-details__value">MIT</span>
              </div>
              <div className="api-details__row" style={{ marginTop: '12px' }}>
                <a 
                  href="https://github.com/riteshpandey2024-cyber/ChatInsight" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-violet)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, display: 'flex', width: '100%', justifyContent: 'center', padding: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}
                >
                  View Source Code ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          className="navbar__link"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: '1.1rem' }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* API Status Popover */}
        <div className="navbar__status-container" style={{ position: "relative" }}>
          <button
            className="navbar__status"
            onClick={() => { resetPopovers(); setShowDetails(!showDetails); }}
            onBlur={() => setTimeout(() => setShowDetails(false), 200)}
          >
            <span
              className={`navbar__status-dot navbar__status-dot--${status}`}
            />
            <span className="navbar__status-text">
              {status === "online"
                ? "API Online"
                : status === "offline"
                  ? "API Offline"
                  : "Checking…"}
            </span>
          </button>

          {showDetails && (
            <div className="api-details-popover">
              <div className="api-details__header">Server Status</div>
              <div className="api-details__row">
                <span className="api-details__label">Backend</span>
                <span className="api-details__value">FastAPI / Python</span>
              </div>
              <div className="api-details__row">
                <span className="api-details__label">AI Model</span>
                <span className="api-details__value">Remote Hugging Face + fallback</span>
              </div>
              <div className="api-details__row">
                <span className="api-details__label">Latency</span>
                <span className="api-details__value" style={{ color: status === 'online' ? '#22c55e' : '#ef4444' }}>
                  {status === 'online' ? `${latency}ms` : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
