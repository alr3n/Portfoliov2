import { PROFILE } from '../data.js'

export default function Hero() {
  return (
    <header className="hero" id="top">
      <p className="hero__kicker">{PROFILE.role} — {PROFILE.sub}</p>
      <h1 className="hero__title">
        <span className="line"><span>Alren</span></span>
        <span className="line"><span className="outline">Grampon</span></span>
      </h1>
      <div className="hero__meta">
        <p>
          Based in <strong>{PROFILE.location}</strong><br />
          Building apps that solve <strong>real problems</strong><br />
          Currently learning <strong>machine learning</strong>
        </p>
        <div className="hero__scroll">
          <span className="dot" />
          scroll to explore
        </div>
      </div>
    </header>
  )
}
