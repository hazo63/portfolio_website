import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const Education = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".edu-item", {
        scrollTrigger: { trigger: ".edu-item", start: "top bottom-=80", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-20">
      <div className="section-container">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-12 text-center">
          Education
        </h2>
        <div className="edu-item glass-card glow-border p-8 max-w-2xl mx-auto flex items-start gap-5">
          <div className="shrink-0 mt-1">
            <GraduationCap size={32} className="text-primary" weight="thin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Bachelor of Data Science & AI</h3>
            <p className="text-muted-foreground text-sm mt-1">Sadat Academy for Management Sciences</p>
            <p className="font-mono-data text-xs text-primary mt-2">2023 – 2027</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
