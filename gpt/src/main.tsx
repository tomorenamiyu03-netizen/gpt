import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, Mail, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BorderGlow from './components/BorderGlow';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const heroImages = [
  ['/assets/hero-character-opt.webp', 'Hero character'],
  ['/assets/hero-side-figure-01-opt.webp', 'Pink warrior figure'],
  ['/assets/hero-side-figure-02-opt.webp', 'Pink musician figure'],
  ['/assets/hero-side-figure-04-opt.webp', 'White horned figure'],
  ['/assets/hero-side-figure-05-opt.webp', 'Orange character figure'],
];

const projects = [
  { name: '文创/IP', category: 'Cultural IP', id: 'project-cultural', images: Array.from({ length: 6 }, (_, i) => `/assets/cultural-0${i + 1}${i === 0 ? '-metal' : ''}-opt.webp`) },
  { name: '包装', category: 'Package Design', id: 'project-packaging', images: Array.from({ length: 6 }, (_, i) => `/assets/packaging-0${i + 1}-opt.webp`) },
  { name: '插画/海报', category: 'Poster', id: 'project-poster', images: ['/assets/poster-01-opt.webp','/assets/poster-02-opt.webp','/assets/poster-03-opt.webp','/assets/poster-04-opt.webp','/assets/poster-05-opt.webp','/assets/poster-06-opt.webp','/assets/poster-07-opt.webp','/assets/poster-08.mp4'] },
];

const nav = [['首页','#top'],['文创/IP','#project-cultural'],['包装','#project-packaging'],['插画/海报','#project-poster'],['联系我','#contact']];
const isVideo = (src: string) => src.endsWith('.mp4');

function usePortfolioMotion(root: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!root.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.current.querySelector('.opening-panel')?.remove();
      return;
    }

    const ctx = gsap.context(() => {
      const premiumEase = 'expo.out';
      const opening = gsap.timeline({ defaults: { ease: premiumEase } });

      gsap.set('.opening-word span', { yPercent: 125, scaleY: 0.35, transformOrigin: '50% 100%' });
      gsap.set('.opening-line', { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set('.nav-bar, .hero-carousel-controls, .hero-bottom', { autoAlpha: 0, y: 34 });
      gsap.set('.hero-title-wrap', { clipPath: 'inset(0 0 100% 0)' });
      gsap.set('.hero-title', { yPercent: 115, scaleX: 0.68, scaleY: 1.22, transformOrigin: '50% 50%' });
      gsap.set('.hero-figure', { autoAlpha: 0 });

      opening
        .to('.opening-word span', { yPercent: 0, scaleY: 1, duration: 1.25, stagger: 0.1 })
        .to('.opening-line', { scaleX: 1, duration: 1.1 }, 0.22)
        .to('.opening-panel', { yPercent: -100, duration: 1.5, ease: 'power4.inOut' }, '+=0.15')
        .to('.hero-title-wrap', { clipPath: 'inset(0 0 0% 0)', duration: 1.15 }, '-=1.08')
        .to('.hero-title', { yPercent: 0, scaleX: 1, scaleY: 1, duration: 1.55 }, '<')
        .to('.hero-figure', { autoAlpha: 1, duration: 1.4, stagger: { each: 0.09, from: 'center' } }, '-=1.1')
        .to('.nav-bar, .hero-carousel-controls, .hero-bottom', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, '-=0.8');

      gsap.utils.toArray<HTMLElement>('.section-heading, .contact-heading').forEach((heading) => {
        gsap.fromTo(heading,
          { autoAlpha: 0, y: 150, scaleX: 0.62, scaleY: 1.18, clipPath: 'inset(0 0 100% 0)' },
          { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.65, ease: premiumEase,
            scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
      });

      gsap.from('.about-glow-card', { y: 110, autoAlpha: 0, clipPath: 'inset(18% 0 18% 0 round 34px)', duration: 1.55, ease: premiumEase,
        scrollTrigger: { trigger: '.about-glow-card', start: 'top 84%', once: true } });
      gsap.from('.about-profile-grid article', { y: 55, autoAlpha: 0, duration: 1.05, stagger: 0.14, ease: premiumEase,
        scrollTrigger: { trigger: '.about-profile-grid', start: 'top 88%', once: true } });

      gsap.utils.toArray<HTMLElement>('.project-shell').forEach((shell) => {
        const top = shell.querySelector('.project-card-top');
        const stage = shell.querySelector('.project-images');
        const media = shell.querySelectorAll('.circular-project-card img, .circular-project-card video');
        const tl = gsap.timeline({ scrollTrigger: { trigger: shell, start: 'top 80%', once: true } });
        tl.from(top, { y: 90, autoAlpha: 0, duration: 1.25, ease: premiumEase })
          .from(stage, { y: 100, autoAlpha: 0, clipPath: 'inset(0 50% 0 50% round 28px)', duration: 1.55, ease: 'power4.out' }, '-=0.75')
          .from(media, { scale: 1.13, duration: 1.8, stagger: 0.08, ease: premiumEase }, '-=1.25');
        gsap.to(stage, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: shell, start: 'top bottom', end: 'bottom top', scrub: 1.3 } });
      });

      gsap.from('.contact-glow-card', { y: 100, autoAlpha: 0, clipPath: 'inset(20% 0 20% 0 round 34px)', duration: 1.55, ease: premiumEase,
        scrollTrigger: { trigger: '.contact-glow-card', start: 'top 86%', once: true } });
    }, root);

    return () => ctx.revert();
  }, [root]);
}

function Navigation() {
  return <nav className="simple-nav" aria-label="Portfolio navigation">{nav.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>;
}

function FloatingNavigation() {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const nextVisible = window.scrollY > window.innerHeight * 0.82;
      if (nextVisible !== visibleRef.current) {
        visibleRef.current = nextVisible;
        setVisible(nextVisible);
      }
      ticking = false;
    };
    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return <div className={`floating-nav ${visible ? 'is-visible' : ''}`}><Navigation /></div>;
}

function Hero() {
  const [active, setActive] = useState(0);
  const step = (n: number) => setActive((active + n + heroImages.length) % heroImages.length);
  return <section className="hero-section" id="top">
    <div className="nav-bar"><Navigation /></div>
    <div className="hero-title-wrap"><h1 className="hero-heading hero-title">i&apos;m SHUIYU</h1></div>
    <div className="hero-figure-layer" aria-label="Hero character gallery">
      {heroImages.map(([src, name], i) => {
        const raw = (i - active + heroImages.length) % heroImages.length;
        const role = raw === 0 ? 'center' : raw === 1 ? 'right' : raw === 2 ? 'far-right' : raw === 4 ? 'left' : 'far-left';
        const compact = (i === 2 || i === 3) && role === 'center' ? 'hero-figure-selected-compact' : '';
        const enlarged = '';
        const lift = '';
        const lowered = (i === 2 || i === 3) && role === 'center' ? 'hero-figure-lowered' : '';
        const extraLowered = i === 3 && role === 'center' ? 'hero-figure-extra-lowered' : '';
        return <button className={`hero-figure hero-figure-${role} ${compact} ${enlarged} ${lift} ${lowered} ${extraLowered}`} key={src} onClick={() => setActive(i)} type="button"><img src={src} alt={name} decoding="async" fetchPriority={role === 'center' ? 'high' : 'low'} loading={role === 'center' ? 'eager' : 'lazy'} /></button>;
      })}
    </div>
    <div className="hero-carousel-controls"><button onClick={() => step(-1)} aria-label="Previous hero image"><ArrowLeft /></button><button onClick={() => step(1)} aria-label="Next hero image"><ArrowRight /></button></div>
    <div className="hero-bottom"><a className="contact-button" href="#projects">IP潮玩</a></div>
  </section>;
}

function About() {
  return <section className="about-section" id="about">
    <div className="about-cube-layer" aria-hidden="true">
      <img className="about-cube about-cube-top-left" src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png" alt="" decoding="async" loading="lazy" />
      <img className="about-cube about-cube-top-right" src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png" alt="" decoding="async" loading="lazy" />
      <img className="about-cube about-cube-bottom-left" src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png" alt="" decoding="async" loading="lazy" />
      <img className="about-cube about-cube-bottom-right" src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png" alt="" decoding="async" loading="lazy" />
    </div>
  <div className="about-content">
    <h2 className="hero-heading section-heading">About me</h2>
    <div className="about-text-block"><BorderGlow animated backgroundColor="rgba(16,12,18,.88)" borderRadius={34} className="about-glow-card" colors={['#ff8ac8','#c084fc','#38bdf8']}>
      <div className="about-glow-content">
        <div className="about-profile-topline"><span>PROFILE / CULTURAL IP DESIGNER</span><strong>水钰</strong></div>
        <div className="about-profile-main"><h3>文创 IP 插画与包装海报</h3><div className="about-profile-copy"><p className="about-profile-lead">深耕文创视觉设计，可独立完成 IP 形象、文创衍生品、礼盒包装、宣传海报、主题插画、电商详情页等完整落地流程。</p><p className="about-profile-lead">依托多年游戏原画与 Q 版造型经验，结合 AI 工作流，快速完成从概念草图到商业展示的视觉闭环。</p></div></div>        <div className="about-profile-grid">
          <article><span>01 / IP System</span><p>从角色概念到衍生产品视觉，建立统一的角色气质与商业识别。</p></article>
          <article><span>02 / Package Visual</span><p>覆盖礼盒包装、主题海报与电商详情页，让文创产品展示更完整。</p></article>
          <article><span>03 / AI Workflow</span><p>结合 AI 梳理方案、生成参考，提升草图和包装视觉迭代效率。</p></article>
          <article><span>04 / Delivery</span><p>面向真实商业落地，兼顾视觉表达、传播场景和后续延展。</p></article>
        </div>
      </div>
    </BorderGlow></div>
  </div></section>;
}

function Project({ project, index }: { project: typeof projects[number], index: number }) {
  const [active, setActive] = useState(0);
  const step = (n: number) => setActive((active + n + project.images.length) % project.images.length);
  return <article className="project-shell" id={project.id}><div className="project-card" style={{ top: `calc(var(--sticky-top) + ${index * 28}px)` }}>
    <div className="project-card-top"><span className="project-number">0{index + 1}</span><span className="project-category">{project.category}</span><h3>{project.name}</h3></div>
    <div className="project-images project-circular-stage"><div className="project-nav-controls"><span>VIEW</span><button onClick={() => step(-1)} aria-label="Previous project image">←</button><button onClick={() => step(1)} aria-label="Next project image">→</button></div>
      <div className="circular-project-gallery">{project.images.map((src, i) => {
        let offset = i - active; const total = project.images.length; if (offset > total / 2) offset -= total; if (offset < -total / 2) offset += total; const distance = Math.abs(offset); const current = offset === 0;
        const style = {'--gallery-x':`${offset * 150}px`,'--gallery-y':`${Math.min(distance,4)*18}px`,'--gallery-rotate':`${offset*-7}deg`,'--gallery-tilt':`${offset*6}deg`,'--gallery-scale':current?'1':`${Math.max(.6,.86-distance*.06)}`,'--gallery-blur':current?'0px':`${Math.min(20,6+distance*3.5)}px`,'--gallery-opacity':current?'1':`${Math.max(.16,.64-distance*.11)}`,'--gallery-depth':current?'260px':`${-distance*90}px`,'--gallery-z':current?300:80-distance} as React.CSSProperties;
        return <button className={`circular-project-card ${current?'is-active':'is-recessed'} ${distance>4?'is-hidden':''}`} style={style} onClick={() => setActive(i)} key={src}>{isVideo(src)?<video src={src} autoPlay={current} controls={current} loop muted playsInline preload={current ? 'auto' : 'metadata'} />:<img src={src} alt={`${project.name} ${i+1}`} decoding="async" loading="lazy" fetchPriority="low" />}<span>{String(i+1).padStart(2,'0')}</span></button>;
      })}</div>
    </div>
  </div></article>;
}

function App() {
  const root = useRef<HTMLElement>(null);
  usePortfolioMotion(root);
  return <main className="site-shell" ref={root}>
    <div className="opening-panel" aria-hidden="true"><div className="opening-word"><span>SHUI</span><span>YU</span></div><div className="opening-line" /></div>
    <FloatingNavigation /><Hero /><About />
    <section className="projects-section" id="projects"><h2 className="hero-heading section-heading">Project</h2><div className="project-stack">{projects.map((p,i)=><Project project={p} index={i} key={p.id}/>)}</div></section>
    <section className="contact-section" id="contact"><h2 className="hero-heading contact-heading">Contact</h2><BorderGlow animated backgroundColor="rgba(16,12,18,.9)" borderRadius={34} className="contact-glow-card" colors={['#ff8ac8','#c084fc','#38bdf8']}><div className="contact-panel"><span className="contact-kicker">GET IN TOUCH</span><div className="contact-info-grid"><a className="contact-info-item" href="tel:15593122721"><span className="contact-info-icon"><Phone /></span><span>鐢佃瘽</span><strong>15593122721</strong></a><a className="contact-info-item" href="mailto:15227846986@qq.com"><span className="contact-info-icon"><Mail /></span><span>鐢靛瓙閭</span><strong>15227846986@QQ.COM</strong></a></div></div></BorderGlow></section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
