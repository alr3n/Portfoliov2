import { useState } from 'react'
import { PROFILE, PROJECTS, CERTS, STACK, PHOTOS } from '../data.js'

/* ---------------- About ---------------- */
export function About() {
  const words = PROFILE.statement.split(' ')
  const accents = new Set(['real-world', 'problem-solving', 'machine', 'learning,', 'full-stack'])
  return (
    <section className="section about" id="about">
      <p className="about__statement" data-words>
        {words.map((w, i) => (
          <span key={i} className={`word${accents.has(w.toLowerCase()) ? ' accent' : ''}`}>
            {w}&nbsp;
          </span>
        ))}
      </p>
      <blockquote className="about__quote">
        “{PROFILE.quote}”
        <cite>— pinned above the desk</cite>
      </blockquote>
    </section>
  )
}

/* ---------------- Photo strip (pinned horizontal reel) ---------------- */
function Polaroid({ photo, index }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="polaroid">
      <div className="polaroid__frame">
        {!failed ? (
          <img
            src={`./photos/${photo.file}`}
            alt={photo.caption}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="polaroid__placeholder">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#c8ff2e" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p>
              drop <b>{photo.file}</b> into<br />public/photos/
            </p>
          </div>
        )}
      </div>
      <figcaption className="polaroid__caption">
        <i>{String(index + 1).padStart(2, '0')}</i>
        <span>{photo.caption}</span>
      </figcaption>
    </figure>
  )
}

export function PhotoStrip() {
  return (
    <section className="section strip" id="photos">
      <div className="section__head">
        <h2 className="section__title">Off <em>screen</em></h2>
        <span className="section__count">scroll through the reel →</span>
      </div>
      <div className="strip__track">
        {PHOTOS.map((p, i) => (
          <Polaroid key={p.file} photo={p} index={i} />
        ))}
      </div>
    </section>
  )
}

/* ---------------- Projects ---------------- */
export function Projects() {
  return (
    <section className="section" id="work">
      <div className="section__head">
        <h2 className="section__title">Selected <em>work</em></h2>
        <span className="section__count">{String(PROJECTS.length).padStart(2, '0')} builds</span>
      </div>
      <div className="projects__list">
        {PROJECTS.map((p) => (
          <a className="project-row reveal" key={p.id} href={p.url} target="_blank" rel="noreferrer">
            <span className="project-row__id">/{p.id}</span>
            <h3 className="project-row__name">
              {p.name}
              <span className="tag">{p.tag}</span>
            </h3>
            <p className="project-row__desc">{p.desc}</p>
            <span className="project-row__stack">{p.stack}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Certifications ---------------- */
export function Certs() {
  return (
    <section className="section certs" id="certs">
      <div className="section__head">
        <h2 className="section__title">Licenses &<br /><em>certifications</em></h2>
        <span className="section__count">verified credentials</span>
      </div>
      <div className="certs__grid">
        {CERTS.map((c) => (
          <article className="cert-card reveal" key={c.name}>
            <div className="cert-card__year">
              {c.year}
              <small>{c.month}</small>
            </div>
            <div>
              <p className="cert-card__issuer">{c.issuer}</p>
              <h3 className="cert-card__name">{c.name}</h3>
            </div>
            <div className="cert-card__footer">
              <span>ID · {c.id}</span>
              <a className="cert-card__verify" href={c.url} target="_blank" rel="noreferrer">
                verify
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M1 9L9 1M9 1H3M9 1v6" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Stack ---------------- */
export function StackSection() {
  return (
    <section className="section" id="stack">
      <div className="section__head">
        <h2 className="section__title">The <em>toolkit</em></h2>
        <span className="section__count">{STACK.length} and counting</span>
      </div>
      <div className="stack__cloud">
        {STACK.map((s) => (
          <span className="stack__chip reveal" key={s}>{s}</span>
        ))}
      </div>
    </section>
  )
}
