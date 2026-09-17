import { useEffect, useRef, useState } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCE_MOTION = '(prefers-reduced-motion: reduce)';

const SCALE = {
  default: 1,
  link: 1.08,
  cta: 20 / 15,
  product: 25 / 15,
  icon: 1.4,
  input: 1,
};

const LERP_DOT = 0.26;
const LERP_TAIL = 0.13;
const LERP_SCALE = 0.22;

function lerp(current, target, amount) {
  return current + (target - current) * amount;
}

function useCursorEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia(FINE_POINTER);
    const motion = window.matchMedia(REDUCE_MOTION);

    const sync = () => setEnabled(pointer.matches && !motion.matches);
    sync();

    pointer.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      pointer.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  return enabled;
}

function readHover(node) {
  if (!node || node === document.documentElement || node === document.body) {
    return { mode: 'default', label: '', meta: '', image: '' };
  }

  const tagged = node.closest?.('[data-cursor]');
  if (tagged) {
    return {
      mode: tagged.getAttribute('data-cursor') || 'default',
      label: tagged.getAttribute('data-cursor-label') || '',
      meta: tagged.getAttribute('data-cursor-meta') || '',
      image: tagged.getAttribute('data-cursor-image') || '',
    };
  }

  if (node.closest?.('input, textarea, select, [contenteditable="true"]')) {
    return { mode: 'input', label: '', meta: '', image: '' };
  }

  if (node.closest?.('button, [role="button"], summary')) {
    return { mode: 'cta', label: '', meta: '', image: '' };
  }

  if (node.closest?.('a[href]')) {
    return { mode: 'link', label: '', meta: '', image: '' };
  }

  return { mode: 'default', label: '', meta: '', image: '' };
}

/**
 * Precision-pointer storefront cursor. Native cursor stays on touch devices,
 * reduced-motion, and the admin console. Position is written in rAF so React
 * never re-renders on mousemove.
 */
export function CustomCursor() {
  const enabled = useCursorEnabled();
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const tailRef = useRef(null);
  const tipRef = useRef(null);
  const thumbRef = useRef(null);
  const labelRef = useRef(null);
  const metaRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const root = rootRef.current;
    const dot = dotRef.current;
    const tail = tailRef.current;
    const tip = tipRef.current;
    if (!root || !dot || !tail || !tip) return undefined;

    document.documentElement.classList.add('gv-cursor-on');

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: pointer.x, y: pointer.y };
    const trail = { x: pointer.x, y: pointer.y };
    let scale = 1;
    let targetScale = 1;
    let enterBoost = 1;
    let visible = false;
    let mode = 'default';
    let raf = 0;
    let pendingTarget = null;

    const setMode = (next) => {
      if (next.mode === mode && next.label === (labelRef.current?.textContent || '')) return;

      const changed = next.mode !== mode;
      mode = next.mode;
      targetScale = SCALE[mode] ?? 1;
      root.dataset.mode = mode;
      if (changed) enterBoost = 1.12;

      const showTip = mode === 'product' && Boolean(next.label);
      tip.hidden = !showTip;
      if (labelRef.current) labelRef.current.textContent = next.label;
      if (metaRef.current) {
        metaRef.current.textContent = next.meta;
        metaRef.current.hidden = !next.meta;
      }
      if (thumbRef.current) {
        if (next.image) {
          thumbRef.current.hidden = false;
          thumbRef.current.src = next.image;
        } else {
          thumbRef.current.hidden = true;
          thumbRef.current.removeAttribute('src');
        }
      }
    };

    const queueHover = (event) => {
      pendingTarget = event.target;
    };

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visible) {
        visible = true;
        current.x = pointer.x;
        current.y = pointer.y;
        trail.x = pointer.x;
        trail.y = pointer.y;
        root.classList.add('is-visible');
      }
      queueHover(event);
    };

    const onDown = () => root.classList.add('is-pressed');
    const onUp = () => root.classList.remove('is-pressed');
    const onLeave = () => {
      visible = false;
      root.classList.remove('is-visible');
      setMode({ mode: 'default', label: '', meta: '', image: '' });
    };

    const tick = () => {
      if (pendingTarget) {
        setMode(readHover(pendingTarget));
        pendingTarget = null;
      }

      current.x = lerp(current.x, pointer.x, LERP_DOT);
      current.y = lerp(current.y, pointer.y, LERP_DOT);
      trail.x = lerp(trail.x, pointer.x, LERP_TAIL);
      trail.y = lerp(trail.y, pointer.y, LERP_TAIL);
      enterBoost = lerp(enterBoost, 1, 0.18);
      scale = lerp(scale, targetScale * enterBoost, LERP_SCALE);

      const dx = pointer.x - trail.x;
      const dy = pointer.y - trail.y;
      const len = Math.hypot(dx, dy) || 1;
      const tailX = trail.x - (dx / len) * 4;
      const tailY = trail.y - (dy / len) * 4;

      dot.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) scale(${scale})`;
      tail.style.transform = `translate3d(${tailX}px, ${tailY}px, 0) scale(${Math.max(scale * 0.92, 0.8)})`;

      if (!tip.hidden) {
        const pad = 18;
        const tipW = tip.offsetWidth;
        const tipH = tip.offsetHeight;
        let tipX = current.x + 22;
        let tipY = current.y + 22;
        if (tipX + tipW > window.innerWidth - pad) tipX = current.x - tipW - 16;
        if (tipY + tipH > window.innerHeight - pad) tipY = current.y - tipH - 16;
        tip.style.transform = `translate3d(${tipX}px, ${tipY}px, 0)`;
      }

      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    raf = window.requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('gv-cursor-on');
      window.cancelAnimationFrame(raf);
      pendingTarget = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="gv-cursor" data-mode="default" aria-hidden="true">
      <div ref={tailRef} className="gv-cursor-tail" />
      <div ref={dotRef} className="gv-cursor-dot">
        <span className="gv-cursor-arrow" />
        <span className="gv-cursor-caret" />
      </div>
      <div ref={tipRef} className="gv-cursor-tip" hidden>
        <img ref={thumbRef} alt="" className="gv-cursor-thumb" hidden />
        <span>
          <span ref={labelRef} className="gv-cursor-label" />
          <span ref={metaRef} className="gv-cursor-meta" hidden />
        </span>
      </div>
    </div>
  );
}

export default CustomCursor;
