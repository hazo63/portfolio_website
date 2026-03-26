import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrbitDot {
  angle: number;
  speed: number;
  baseRadius: number;
  radius: number;
  size: number;
  opacity: number;
  phase: number;
}

interface ClickEffect {
  age: number;
  burstProgress: number; // 0→1 burst, then 1→0 return
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
    orbitSpeed: 1, targetOrbitSpeed: 1,
    breath: 0,
  });
  const hovering = useRef<"none" | "button" | "link" | "card">("none");

  const dots = useRef<OrbitDot[]>([
    { angle: 0, speed: 0.018, baseRadius: 22, radius: 22, size: 2.2, opacity: 0.8, phase: 0 },
    { angle: Math.PI * 0.5, speed: 0.022, baseRadius: 24, radius: 24, size: 1.8, opacity: 0.65, phase: 1 },
    { angle: Math.PI, speed: 0.015, baseRadius: 20, radius: 20, size: 2.0, opacity: 0.75, phase: 2 },
    { angle: Math.PI * 1.5, speed: 0.02, baseRadius: 23, radius: 23, size: 1.6, opacity: 0.6, phase: 3 },
  ]);

  const spawnClick = useCallback(() => {
    clickFx.current = { age: 0, burstProgress: 0, phase: "burst", rippleRadius: 0, rippleOpacity: 0.25 };
    state.current.targetScale = 0.88;
    state.current.targetGlow = 1;
    setTimeout(() => {
      state.current.targetScale = hovering.current === "button" ? 1.1 : 1;
      state.current.targetGlow = hovering.current === "button" ? 0.75 : 0.5;
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

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };
    const onLeave = () => { mouse.current.active = false; };
    const onClick = () => { spawnClick(); };
    const onHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const s = state.current;
      if (target.closest("button, [role='button'], .btn-glow, .btn-outline-glow")) {
        hovering.current = "button"; s.targetScale = 1.1; s.targetGlow = 0.75; s.targetOrbitSpeed = 1.6;
      } else if (target.closest("a")) {
        hovering.current = "link"; s.targetScale = 1.05; s.targetGlow = 0.65; s.targetOrbitSpeed = 1.2;
      } else if (target.closest(".glass-card, .card, img")) {
        hovering.current = "card"; s.targetScale = 1.03; s.targetGlow = 0.6; s.targetOrbitSpeed = 1.1;
      } else {
        hovering.current = "none"; s.targetScale = 1; s.targetGlow = 0.5; s.targetOrbitSpeed = 1;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onHover);

    const drawArrow = (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, glow: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      const s = scale * 0.9;

      // Arrow path — sharp geometric triangle
      const ax = 0 * s, ay = 0 * s;
      const bx = -8 * s, by = 22 * s;
      const cx2 = -2.5 * s, cy2 = 17 * s;
      const dx = -2.5 * s, dy = 28 * s;
      const ex = 3.5 * s, ey = 20 * s;
      const fx = 12 * s, fy = 14 * s;

      // Outer glow
      ctx.shadowColor = `hsla(195, 85%, 60%, ${0.4 * glow})`;
      ctx.shadowBlur = 12 * glow;

      // Fill gradient
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

      // Outline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `hsla(195, 75%, 65%, ${0.5 * glow})`;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Inner highlight line
      ctx.beginPath();
      ctx.moveTo(ax, ay + 2 * s);
      ctx.lineTo(-1 * s, 12 * s);
      ctx.strokeStyle = `hsla(195, 90%, 80%, ${0.2 * glow})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;
      const sm = smooth.current;
      const s = state.current;

      // Smooth follow
      sm.x += (m.x - sm.x) * 0.14;
      sm.y += (m.y - sm.y) * 0.14;

      // Lerp state
      s.scale += (s.targetScale - s.scale) * 0.12;
      s.glow += (s.targetGlow - s.glow) * 0.08;
      s.orbitSpeed += (s.targetOrbitSpeed - s.orbitSpeed) * 0.06;
      s.breath += 0.025;

      if (!m.active) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const cx = sm.x, cy = sm.y;

      // Click effect processing
      const cf = clickFx.current;
      let burstMult = 1;
      if (cf) {
        cf.age++;
        if (cf.phase === "burst") {
          cf.burstProgress = Math.min(cf.burstProgress + 0.08, 1);
          burstMult = 1 + cf.burstProgress * 0.8; // radius up to 1.8x
          if (cf.burstProgress >= 1) { cf.phase = "return"; }
        } else {
          cf.burstProgress = Math.max(cf.burstProgress - 0.04, 0);
          burstMult = 1 + cf.burstProgress * 0.8;
          if (cf.burstProgress <= 0) { clickFx.current = null; }
        }
        // Ripple
        cf.rippleRadius += 2.5;
        cf.rippleOpacity -= 0.006;
        if (cf.rippleOpacity > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy + 18, cf.rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(195, 70%, 65%, ${cf.rippleOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        // Energy ring
        if (cf.age < 15) {
          const ringOp = (1 - cf.age / 15) * 0.15;
          ctx.beginPath();
          ctx.arc(cx, cy + 18, 18 * burstMult, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(200, 80%, 70%, ${ringOp})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Orbit center is below the arrow tip
      const orbitCx = cx, orbitCy = cy + 18;

      // Draw orbit path (very faint)
      const avgRadius = 22 * s.scale * burstMult;
      ctx.beginPath();
      ctx.arc(orbitCx, orbitCy, avgRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(210, 50%, 60%, ${0.06 * s.glow})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw orbiting dots
      for (const dot of dots.current) {
        dot.angle += dot.speed * s.orbitSpeed;
        dot.radius = dot.baseRadius * s.scale * burstMult;
        const dotScale = cf && cf.phase === "burst" ? 1 + cf.burstProgress * 0.2 : 1;
        const dotGlow = cf && cf.phase === "burst" ? s.glow + cf.burstProgress * 0.3 : s.glow;

        const dx = orbitCx + Math.cos(dot.angle) * dot.radius;
        const dy = orbitCy + Math.sin(dot.angle) * dot.radius;

        // Pulsing opacity for links
        const pulseOp = hovering.current === "link"
          ? dot.opacity + Math.sin(s.breath * 3 + dot.phase) * 0.15
          : dot.opacity;

        // Dot glow
        const dGrd = ctx.createRadialGradient(dx, dy, 0, dx, dy, dot.size * 3 * dotScale);
        dGrd.addColorStop(0, `hsla(195, 85%, 75%, ${pulseOp * dotGlow})`);
        dGrd.addColorStop(0.5, `hsla(220, 70%, 60%, ${pulseOp * dotGlow * 0.4})`);
        dGrd.addColorStop(1, "transparent");
        ctx.fillStyle = dGrd;
        ctx.beginPath();
        ctx.arc(dx, dy, dot.size * 3 * dotScale, 0, Math.PI * 2);
        ctx.fill();

        // Dot core
        ctx.beginPath();
        ctx.arc(dx, dy, dot.size * dotScale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(195, 90%, 80%, ${pulseOp * dotGlow})`;
        ctx.fill();
      }

      // Draw the arrow cursor on top
      drawArrow(ctx, cx, cy, s.scale, s.glow);

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
