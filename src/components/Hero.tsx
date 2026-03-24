import { useEffect, useRef } from "react";
import gsap from "gsap";

const Hero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
        delay: 0.2,
      });
      gsap.from(".hero-sub", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.8,
      });
      gsap.from(".hero-cta", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 1.1,
        stagger: 0.15,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/orb-ieVW6sdV0Qjqn6AuBXUoPuhr/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full"
          loading="lazy"
          title="3D Orb"
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center section-container pt-16">
        <p className="hero-title font-mono-data text-xs text-primary mb-4 uppercase">
          // Data Engineer & AI Enthusiast
        </p>
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight max-w-4xl mx-auto" style={{ textWrap: "balance" as any }}>
          Hi, I'm <span className="text-glow text-primary">Mohamed Hazem</span>
        </h1>
        <p className="hero-sub text-lg sm:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          Building Scalable Data Pipelines & Cloud Solutions
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a href="#projects" className="hero-cta btn-glow">
            View Projects
          </a>
          <a href="#contact" className="hero-cta btn-outline-glow">
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
