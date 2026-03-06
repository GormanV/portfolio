import { useState, useEffect, useRef, useCallback } from 'react'
import { PAGES, NAV_LABELS, REGIONS } from './data/regions'
import { usePlanet } from './hooks/usePlanet'
import { useStars } from './hooks/useStars'
import { useLabel } from './hooks/useLabel'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Beyond from './components/Beyond'
import Contact from './components/Contact'

const PAGE_COMPONENTS = { about: About, skills: Skills, experience: Experience, beyond: Beyond, contact: Contact }

// Navigation timing constants (ms)
const HERO_FADE_DELAY = 300    // delay before hero fades in on first load
const NAV_TRANSITION_MS = 450  // planet rotation + page swap duration
const PANEL_REVEAL_DELAY = 50  // brief pause after swap before panel slides in

export default function App() {
  const [page, setPage] = useState('home')
  const [transitioning, setTransitioning] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const starCanvasRef = useRef(null)
  const planetCanvasRef = useRef(null)
  const labelCanvasRef = useRef(null)

  useStars(starCanvasRef)
  const { navigatePlanet } = usePlanet(planetCanvasRef)
  useLabel(labelCanvasRef, REGIONS[page])

  // Hero fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), HERO_FADE_DELAY)
    return () => clearTimeout(t)
  }, [])

  const navigate = useCallback((newPage) => {
    if (newPage === page || transitioning) return
    setTransitioning(true)
    setPanelVisible(false)
    navigatePlanet(newPage)
    setTimeout(() => {
      setPage(newPage)
      setTransitioning(false)
      if (newPage !== 'home') setTimeout(() => setPanelVisible(true), PANEL_REVEAL_DELAY)
    }, NAV_TRANSITION_MS)
  }, [page, transitioning, navigatePlanet])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      const idx = PAGES.indexOf(page)
      if (e.key === 'ArrowRight' && idx < PAGES.length - 1) navigate(PAGES[idx + 1])
      if (e.key === 'ArrowLeft' && idx > 0) navigate(PAGES[idx - 1])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [page, navigate])

  const PageComponent = PAGE_COMPONENTS[page]

  return (
    <>
      <canvas ref={starCanvasRef} className="star-canvas" />
      <canvas ref={planetCanvasRef} className="planet-canvas" />
      <canvas ref={labelCanvasRef} className="label-canvas" />

      <div className={`transition-overlay${transitioning ? ' active' : ''}`} />

      {/* HUD corners */}
      <div className="hud-corner hud-tl">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M0 60 L0 0 L60 0" stroke="#4af0e8" strokeWidth="1" />
          <path d="M0 40 L0 0 L40 0" stroke="#4af0e8" strokeWidth="0.5" opacity="0.5" />
          <circle cx="0" cy="0" r="3" fill="#4af0e8" />
        </svg>
      </div>
      <div className="hud-corner hud-tr">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M0 60 L0 0 L60 0" stroke="#4af0e8" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#4af0e8" />
        </svg>
      </div>

      {/* Navigation */}
      <nav>
        <div className="nav-logo">
          Tom Owen
          <span>Full Stack Engineer</span>
        </div>
        <ul className="nav-links">
          {PAGES.map(p => (
            <li key={p}>
              <button className={page === p ? 'active' : ''} onClick={() => navigate(p)}>
                {NAV_LABELS[p]}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero panel */}
      {page === 'home' && (
        <div className="content-area">
          <div className={`hero-panel${heroVisible ? ' visible' : ''}`}>
            <div className="hero-eyebrow">Arrakis Surface · Sector 01</div>
            <h1 className="hero-name">Tom<br /><span className="accent">Owen</span></h1>
            <div className="hero-title">Full Stack Engineer</div>
            <p className="hero-desc">
              Career changer with nearly 3 years building Spring Boot microservices
              and React UIs at Ocado Technology.
              Now looking for my next role.
            </p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => navigate('about')}>My Story</button>
              <button className="btn-outline" onClick={() => navigate('contact')}>Get in Touch</button>
            </div>
          </div>
        </div>
      )}

      {/* Content panel */}
      {page !== 'home' && PageComponent && (
        <div className="panel-wrapper">
          <div className={`content-panel${panelVisible ? ' visible' : ''}`}>
            <div className="panel-body">
              <PageComponent />
            </div>
          </div>
        </div>
      )}

      {/* About this page */}
      <button className="info-btn" onClick={() => setInfoOpen(o => !o)}>
        About this page
      </button>
      {infoOpen && (
        <div className="info-popup">
          <button className="info-popup-close" onClick={() => setInfoOpen(false)}>✕</button>
          <p className="info-popup-heading">AI-Assisted Project</p>
          <p>
            This portfolio was built using{' '}
            <strong>Claude Code</strong> — Anthropic's AI-powered CLI tool — with{' '}
            <strong>Claude Sonnet</strong> as the coding assistant.
          </p>
          <p>
            The design concept, content, and ideas are Tom's own. The implementation
            was pair-programmed with Claude: writing React components, GLSL planet
            shaders, Three.js animations, and CSS from scratch through conversation.
          </p>
          <p>Built for learning purposes. Not intended for commercial use.</p>
        </div>
      )}
    </>
  )
}
