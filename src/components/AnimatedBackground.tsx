import { useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  pulseSpeed: number;
  pulsePhase: number;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const ripples = useRef<{ x: number; y: number; radius: number; opacity: number }[]>([]);
  const isMobile = useIsMobile();
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const gradientOffsetRef = useRef(0);

  const createParticles = useCallback((width: number, height: number) => {
    const count = isMobile ? 35 : 70;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 2.5,
        opacity: 0.15 + Math.random() * 0.4,
        hue: [180, 220, 263][Math.floor(Math.random() * 3)],
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      particlesRef.current = createParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const connectionDistance = isMobile ? 120 : 160;
    const mouseRadius = 180;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      ripples.current.push({ x: e.clientX, y: e.clientY, radius: 0, opacity: 0.4 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const animate = () => {
      const width = w();
      const height = h();
      timeRef.current += 0.008;
      gradientOffsetRef.current += 0.001;
      const t = timeRef.current;
      const gOff = gradientOffsetRef.current;

      // --- Gradient background ---
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      const shift = Math.sin(gOff) * 0.08;
      bgGrad.addColorStop(0, `hsl(222, 47%, ${2 + shift * 3}%)`);
      bgGrad.addColorStop(0.4, `hsl(240, 30%, ${5 + shift * 2}%)`);
      bgGrad.addColorStop(0.7, `hsl(263, 25%, ${4 + shift * 2}%)`);
      bgGrad.addColorStop(1, `hsl(222, 47%, ${2 + shift}%)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- Subtle grid dots ---
      if (!isMobile) {
        const gridSpacing = 60;
        ctx.fillStyle = "rgba(0, 255, 255, 0.015)";
        for (let gx = 0; gx < width; gx += gridSpacing) {
          for (let gy = 0; gy < height; gy += gridSpacing) {
            ctx.beginPath();
            ctx.arc(gx, gy, 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // --- Gradient wave layers ---
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        const baseY = height * (0.5 + layer * 0.15);
        const amplitude = 40 + layer * 20;
        const frequency = 0.002 - layer * 0.0003;
        const speed = t * (0.8 + layer * 0.3);

        for (let x = 0; x <= width; x += 4) {
          const y = baseY + Math.sin(x * frequency + speed) * amplitude + Math.sin(x * frequency * 2.3 + speed * 0.7) * (amplitude * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const waveHue = [220, 263, 200][layer];
        const waveGrad = ctx.createLinearGradient(0, baseY - amplitude, 0, height);
        waveGrad.addColorStop(0, `hsla(${waveHue}, 60%, 30%, ${0.02 - layer * 0.005})`);
        waveGrad.addColorStop(1, "transparent");
        ctx.fillStyle = waveGrad;
        ctx.fill();
      }

      // --- Particles & connections ---
      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active && !isMobile;

      // Update & draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Mouse repulsion
        if (mouseActive) {
          const dmx = p.x - mx;
          const dmy = p.y - my;
          const distM = Math.sqrt(dmx * dmx + dmy * dmy);
          if (distM < mouseRadius && distM > 0) {
            const force = (mouseRadius - distM) / mouseRadius * 0.015;
            p.vx += (dmx / distM) * force;
            p.vy += (dmy / distM) * force;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Wrap around
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12;
            const avgHue = (p.hue + q.hue) / 2;
            ctx.strokeStyle = `hsla(${avgHue}, 80%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const pulse = Math.sin(t * 3 + p.pulsePhase) * 0.15 + 0.85;
        const currentOpacity = p.opacity * pulse;
        const currentSize = p.size * pulse;

        // Glow
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
        glowGrad.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${currentOpacity * 0.3})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(p.x - currentSize * 4, p.y - currentSize * 4, currentSize * 8, currentSize * 8);

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${currentOpacity})`;
        ctx.fill();
      }

      // --- Mouse glow ---
      if (mouseActive) {
        const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        mouseGlow.addColorStop(0, "hsla(180, 100%, 50%, 0.03)");
        mouseGlow.addColorStop(0.5, "hsla(263, 70%, 50%, 0.015)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(mx - 200, my - 200, 400, 400);
      }

      // --- Ripples ---
      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const r = ripples.current[i];
        r.radius += 2.5;
        r.opacity -= 0.006;
        if (r.opacity <= 0) {
          ripples.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(180, 100%, 50%, ${r.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, [isMobile, createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default AnimatedBackground;
