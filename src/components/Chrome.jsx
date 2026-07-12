import { PROFILE } from '../data.js'

export function Nav() {
  return (
    <nav className="nav">
      <a href="#top" className="nav__logo">
        ALREN<span>.</span>
      </a>
      <div className="nav__links">
        <a href="#work">Work</a>
        <a href="#certs">Credentials</a>
        <a href="#stack">Stack</a>
        <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </nav>
  )
}

export function Preloader() {
  return (
    <div className="preloader" id="preloader">
      <div className="preloader__name">
        <span className="preloader__text">ALREN GRAMPON</span>
      </div>
      <div className="preloader__bar">
        <i id="preloader-bar" />
      </div>
    </div>
  )
}

const MARQUEE_ITEMS = ['Mobile Developer', 'Web Developer', 'Flutter', 'Machine Learning', 'Full-Stack Bound', 'Calapan PH']

export function Marquee() {
  const row = (key) => (
    <span key={key}>
      {MARQUEE_ITEMS.map((item) => (
        <span key={item}>
          {item} <i>◆</i>
        </span>
      ))}
    </span>
  )
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__inner">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
