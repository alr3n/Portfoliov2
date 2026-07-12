import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Scene from './scene/Scene.jsx'
import { scrollState } from './scene/scrollState.js'
import { Nav, Preloader, Marquee } from './components/Chrome.jsx'
import Hero from './components/Hero.jsx'
import { About, PhotoStrip, Projects, Certs, StackSection } from './components/Sections.jsx'
import Footer from './components/Footer.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const root = useRef(null)

  useLayoutEffect(() => {
    // ---- smooth scroll ----
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 })
    lenis.on('scroll', (e) => {
      ScrollTrigger.update()
      scrollState.progress = e.limit > 0 ? e.scroll / e.limit : 0
      scrollState.velocity = e.velocity
    })
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ---- pointer for the 3D scene ----
    const onMove = (e) => {
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)

    // ---- keep ScrollTrigger honest across mobile browsers' dynamic
    // address-bar show/hide, which fires resize events mid-scroll ----
    let resizeTimer
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200)
    }
    window.addEventListener('orientationchange', onResize)

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isDesktop = window.matchMedia('(min-width: 861px)').matches

      // ---- preloader → hero intro ----
      const intro = gsap.timeline()
      intro
        .from('.preloader__text', { yPercent: 110, duration: 0.7, ease: 'power3.out' })
        .fromTo('#preloader-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
        .to('#preloader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut', delay: 0.15 })
        .set('#preloader', { display: 'none' })
        .from('.hero__title .line > span', { yPercent: 110, duration: 1, stagger: 0.12, ease: 'power4.out' }, '-=0.45')
        .from('.hero__kicker, .hero__meta', { opacity: 0, y: 24, duration: 0.7, stagger: 0.1, ease: 'power2.out' }, '-=0.6')

      if (reduced) return

      // ---- hero title drifts up & fades as you leave ----
      gsap.to('.hero__title', {
        yPercent: -18,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'bottom 90%', end: 'bottom 20%', scrub: true }
      })

      // ---- about statement: word-by-word ignition (desktop only — a
      // scrub tied to scroll position reads as "stuck half-dim" on mobile,
      // where a single flick can overshoot or stop mid-range) ----
      if (isDesktop) {
        gsap.to('[data-words] .word', {
          opacity: 1,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: { trigger: '.about', start: 'top 75%', end: 'top 15%', scrub: true }
        })
      } else {
        gsap.set('[data-words] .word', { opacity: 1 })
      }

      // ---- pinned horizontal photo reel (desktop only — pin+scrub fights
      // with mobile browsers' dynamic toolbar resize; mobile gets a native
      // swipeable strip via CSS scroll-snap instead, see styles.css) ----
      const track = document.querySelector('[data-strip-track]')
      if (track && isDesktop) {
        const getDistance = () => track.scrollWidth - window.innerWidth + 64
        const cards = gsap.utils.toArray('.polaroid')
        gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-strip]',
            start: 'top top',
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            // settle with a card fully in view instead of stopping mid-photo
            snap: cards.length > 1
              ? {
                  snapTo: 1 / (cards.length - 1),
                  duration: { min: 0.2, max: 0.6 },
                  delay: 0.05,
                  ease: 'power1.inOut'
                }
              : false
          }
        })

      }

      // ---- generic reveals ----
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true })
      })

      // ---- section titles slide in ----
      gsap.utils.toArray('.section__title').forEach((el) => {
        gsap.from(el, {
          yPercent: 60,
          opacity: 0,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        })
      })
    }, root)

    return () => {
      ctx.revert()
      lenis.destroy()
      clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return (
    <div ref={root} className="grain">
      <Preloader />
      <Scene />
      <Nav />
      <main className="site">
        <Hero />
        <Marquee />
        <About />
        <PhotoStrip />
        <Projects />
        <Certs />
        <StackSection />
        <Footer />
      </main>
    </div>
  )
}
