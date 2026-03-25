import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Node {
  ox: number; oy: number; // offset from center (-1 to 1 range)
  phase: number; speed: number;
  radius: number;
}

interface ClickEffect {
  x: number; y: number; age: number;
  rippleRadius: number; rippleOpacity: number;
  nodeGlow: number;
}

const FuturisticCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animRef = useRef(0);
  const mouse = useRef({ x: -100, y: -100, active: false });
  const smooth = useRef({ x: -100, y: -100 });
  const clicks = useRef<ClickEffect[]>([]);
  const state = useRef({
    scale: 1, targetScale: 1,
    glow: 0.5, targetGlow: 0.5,
    breath: 0, compress: 0,
  });
  const hovering = useRef<"none" | "button" | "link" | "card">("none");
  const trailDots = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const lastTrail = useRef(0);

  // 4 data nodes inside diamond
  const nodes = useRef<Node[]>([
    { ox: 0, oy: -0.45, phase: 0, speed: 0.008, radius: 1.8 },
    { ox: 0.4, oy: 0.1, phase: 1.5, speed: 0.012, radius: 1.5 },
    { ox: -0.35, oy: 0.2, phase: 3.0, speed: 0.01, radius: 1.6 },
    { ox: 0.05, oy: 0.4, phase: 4.5, speed: 0.009, radius: 1.4 },
  ]);

  // Connections between nodes (indices)
  const edges = useRef([[0, 1], [0, 2], [1, 3], [2, 3]]);

  const spawnClick = useCallback((x: number, y: number) => {
    clicks.current.push({ x, y, age: 0, rippleRadius: 0, rippleOpacity: 0.3, nodeGlow: 1 });
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
    const onClick = () => {
      spawnClick(smooth.current.x, smooth.current.y);
      state.current.compress = 1;
      state.current.targetScale = 0.88;
      state.current.targetGlow = 1;
      setTimeout(() => {
        state.current.compress = 0;
        state.current.targetScale = hovering.current === "button" ? 1.08 : 1;
        state.current.targetGlow = hovering.current === "button" ? 0.7 : 0.5;
      }, 120);
    };
    const onHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const s = state.current;
      if (target.closest("button, [role='button'], .btn-glow, .btn-outline-glow")) {
        hovering.current = "button"; s.targetScale = 1.08; s.targetGlow = 0.7;
      } else if (target.closest("a")) {
        hovering.current = "link"; s.targetScale = 1.04; s.targetGlow = 0.65;
      } else if (target.closest(".glass-card, .card, img")) {
        hovering.current = "card"; s.targetScale = 1.02; s.targetGlow = 0.6;
      } else {
        hovering.current = "none"; s.targetScale = 1; s.targetGlow = 0.5;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseover", onHover);

    const DIAMOND_SIZE = 16; // half-diagonal

    const animate = () => {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;
      const sm = smooth.current;
      const s = state.current;

      // Smooth follow
      sm.x += (m.x - sm.x) * 0.15;
      sm.y += (m.y - sm.y) * 0.15;

      // Lerp state
      s.scale += (s.targetScale - s.scale) * 0.1;
      s.glow += (s.targetGlow - s.glow) * 0.08;
      s.breath += 0.02;
      const breathVal = Math.sin(s.breath) * 0.04 + 0.96;

      if (!m.active) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const cx = sm.x, cy = sm.y;
      const size = DIAMOND_SIZE * s.scale * breathVal;

      // Subtle trail dots
      const now = performance.now();
      if (now - lastTrail.current > 60) {
        lastTrail.current = now;
        trailDots.current.push({ x: cx, y: cy, opacity: 0.15 });
        if (trailDots.current.length > 12) trailDots.current.shift();
      }
      for (let i = trailDots.current.length - 1; i >= 0; i--) {
        const d = trailDots.current[i];
        d.opacity -= 0.008;
        if (d.opacity <= 0) { trailDots.current.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2 * d.opacity * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(220, 50%, 70%, ${d.opacity})`;
        ctx.fill();
      }

      // Card halo
      if (hovering.current === "card") {
        const hGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 2.5);
        hGrd.addColorStop(0, "hsla(220, 70%, 65%, 0.035)");
        hGrd.addColorStop(1, "transparent");
        ctx.fillStyle = hGrd;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer glow
      const glowSize = size * 1.8;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
      grd.addColorStop(0, `hsla(220, 70%, 70%, ${0.08 * s.glow})`);
      grd.addColorStop(0.6, `hsla(260, 50%, 60%, ${0.03 * s.glow})`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(cx - glowSize, cy - glowSize, glowSize * 2, glowSize * 2);

      // Diamond shape (rotated 45°)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);

      // Diamond fill (glassmorphism)
      const dSize = size * 0.85;
      ctx.beginPath();
      ctx.rect(-dSize, -dSize, dSize * 2, dSize * 2);
      const fillGrd = ctx.createLinearGradient(-dSize, -dSize, dSize, dSize);
      fillGrd.addColorStop(0, `hsla(220, 60%, 65%, ${0.06 * s.glow})`);
      fillGrd.addColorStop(1, `hsla(260, 50%, 55%, ${0.04 * s.glow})`);
      ctx.fillStyle = fillGrd;
      ctx.fill();

      // Diamond outline
      ctx.strokeStyle = `hsla(220, 60%, 70%, ${0.25 * s.glow})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Data nodes & edges (drawn in rotated space, so they appear inside diamond)
      // But node positions need to counter-rotate to stay "upright" feeling
      const nodePositions: { x: number; y: number }[] = [];
      const clickGlow = clicks.current.length > 0 ? clicks.current[0].nodeGlow * 0.3 : 0;

      for (const n of nodes.current) {
        n.phase += n.speed;
        const jx = Math.sin(n.phase) * 1.5;
        const jy = Math.cos(n.phase * 0.7 + 1) * 1.5;
        const nx = n.ox * dSize * 0.7 + jx;
        const ny = n.oy * dSize * 0.7 + jy;
        nodePositions.push({ x: nx, y: ny });
      }

      // Draw edges
      ctx.lineWidth = 0.6;
      for (const [a, b] of edges.current) {
        const pa = nodePositions[a], pb = nodePositions[b];
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `hsla(220, 50%, 70%, ${0.15 + clickGlow})`;
        ctx.stroke();
      }

      // Draw nodes
      for (const p of nodePositions) {
        const baseAlpha = 0.5 + clickGlow;
        const nodeGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 2.5);
        nodeGrd.addColorStop(0, `hsla(210, 80%, 80%, ${baseAlpha})`);
        nodeGrd.addColorStop(1, `hsla(250, 60%, 65%, ${baseAlpha * 0.3})`);
        ctx.fillStyle = nodeGrd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Click effects
      for (let ci = clicks.current.length - 1; ci >= 0; ci--) {
        const c = clicks.current[ci];
        c.age++;
        c.rippleRadius += 2;
        c.rippleOpacity -= 0.008;
        c.nodeGlow *= 0.94;

        if (c.rippleOpacity > 0) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(220, 60%, 70%, ${c.rippleOpacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        if (c.rippleOpacity <= 0 && c.nodeGlow < 0.01) {
          clicks.current.splice(ci, 1);
        }
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
