import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Certificate } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const certs = [
  "AWS Academy Cloud Architecting",
  "AWS Academy Cloud Foundations",
  "Huawei HCCDA Tech Essentials",
  "NTI Python Programming",
  "NTI Cloud Services Management & Operation",
  "GDSC C++ Programming",
];

const Certifications = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cert-card", {
        scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-20">
      <div className="section-container">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-12 text-center">
          Certifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {certs.map((cert) => (
            <div
              key={cert}
              className="cert-card glass-card glow-border p-5 flex items-start gap-3 hover:glow-shadow transition-shadow duration-300"
            >
              <Certificate size={24} className="text-primary shrink-0 mt-0.5" weight="thin" />
              <span className="text-sm text-foreground/90">{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
