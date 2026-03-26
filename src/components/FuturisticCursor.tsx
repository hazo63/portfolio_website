import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrbitDot {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  baseOpacity: number;
  group: "cw" | "ccw";
  trail: { x: number; y: number; opacity: number }[];
}

interface ClickEffect {
  age: number;
  burstProgress: number;
  phase: "burst" | "return";
  rippleRadius: number;
  rippleOpacity: number;
}

const FuturisticCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animRef = useRef(0);
  const mouse = useRef({ x: -100, y: -100, active: false });
  const smooth = useRef({ x: -100, y: -100 });
  const clickFx = useRef<ClickEffect | null>(null);
  const state = useRef({
    scale: 1, targetScale: 1,
    glow: 0.5, targetGlow: 0.5,
    breath: 0,
  });
  const hovering = useRef<"none" | "button" | "link" | "card">("none");

  // 6 dots: 3 clockwise, 3 counter-clockwise
  const dots = useRef<OrbitDot[]>([
    { angle: 0, speed: 0.012, radius: 28, size: 2.4, baseOpacity: 0.85, group: "cw", trail: [] },
    { angle: Math.PI * 0.667, speed: 0.013, radius: 28, size: 2.0, baseOpacity: 0.7, group: "cw", trail: [] },
    { angle: Math.PI * 1.333, speed: 0.011, radius: 28, size: 2.2, baseOpacity: 0.75, group: "cw", trail: [] },
    { angle: Math.PI * 0.333, speed: 0.014, radius: 32, size: 2.2, baseOpacity: 0.8, group: "ccw", trail: [] },
    { angle: Math.PI, speed: 0.012, radius: 32, size: 1.8, baseOpacity: 0.65, group: "ccw", trail: [] },
    { angle: Math.PI * 1.667, speed: 0.013, radius: 32, size: 2.0, baseOpacity: 0.7, group: "ccw", trail: [] },
  ]);

  const spawnClick = useCallback(() => {
    clickFx.current = { age: 0, burstProgress: 0, phase: "burst", rippleRadius: 0, rippleOpacity: 0.2 };
    state.current.targetScale = 0.9;
    state.current.targetGlow = 1;
    setTimeout(() => {
      state.current.targetScale = hovering.current === "button" ? 1.08 : 1;
      state.current.targetGlow = hovering.current === "button" ? 0.7 : 0.5;
    }, 120);
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

    const onMove = (e: MouseEvent) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; mouse.current.active = true; };
    const onLeave = () => { mouse.current.active = false; };
    const onClick = () => { spawnClick(); };
    const onHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const s = state.current;
      if (target.closest("button, [role='button'], .btn-glow, .btn-outline-glow")) {
        hovering.current = "button"; s.targetScale = 1.08; s.targetGlow = 0.7;
      } else if (target.closest("a")) {
        hovering.current = "link"; s.targetScale = 1.04; s.targetGlow = 0.6;
      } else if (target.closest(".glass-card, .card, img")) {
        hovering.current = "card"; s.targetScale = 1.02; s.targetGlow = 0.55;
      } else {
        hovering.current = "none"; s.targetScale = 1; s.targetGlow = 0.5;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onHover);

    const drawArrow = (cx: number, cy: number, scale: number, glow: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      const s = scale * 0.85;

      const ax = 0, ay = 0;
      const bx = -8 * s, by = 22 * s;
      const cx2 = -2.5 * s, cy2 = 17 * s;
      const dx = -2.5 * s, dy = 28 * s;
      const ex = 3.5 * s, ey = 20 * s;
      const fx = 12 * s, fy = 14 * s;

      ctx.shadowColor = `hsla(195, 85%, 60%, ${0.35 * glow})`;
      ctx.shadowBlur = 10 * glow;

      const grad = ctx.createLinearGradient(ax, ay, dx, dy);
      grad.addColorStop(0, `hsla(200, 80%, 70%, ${0.35 * glow})`);
      grad.addColorStop(0.5, `hsla(210, 70%, 55%, ${0.25 * glow})`);
      grad.addColorStop(1, `hsla(230, 60%, 45%, ${0.15 * glow})`);

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(fx, fy);
      ctx.lineTo(ex, ey);
      ctx.lineTo(dx, dy);
      ctx.lineTo(cx2, cy2);
      ctx.lineTo(bx, by);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = `hsla(195, 75%, 65%, ${0.45 * glow})`;
      ctx.lineWidth = 1.1;
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ax, ay + 2 * s);
      ctx.lineTo(-1 * s, 12 * s);
      ctx.strokeStyle = `hsla(195, 90%, 80%, ${0.18 * glow})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;
      const sm = smooth.current;
      const s = state.current;

      sm.x += (m.x - sm.x) * 0.14;
      sm.y += (m.y - sm.y) * 0.14;
      s.scale += (s.targetScale - s.scale) * 0.12;
      s.glow += (s.targetGlow - s.glow) * 0.08;
      s.breath += 0.02;

      if (!m.active) { animRef.current = requestAnimationFrame(animate); return; }

      const cx = sm.x, cy = sm.y;
      const orbitCx = cx + 2, orbitCy = cy + 14;

      // Click effect
      const cf = clickFx.current;
      let burstMult = 1;
      if (cf) {
        cf.age++;
        if (cf.phase === "burst") {
          cf.burstProgress = Math.min(cf.burstProgress + 0.07, 1);
          burstMult = 1 + cf.burstProgress * 0.6;
          if (cf.burstProgress >= 1) cf.phase = "return";
        } else {
          cf.burstProgress = Math.max(cf.burstProgress - 0.035, 0);
          burstMult = 1 + cf.burstProgress * 0.6;
          if (cf.burstProgress <= 0) clickFx.current = null;
        }
        cf.rippleRadius += 2;
        cf.rippleOpacity -= 0.004;
        if (cf.rippleOpacity > 0) {
          ctx.beginPath();
          ctx.arc(orbitCx, orbitCy, cf.rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(195, 70%, 65%, ${cf.rippleOpacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        if (cf.age < 12) {
          const ringOp = (1 - cf.age / 12) * 0.1;
          ctx.beginPath();
          ctx.arc(orbitCx, orbitCy, 30 * burstMult, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(200, 80%, 70%, ${ringOp})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Faint orbit paths
      const r1 = 28 * s.scale * burstMult;
      const r2 = 32 * s.scale * burstMult;
      ctx.beginPath();
      ctx.arc(orbitCx, orbitCy, r1, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(210, 50%, 60%, ${0.04 * s.glow})`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(orbitCx, orbitCy, r2, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(230, 50%, 55%, ${0.03 * s.glow})`;
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Draw orbiting dots with trails
      for (const dot of dots.current) {
        const dir = dot.group === "cw" ? 1 : -1;
        dot.angle += dot.speed * dir;

        const currentRadius = dot.radius * s.scale * burstMult;
        const dx = orbitCx + Math.cos(dot.angle) * currentRadius;
        const dy = orbitCy + Math.sin(dot.angle) * currentRadius;

        // 3D depth: use sin of angle for scale/opacity variation
        const depthFactor = 0.5 + 0.5 * Math.sin(dot.angle);
        const dotScale = 0.7 + depthFactor * 0.5;
        const dotOpacity = dot.baseOpacity * (0.5 + depthFactor * 0.5) * s.glow;

        // Pulse for links
        const pulseOp = hovering.current === "link"
          ? dotOpacity + Math.sin(s.breath * 3 + dot.angle) * 0.1
          : dotOpacity;

        // Update trail
        dot.trail.unshift({ x: dx, y: dy, opacity: pulseOp * 0.5 });
        if (dot.trail.length > 6) dot.trail.pop();

        // Draw trail
        for (let i = dot.trail.length - 1; i >= 1; i--) {
          const t = dot.trail[i];
          const fade = (1 - i / dot.trail.length) * t.opacity * 0.4;
          if (fade > 0.01) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, dot.size * dotScale * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(200, 80%, 70%, ${fade})`;
            ctx.fill();
          }
        }

        // Dot glow
        const grd = ctx.createRadialGradient(dx, dy, 0, dx, dy, dot.size * 3 * dotScale);
        grd.addColorStop(0, `hsla(195, 85%, 75%, ${pulseOp * 0.8})`);
        grd.addColorStop(0.5, `hsla(220, 70%, 60%, ${pulseOp * 0.3})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(dx, dy, dot.size * 3 * dotScale, 0, Math.PI * 2);
        ctx.fill();

        // Dot core
        ctx.beginPath();
        ctx.arc(dx, dy, dot.size * dotScale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(195, 90%, 82%, ${pulseOp})`;
        ctx.fill();
      }

      // Arrow on top
      drawArrow(cx, cy, s.scale, s.glow);

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
