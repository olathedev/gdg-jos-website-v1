"use client";

import Matter from "matter-js";
import { useEffect, useRef } from "react";
import type { PillTone } from "@/data/devfest26";

const toneClass: Record<PillTone, string> = {
  blue: "bg-g-blue",
  red: "bg-g-red",
  yellow: "bg-g-yellow",
  green: "bg-g-green",
  sky: "bg-h-blue",
  mint: "bg-h-green",
  sun: "bg-h-yellow",
  pink: "bg-h-red",
  white: "bg-white",
};

const MOBILE_MAX_PILLS = 14;
const DESKTOP_MAX_PILLS = 22;

/**
 * Pills that fall into the hero and pile up at the bottom (Matter.js).
 * Pills can be grabbed and thrown with a mouse (not on touch, so they never block scrolling). Physics pauses while the hero is off screen;
 * with reduced motion the pile is pre-simulated and rendered still.
 */
export default function PhysicsPills({ pills }: { pills: { label: string; tone: PillTone }[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const { Engine, Bodies, Composite, Constraint, Sleeping } = Matter;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let engine: Matter.Engine | null = null;
    let bodies: (Matter.Body | null)[] = [];
    let raf = 0;
    let visible = false;
    let started = false;
    let lastWidth = 0;
    let drag: { constraint: Matter.Constraint; id: number } | null = null;

    const els = () => pillRefs.current.filter(Boolean) as HTMLSpanElement[];

    const render = () => {
      els().forEach((el, i) => {
        const b = bodies[i];
        if (!b) return;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        el.style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - h / 2}px, 0) rotate(${b.angle}rad)`;
        el.style.opacity = "1";
      });
    };

    const loop = () => {
      if (!engine || !visible) return;
      Engine.update(engine, 1000 / 60);
      render();
      raf = requestAnimationFrame(loop);
    };

    const build = () => {
      cancelAnimationFrame(raf);
      if (engine) Engine.clear(engine);
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      lastWidth = W;
      engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1;

      const t = 400;
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, H / 2, t, H * 6, { isStatic: true }),
        Bodies.rectangle(W + t / 2, H / 2, t, H * 6, { isStatic: true }),
      ]);

      const max = Math.min(pills.length, W < 640 ? MOBILE_MAX_PILLS : DESKTOP_MAX_PILLS);
      bodies = els().map((el, i) => {
        if (i >= max) {
          el.style.display = "none";
          return null;
        }
        el.style.display = "";
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const x = w / 2 + Math.random() * Math.max(1, W - w);
        // Stagger the drop so pills arrive as a shower, not a block.
        const y = -h - i * (H / max) * 0.9 - Math.random() * 120;
        const body = Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: h / 2 - 1 },
          angle: (Math.random() - 0.5) * 1.4,
          restitution: 0.3,
          friction: 0.25,
          frictionAir: 0.012,
          density: 0.0018,
        });
        Composite.add(engine!.world, body);
        return body;
      });

      if (reduceMotion) {
        for (let s = 0; s < 900; s++) Engine.update(engine, 1000 / 60);
        render();
        return;
      }
      if (visible) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) {
          started = true;
          // Measure pills only after Google Sans Flex has loaded.
          document.fonts.ready.then(build);
        } else if (visible && !reduceMotion) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    // Rebuild only when the width really changes (mobile URL bars change height constantly).
    let resizeTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (started && Math.abs(wrap.clientWidth - lastWidth) > 40) build();
      }, 200);
    });
    ro.observe(wrap);

    // Drag & throw
    const point = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      if (!engine || reduceMotion) return;
      const el = e.currentTarget as HTMLSpanElement;
      const i = els().indexOf(el);
      const body = bodies[i];
      if (!body) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const p = point(e);
      Sleeping.set(body, false);
      const constraint = Constraint.create({
        pointA: p,
        bodyB: body,
        pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
        stiffness: 0.2,
        damping: 0.1,
        length: 0,
      });
      Composite.add(engine.world, constraint);
      drag = { constraint, id: e.pointerId };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      drag.constraint.pointA = point(e);
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId || !engine) return;
      Composite.remove(engine.world, drag.constraint);
      drag = null;
    };
    const pillEls = els();
    pillEls.forEach((el) => {
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      pillEls.forEach((el) => {
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
      });
      if (engine) Engine.clear(engine);
    };
  }, [pills]);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pills.map((p, i) => (
        <span
          key={p.label}
          ref={(el) => {
            pillRefs.current[i] = el;
          }}
          className={`${toneClass[p.tone]} pointer-events-auto pointer-coarse:pointer-events-none absolute top-0 left-0 inline-flex cursor-grab touch-none items-center rounded-full px-3.5 py-2.5 text-ink whitespace-nowrap opacity-0 select-none will-change-transform active:cursor-grabbing sm:px-5 sm:py-3`}
        >
          <span className="text-[13px] leading-none font-bold tracking-wide uppercase sm:text-base">{p.label}</span>
        </span>
      ))}
    </div>
  );
}
