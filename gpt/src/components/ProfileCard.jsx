import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './ProfileCard.css';

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const round = (value, precision = 3) => parseFloat(value.toFixed(precision));
const adjust = (value, fromMin, fromMax, toMin, toMax) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

function ProfileCard({
  avatarUrl,
  className = '',
  name,
  title,
  handle,
  status,
  contactText = 'View Project',
  innerGradient = 'linear-gradient(145deg, rgba(255, 255, 255, 0.76), rgba(255, 182, 213, 0.42))',
  behindGlowColor = 'rgba(255, 79, 154, 0.42)',
  behindGlowSize = '42%',
  enableTilt = true,
}) {
  const wrapRef = useRef(null);
  const shellRef = useRef(null);
  const rafRef = useRef(null);
  const current = useRef({ x: 0, y: 0, tx: 0, ty: 0, running: false, lastTs: 0 });

  const setVarsFromXY = useCallback((x, y) => {
    const shell = shellRef.current;
    const wrap = wrapRef.current;
    if (!shell || !wrap) return;

    const width = shell.clientWidth || 1;
    const height = shell.clientHeight || 1;
    const percentX = clamp((100 / width) * x);
    const percentY = clamp((100 / height) * y);
    const centerX = percentX - 50;
    const centerY = percentY - 50;

    wrap.style.setProperty('--pointer-x', `${percentX}%`);
    wrap.style.setProperty('--pointer-y', `${percentY}%`);
    wrap.style.setProperty('--background-x', `${adjust(percentX, 0, 100, 35, 65)}%`);
    wrap.style.setProperty('--background-y', `${adjust(percentY, 0, 100, 35, 65)}%`);
    wrap.style.setProperty('--pointer-from-center', `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`);
    wrap.style.setProperty('--pointer-from-top', `${percentY / 100}`);
    wrap.style.setProperty('--pointer-from-left', `${percentX / 100}`);
    wrap.style.setProperty('--rotate-x', `${round(-(centerX / 8))}deg`);
    wrap.style.setProperty('--rotate-y', `${round(centerY / 7)}deg`);
  }, []);

  const animateToTarget = useCallback(
    (timestamp) => {
      const state = current.current;
      if (!state.running) return;
      if (state.lastTs === 0) state.lastTs = timestamp;

      const dt = (timestamp - state.lastTs) / 1000;
      state.lastTs = timestamp;
      const easing = 1 - Math.exp(-dt / 0.14);
      state.x += (state.tx - state.x) * easing;
      state.y += (state.ty - state.y) * easing;
      setVarsFromXY(state.x, state.y);

      if (Math.abs(state.tx - state.x) > 0.05 || Math.abs(state.ty - state.y) > 0.05) {
        rafRef.current = requestAnimationFrame(animateToTarget);
      } else {
        state.running = false;
        state.lastTs = 0;
      }
    },
    [setVarsFromXY],
  );

  const setTarget = useCallback(
    (x, y) => {
      current.current.tx = x;
      current.current.ty = y;
      if (!current.current.running) {
        current.current.running = true;
        current.current.lastTs = 0;
        rafRef.current = requestAnimationFrame(animateToTarget);
      }
    },
    [animateToTarget],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!enableTilt || !shellRef.current) return;
      const rect = shellRef.current.getBoundingClientRect();
      setTarget(event.clientX - rect.left, event.clientY - rect.top);
    },
    [enableTilt, setTarget],
  );

  const handlePointerEnter = useCallback(
    (event) => {
      if (!shellRef.current) return;
      shellRef.current.classList.add('active');
      handlePointerMove(event);
    },
    [handlePointerMove],
  );

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.classList.remove('active');
    setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
  }, [setTarget]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;

    current.current.x = shell.clientWidth - 70;
    current.current.y = 60;
    setTarget(shell.clientWidth / 2, shell.clientHeight / 2);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [setTarget]);

  const cardStyle = useMemo(
    () => ({
      '--inner-gradient': innerGradient,
      '--behind-glow-color': behindGlowColor,
      '--behind-glow-size': behindGlowSize,
    }),
    [behindGlowColor, behindGlowSize, innerGradient],
  );

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`.trim()} style={cardStyle}>
      <div className="pc-behind" />
      <div
        ref={shellRef}
        className="pc-card-shell"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <article className="pc-card">
          <div className="pc-inside">
            <div className="pc-shine" />
            <div className="pc-glare" />
            <div className="pc-media">
              {avatarUrl ? <img src={avatarUrl} alt={name} loading="lazy" /> : <span>{handle}</span>}
            </div>
            <div className="pc-details">
              <p>{title}</p>
              <h3>{name}</h3>
            </div>
            <div className="pc-user-info">
              <div className="pc-user-text">
                <div className="pc-handle">@{handle}</div>
                <div className="pc-status">{status}</div>
              </div>
              <span className="pc-contact-btn">{contactText}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default React.memo(ProfileCard);
