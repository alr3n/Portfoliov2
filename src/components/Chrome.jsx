import { useEffect, useState } from 'react'
import { PROFILE } from '../data.js'

export function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('nav-open', open)
    return () => document.documentElement.classList.remove('nav-open')
  }, [open])

  const close = () => setOpen(false)

  return (
    <nav className={`nav${open ? ' nav--open' : ''}`}>
      <a href="#top" className="nav__logo" onClick={close}>
        ALREN<span>.</span>
      </a>
      <button
        type="button"
        className="nav__toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="nav__links">
        <a href="#work" onClick={close}>Work</a>
        <a href="#certs" onClick={close}>Credentials</a>
        <a href="#stack" onClick={close}>Stack</a>
        <a href={PROFILE.github} target="_blank" rel="noreferrer" onClick={close}>GitHub</a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" onClick={close}>LinkedIn</a>
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
