// Lightweight promo animation engine — a trimmed React/TS port of the
// standalone `Fintech Design/promo/animations.jsx`. Provides the timeline
// primitives the promo scenes rely on: Easing, clamp, <PromoStage> (RAF loop +
// scale-to-fit) and <Sprite> (renders children only inside a time window).

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (t -= 1) * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

// ── Timeline context ─────────────────────────────────────────────────────────
interface TimelineValue {
  time: number;
  duration: number;
}
const TimelineContext = createContext<TimelineValue>({ time: 0, duration: 10 });
export const useTime = () => useContext(TimelineContext).time;
const useTimeline = () => useContext(TimelineContext);

// ── Sprite context ───────────────────────────────────────────────────────────
interface SpriteValue {
  localTime: number;
  progress: number;
  duration: number;
}
const SpriteContext = createContext<SpriteValue>({
  localTime: 0,
  progress: 0,
  duration: 0,
});
export const useSprite = () => useContext(SpriteContext);

export function Sprite({
  start = 0,
  end = Infinity,
  children,
}: {
  start?: number;
  end?: number;
  children: ReactNode;
}) {
  const { time } = useTimeline();
  if (time < start || time > end) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress =
    duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;

  return (
    <SpriteContext.Provider value={{ localTime, progress, duration }}>
      {children}
    </SpriteContext.Provider>
  );
}

// ── Stage ────────────────────────────────────────────────────────────────────
// Runs a looping playhead and scales a fixed-size canvas to fit its container.
export function PromoStage({
  width = 1080,
  height = 1080,
  duration = 30,
  background = '#0A0A0A',
  children,
}: {
  width?: number;
  height?: number;
  duration?: number;
  background?: string;
  children: ReactNode;
}) {
  const [time, setTime] = useState(0);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const s = Math.min(el.clientWidth / width, el.clientHeight / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  useEffect(() => {
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        const next = t + dt;
        return next >= duration ? next % duration : next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [duration]);

  const ctxValue = useMemo(() => ({ time, duration }), [time, duration]);

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width,
          height,
          background,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <TimelineContext.Provider value={ctxValue}>
          {children}
        </TimelineContext.Provider>
      </div>
    </div>
  );
}
