import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import './GooeyNav.css';

type GooeyNavItem = {
  label: string;
  href: string;
};

type GooeyNavProps = {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
};

type Particle = {
  start: [number, number];
  end: [number, number];
  time: number;
  scale: number;
  color: number;
  rotate: number;
};

function GooeyNav({
  items,
  animationTime = 720,
  particleCount = 18,
  particleDistances = [74, 9],
  particleR = 92,
  timeVariance = 260,
  colors = [1, 2, 3, 1, 4, 2, 1, 3],
  initialActiveIndex = 0,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number): Particle => {
    const rotate = noise(r / 10);

    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLSpanElement) => {
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i += 1) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const particleData = createParticle(i, t, particleDistances, particleR);
      element.classList.remove('active');

      window.setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');

        particle.classList.add('gooey-particle');
        particle.style.setProperty('--start-x', `${particleData.start[0]}px`);
        particle.style.setProperty('--start-y', `${particleData.start[1]}px`);
        particle.style.setProperty('--end-x', `${particleData.end[0]}px`);
        particle.style.setProperty('--end-y', `${particleData.end[1]}px`);
        particle.style.setProperty('--time', `${particleData.time}ms`);
        particle.style.setProperty('--scale', `${particleData.scale}`);
        particle.style.setProperty('--color', `var(--gooey-color-${particleData.color}, #ff7ac8)`);
        particle.style.setProperty('--rotate', `${particleData.rotate}deg`);

        point.classList.add('gooey-point');
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add('active');
        });

        window.setTimeout(() => {
          particle.remove();
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const activateItem = (element: HTMLElement, index: number) => {
    if (activeIndex === index) return;

    setActiveIndex(index);
    updateEffectPosition(element);

    filterRef.current?.querySelectorAll('.gooey-particle').forEach((particle) => particle.remove());

    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  const handleClick = (event: MouseEvent<HTMLLIElement>, index: number) => {
    activateItem(event.currentTarget, index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const item = event.currentTarget.parentElement;
    if (!item) return;

    event.preventDefault();
    activateItem(item, index);
    window.location.href = event.currentTarget.href;
  };

  useEffect(() => {
    const activeLi = navRef.current?.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }

    if (!containerRef.current) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) updateEffectPosition(currentActiveLi);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav aria-label="Primary navigation">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li className={activeIndex === index ? 'active' : ''} key={item.label} onClick={(event) => handleClick(event, index)}>
              <a href={item.href} onKeyDown={(event) => handleKeyDown(event, index)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="gooey-effect gooey-filter" ref={filterRef} />
      <span className="gooey-effect gooey-text" ref={textRef} />
    </div>
  );
}

export default GooeyNav;
