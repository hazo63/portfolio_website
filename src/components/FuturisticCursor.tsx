import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface ClickBurst {
  x: number;
  y: number;
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
    life: number;
  }[];
  ripples: { radius: number; opacity: number }[];
  arcs: { angle: number; length: number; opacity: number; segments: number[] }[];
}

const FuturisticCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animRef = useRef(0);
  const mouse = useRef({ x: -100, y: -100, px: -100, py: -100, speed: 0, active: false });
  const trail = useRef<TrailParticle[]>([]);
  const bursts = useRef<ClickBurst[]>([]);
  const cursorState = useRef({ scale: 1, targetScale: 1, glow: 1, targetGlow: 1, pulse: 0 });
  const hovering = useRef<"none" | "button" | "link" | "card">("none");
  const timeRef = useRef(0);

  const spawnTrail = useCallback((x: number, y: number, speed: number) => {
    const count = Math.min(Math.floor(speed * 0.3) + 1, 4);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = 0.3 + Math.random() * 0.8;
      const life = 20 + Math.random() * 25 + speed * 2;
      trail.current.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        size: 1 + Math.random() * 2,
        opacity: 0.4 + Math.min(speed * 0.02, 0.4),
        hue: [180, 220, 263][Math.floor(Math.random() * 3)],
        life,
        maxLife: life,
      });
    }
    // Cap trail particles
    if (trail.current.length > 120) trail.current.splice(0, trail.current.length - 120);
  }, []);

  const spawnBurst = useCallback((x: number, y: number) => {
    const particles = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        size: 1 + Math.random() * 2.5,
        opacity: 0.8 + Math.random() * 0.2,
        hue: [180, 220, 263][Math.floor(Math.random() * 3)],
        life: 30 + Math.random() * 20,
      });
    }
    const arcs = [];
    for (let i = 0; i < 5; i++) {
      const segs = [];
      let r = 0;
      for (let s = 0; s < 4 + Math.floor(Math.random() * 3); s++) {
        r += 8 + Math.random() * 16;
        segs.push(r);
      }
      arcs.push({
        angle: Math.random() * Math.PI * 2,
        length: 30 + Math.random() * 50,
        opacity: 0.7 + Math.random() * 0.3,
        segments: segs,
      });
    }
    bursts.current.push({
      x, y, particles,
      ripples: [{ radius: 0, opacity: 0.6 }, { radius: 0, opacity: 0.3 }],
      arcs,
    });
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Hide default cursor
    document.body.style.cursor = "none";
    const styleEl = document.createElement("style");
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }
      a, button, [role="button"], input, select, textarea, label { cursor: none !important; }`;
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
      const m = mouse.current;
      m.px = m.x;
      m.py = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
      m.speed = Math.sqrt((m.x - m.px) ** 2 + (m.y - m.py) ** 2);
      m.active = true;
    };

    const onLeave = () => { mouse.current.active = false; };

    const onClick = (e: MouseEvent) => {
      spawnBurst(e.clientX, e.clientY);
      cursorState.current.targetScale = 0.5;
      cursorState.current.targetGlow = 2.5;
      setTimeout(() => {
        cursorState.current.targetScale = hovering.current === "button" ? 1.6 : 1;
        cursorState.current.targetGlow = hovering.current === "button" ? 1.8 : 1;
      }, 120);
    };

    const onHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cs = cursorState.current;
      if (target.closest("button, [role='button'], .btn-glow, .btn-outline-glow")) {
        hovering.current = "button";
        cs.targetScale = 1.6;
        cs.targetGlow = 1.8;
      } else if (target.closest("a")) {
        hovering.current = "link";
        cs.targetScale = 1.3;
        cs.targetGlow = 1.4;
      } else if (target.closest(".glass-card, .card, img")) {
        hovering.current = "card";
        cs.targetScale = 1.2;
        cs.targetGlow = 1.3;
      } else {
        hovering.current = "none";
        cs.targetScale = 1;
        cs.targetGlow = 1;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onHover);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 0.016;
      const t = timeRef.current;
      const m = mouse.current;
      const cs = cursorState.current;

      // Lerp cursor state
      cs.scale += (cs.targetScale - cs.scale) * 0.15;
      cs.glow += (cs.targetGlow - cs.glow) * 0.12;
      cs.pulse = Math.sin(t * 4) * 0.15 + 0.85;

      if (m.active) {
        // Spawn trail
        if (m.speed > 1) spawnTrail(m.x, m.y, m.speed);

        // --- Draw trail particles ---
        for (let i = trail.current.length - 1; i >= 0; i--) {
          const p = trail.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life--;
          if (p.life <= 0) { trail.current.splice(i, 1); continue; }
          const alpha = (p.life / p.maxLife) * p.opacity;
          // Glow
          const gRad = p.size * 3;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gRad);
          grd.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha * 0.4})`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.fillRect(p.x - gRad, p.y - gRad, gRad * 2, gRad * 2);
          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${alpha})`;
          ctx.fill();
        }

        // --- Draw trail connections ---
        ctx.lineWidth = 0.4;
        const tp = trail.current;
        for (let i = 0; i < tp.length; i++) {
          for (let j = i + 1; j < tp.length; j++) {
            const dx = tp[i].x - tp[j].x;
            const dy = tp[i].y - tp[j].y;
            const dist = dx * dx + dy * dy;
            if (dist < 2500) {
              const a = (1 - dist / 2500) * 0.08 * Math.min(tp[i].life / tp[i].maxLife, tp[j].life / tp[j].maxLife);
              ctx.strokeStyle = `hsla(200, 80%, 65%, ${a})`;
              ctx.beginPath();
              ctx.moveTo(tp[i].x, tp[i].y);
              ctx.lineTo(tp[j].x, tp[j].y);
              ctx.stroke();
            }
          }
        }

        // --- Main cursor ---
        const baseSize = 6 * cs.scale * cs.pulse;
        const flicker = 0.9 + Math.random() * 0.2;

        // Card halo
        if (hovering.current === "card") {
          const haloGrd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 40);
          haloGrd.addColorStop(0, "hsla(200, 100%, 60%, 0.06)");
          haloGrd.addColorStop(1, "transparent");
          ctx.fillStyle = haloGrd;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 40, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer glow
        const glowSize = baseSize * 5 * cs.glow * flicker;
        const outerGrd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, glowSize);
        outerGrd.addColorStop(0, `hsla(190, 100%, 65%, ${0.15 * cs.glow})`);
        outerGrd.addColorStop(0.4, `hsla(240, 80%, 60%, ${0.06 * cs.glow})`);
        outerGrd.addColorStop(1, "transparent");
        ctx.fillStyle = outerGrd;
        ctx.fillRect(m.x - glowSize, m.y - glowSize, glowSize * 2, glowSize * 2);

        // Inner glow
        const innerGrd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, baseSize * 2.5);
        innerGrd.addColorStop(0, `hsla(180, 100%, 85%, ${0.7 * flicker})`);
        innerGrd.addColorStop(0.5, `hsla(200, 100%, 65%, ${0.3 * flicker})`);
        innerGrd.addColorStop(1, "transparent");
        ctx.fillStyle = innerGrd;
        ctx.beginPath();
        ctx.arc(m.x, m.y, baseSize * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright core (stretch with speed)
        const stretch = Math.min(m.speed * 0.08, 1.5);
        const angle = Math.atan2(m.y - m.py, m.x - m.px);
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(angle);
        ctx.scale(1 + stretch, 1 / (1 + stretch * 0.3));
        ctx.beginPath();
        ctx.arc(0, 0, baseSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(180, 100%, 92%, ${0.9 * flicker})`;
        ctx.fill();
        ctx.restore();
      }

      // --- Click bursts ---
      for (let bi = bursts.current.length - 1; bi >= 0; bi--) {
        const b = bursts.current[bi];
        let alive = false;

        // Ripples
        for (const r of b.ripples) {
          r.radius += 4;
          r.opacity -= 0.015;
          if (r.opacity > 0) {
            alive = true;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(190, 100%, 60%, ${r.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Lightning arcs
        for (const arc of b.arcs) {
          arc.opacity -= 0.025;
          if (arc.opacity > 0) {
            alive = true;
            ctx.strokeStyle = `hsla(200, 100%, 80%, ${arc.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            let cx = b.x, cy = b.y;
            ctx.moveTo(cx, cy);
            for (const seg of arc.segments) {
              const jitter = (Math.random() - 0.5) * 12;
              cx = b.x + Math.cos(arc.angle) * seg + Math.sin(arc.angle) * jitter;
              cy = b.y + Math.sin(arc.angle) * seg - Math.cos(arc.angle) * jitter;
              ctx.lineTo(cx, cy);
            }
            ctx.stroke();
          }
        }

        // Burst particles
        for (let pi = b.particles.length - 1; pi >= 0; pi--) {
          const p = b.particles[pi];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.life--;
          p.opacity -= 0.025;
          if (p.life <= 0 || p.opacity <= 0) { b.particles.splice(pi, 1); continue; }
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (p.opacity / 0.8), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
          ctx.fill();
        }

        if (!alive) bursts.current.splice(bi, 1);
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
  }, [isMobile, spawnTrail, spawnBurst]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
    />
  );
};

export default FuturisticCursor;
