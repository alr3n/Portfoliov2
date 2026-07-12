import { PROFILE } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <a className="footer__cta" href={`mailto:${PROFILE.email}`}>
        Let's build<br />
        <em>something</em>
      </a>
      <div className="footer__links">
        <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
      </div>
      <div className="footer__base">
        <span>© {new Date().getFullYear()} Alren Grampon</span>
        <span>{PROFILE.location}</span>
        <span>Designed & engineered with React + Three.js</span>
      </div>
    </footer>
  )
}
