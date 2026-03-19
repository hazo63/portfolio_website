import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader = ({ onComplete }: PreloaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "expo.inOut",
          onComplete,
        });
      },
    });

    tl.to(
      { val: 0 },
      {
        val: 100,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: function () {
          setProgress(Math.round(this.targets()[0].val));
        },
      }
    );

    tl.to(barRef.current, { scaleX: 1, duration: 2.5, ease: "power2.inOut" }, 0);

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-foreground mb-2">
        MOHAMED HAZEM
      </h1>
      <p className="font-mono-data text-sm text-muted-foreground mb-12">
        Data Engineer | Cloud | AI
      </p>
      <p className="font-mono-data text-xs text-primary mb-4">{progress}%</p>
      <div className="w-64 h-px bg-muted-foreground/20 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-primary origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
};

export default Preloader;
