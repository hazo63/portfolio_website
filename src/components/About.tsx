import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import portfolioImg from "@/assets/portfolio.jpg";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-card", {
        scrollTrigger: { trigger: ".about-card", start: "top bottom-=100", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 60,
        filter: "blur(10px)",
        duration: 1,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={ref} className="py-24 sm:py-32">
      <div className="section-container">
        <div className="about-card glass-card p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10 max-w-4xl mx-auto">
          <div className="shrink-0">
            <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-primary/50 glow-shadow" style={{ outlineOffset: "4px" }}>
              <img src={portfolioImg} alt="Mohamed Hazem" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              About <span className="text-primary">Me</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Passionate about building end-to-end data solutions, I combine Cloud, Big Data, and Data Science to transform raw data into scalable systems and actionable insights that drive real impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
