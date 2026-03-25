import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
  size: number;
}

interface ClickEffect {
  x: number;
  y: number;
  age: number;
  ripples: { radius: number; opacity: number }[];
  lines: { angle: number; length: number; opacity: number }[];
  glow: number;
}

const FuturisticCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animRef = useRef(0);
  const mouse = useRef({ x: -100, y: -100, active: false });
  const smoothMouse = useRef({ x: -100, y: -100 });
  const trailDots = useRef<TrailDot[]>([]);
  const clicks = useRef<ClickEffect[]>([]);
  const state = useRef({ scale: 1, targetScale: 1, glow: 0.6, targetGlow: 0.6, breath: 0 });
  const hovering = useRef<"none" | "button" | "link" | "card">("none");
  const lastTrailTime = useRef(0);

  const spawnClick = useCallback((x: number, y: number) => {
    const lines = [];
    for (let i = 0; i < 4; i++) {
      lines.push({
        angle: (Math.PI * 2 * i) / 4 + (Math.random() - 0.5) * 0.5,
        length: 20 + Math.random() * 25,
        opacity: 0.4 + Math.random() * 0.2,
      });
    }
    clicks.current.push({
      x, y, age: 0,
      ripples: [{ radius: 0, opacity: 0.35 }],
      lines,
      glow: 0.8,
    });
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    document.body.style.cursor = "none";
    const styleEl = document.createElement("style");
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };
    const onLeave = () => { mouse.current.active = false; };
    const onClick = (e: MouseEvent) => {
      spawnClick(smoothMouse.current.x, smoothMouse.current.y);
      state.current.targetScale = 0.6;
      state.current.targetGlow = 1.4;
      setTimeout(() => {
        state.current.targetScale = hovering.current === "button" ? 1.3 : 1;
        state.current.targetGlow = hovering.current === "button" ? 0.9 : 0.6;
      }, 100);
    };
    const onHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const s = state.current;
      if (target.closest("button, [role='button'], .btn-glow, .btn-outline-glow")) {
        hovering.current = "button"; s.targetScale = 1.3; s.targetGlow = 0.9;
      } else if (target.closest("a")) {
        hovering.current = "link"; s.targetScale = 1.15; s.targetGlow = 0.8;
      } else if (target.closest(".glass-card, .card, img")) {
        hovering.current = "card"; s.targetScale = 1.1; s.targetGlow = 0.75;
      } else {
        hovering.current = "none"; s.targetScale = 1; s.targetGlow = 0.6;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onHover);

    const animate = () => {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;
      const sm = smoothMouse.current;
      const s = state.current;

      // Smooth follow (slight delay)
      sm.x += (m.x - sm.x) * 0.18;
      sm.y += (m.y - sm.y) * 0.18;

      // Lerp state
      s.scale += (s.targetScale - s.scale) * 0.12;
      s.glow += (s.targetGlow - s.glow) * 0.1;
      s.breath += 0.025;
      const breathVal = Math.sin(s.breath) * 0.08 + 0.92;

      if (m.active) {
        const now = performance.now();
        // Spawn subtle trail dots every ~50ms
        if (now - lastTrailTime.current > 50) {
          lastTrailTime.current = now;
          trailDots.current.push({
            x: sm.x + (Math.random() - 0.5) * 2,
            y: sm.y + (Math.random() - 0.5) * 2,
            opacity: 0.25,
            size: 1.2 + Math.random() * 0.8,
          });
          if (trailDots.current.length > 20) trailDots.current.shift();
        }

        // Draw trail dots
        for (let i = trailDots.current.length - 1; i >= 0; i--) {
          const d = trailDots.current[i];
          d.opacity -= 0.012;
          if (d.opacity <= 0) { trailDots.current.splice(i, 1); continue; }
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size * d.opacity, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(220, 60%, 70%, ${d.opacity})`;
          ctx.fill();
        }

        // Card halo
        if (hovering.current === "card") {
          const hGrd = ctx.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, 35);
          hGrd.addColorStop(0, "hsla(220, 80%, 65%, 0.04)");
          hGrd.addColorStop(1, "transparent");
          ctx.fillStyle = hGrd;
          ctx.beginPath();
          ctx.arc(sm.x, sm.y, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer ring (very subtle)
        const ringSize = 12 * s.scale * breathVal;
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, ringSize, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(250, 50%, 70%, ${0.12 * s.glow})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Soft outer glow
        const glowSize = 18 * s.scale * breathVal;
        const grd = ctx.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, glowSize);
        grd.addColorStop(0, `hsla(210, 80%, 70%, ${0.12 * s.glow})`);
        grd.addColorStop(0.5, `hsla(250, 60%, 60%, ${0.04 * s.glow})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(sm.x - glowSize, sm.y - glowSize, glowSize * 2, glowSize * 2);

        // Core dot
        const coreSize = 4 * s.scale * breathVal;
        const coreGrd = ctx.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, coreSize);
        coreGrd.addColorStop(0, `hsla(200, 90%, 88%, ${0.85 * s.glow})`);
        coreGrd.addColorStop(0.6, `hsla(220, 70%, 65%, ${0.4 * s.glow})`);
        coreGrd.addColorStop(1, "transparent");
        ctx.fillStyle = coreGrd;
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, coreSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Click effects
      for (let ci = clicks.current.length - 1; ci >= 0; ci--) {
        const c = clicks.current[ci];
        c.age++;
        let alive = false;

        // Glow burst
        if (c.glow > 0.01) {
          alive = true;
          c.glow *= 0.92;
          const bGrd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 30 * c.glow);
          bGrd.addColorStop(0, `hsla(210, 90%, 75%, ${c.glow * 0.3})`);
          bGrd.addColorStop(1, "transparent");
          ctx.fillStyle = bGrd;
          ctx.fillRect(c.x - 30, c.y - 30, 60, 60);
        }

        // Ripple
        for (const r of c.ripples) {
          r.radius += 2.5;
          r.opacity -= 0.012;
          if (r.opacity > 0) {
            alive = true;
            ctx.beginPath();
            ctx.arc(c.x, c.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(220, 70%, 65%, ${r.opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Subtle electric lines
        for (const l of c.lines) {
          l.opacity -= 0.018;
          if (l.opacity > 0) {
            alive = true;
            ctx.strokeStyle = `hsla(230, 60%, 75%, ${l.opacity * 0.6})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            const steps = 3;
            for (let si = 1; si <= steps; si++) {
              const frac = si / steps;
              const jit = (Math.random() - 0.5) * 6 * l.opacity;
              ctx.lineTo(
                c.x + Math.cos(l.angle) * l.length * frac + Math.sin(l.angle) * jit,
                c.y + Math.sin(l.angle) * l.length * frac - Math.cos(l.angle) * jit
              );
            }
            ctx.stroke();
          }
        }

        if (!alive) clicks.current.splice(ci, 1);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mouseover", onHover);
      document.body.style.cursor = "";
      styleEl.remove();
    };
  }, [isMobile, spawnClick]);

  if (isMobile) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 z-[9999] pointer-events-none" />;
};

export default FuturisticCursor;
