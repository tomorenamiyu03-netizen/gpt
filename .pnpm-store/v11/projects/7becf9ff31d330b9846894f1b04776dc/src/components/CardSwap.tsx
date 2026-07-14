import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

type CardSwapProps = {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (index: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: React.ReactNode;
};

export type CardSwapHandle = {
  next: () => void;
  previous: () => void;
};

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  customClass?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`swap-card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));

Card.displayName = 'Card';

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  depth: i,
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const depthFilter = (depth: number) => {
  const blur = Math.min(depth * 1.45, 7);
  const brightness = Math.max(1 - depth * 0.055, 0.72);

  return `blur(${blur}px) brightness(${brightness})`;
};

function placeNow(element: HTMLDivElement | null, slot: ReturnType<typeof makeSlot>, skew: number) {
  if (!element) return;

  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    filter: depthFilter(slot.depth),
    force3D: true,
  });
}

const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children,
}, ref) {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const container = useRef<HTMLDivElement>(null);
  const swapRef = useRef<() => void>(() => undefined);

  useImperativeHandle(ref, () => ({
    next: () => swapRef.current(),
    previous: () => swapRef.current(),
  }));

  useEffect(() => {
    const total = refs.length;
    refs.forEach((ref, i) => placeNow(ref.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      const timeline = gsap.timeline();
      tlRef.current = timeline;

      timeline.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease,
      });

      timeline.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const element = refs[idx].current;
        if (!element) return;

        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        timeline.set(element, { zIndex: slot.zIndex }, 'promote');
        timeline.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            filter: depthFilter(slot.depth),
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      timeline.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      timeline.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
      timeline.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          filter: depthFilter(backSlot.depth),
          duration: config.durReturn,
          ease: config.ease,
        },
        'return',
      );

      timeline.call(() => {
        order.current = [...rest, front];
      });
    };

    swapRef.current = swap;
    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (!pauseOnHover) {
      return () => {
        clearInterval(intervalRef.current);
        tlRef.current?.kill();
      };
    }

    const node = container.current;
    const pause = () => {
      tlRef.current?.pause();
      clearInterval(intervalRef.current);
    };
    const resume = () => {
      tlRef.current?.play();
      intervalRef.current = window.setInterval(swap, delay);
    };

    node?.addEventListener('mouseenter', pause);
    node?.addEventListener('mouseleave', resume);

    return () => {
      node?.removeEventListener('mouseenter', pause);
      node?.removeEventListener('mouseleave', resume);
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
    };
  }, [cardDistance, config.durDrop, config.durMove, config.durReturn, config.ease, config.promoteOverlap, config.returnDelay, delay, easing, pauseOnHover, refs, skewAmount, verticalDistance]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (event: React.MouseEvent<HTMLDivElement>) => {
            child.props.onClick?.(event);
            onCardClick?.(i);
          },
        })
      : child,
  );

  return (
    <div className="card-swap-container" ref={container} style={{ width, height }}>
      {rendered}
    </div>
  );
});

export default CardSwap;
