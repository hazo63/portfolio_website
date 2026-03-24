import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import certHccda from "@/assets/cert-hccda-tech.png";
import certPython from "@/assets/cert-python-nti.jpg";
import certArchitecting from "@/assets/cert-cloud-architecting.jpg";
import certFoundations from "@/assets/cert-cloud-foundations.jpg";
import certCloudServices from "@/assets/cert-cloud-services.jpg";
import certCpp from "@/assets/cert-cpp-gdsc.png";
import certEfset from "@/assets/cert-efset.png";
import certEfsetEnglish from "@/assets/cert-efset-english.jpg";

gsap.registerPlugin(ScrollTrigger);

interface CertData {
  title: string;
  org: string;
  year: string;
  image: string;
  score?: string;
  level?: string;
  skills?: string[];
  description?: string;
}

const certs: CertData[] = [
  { title: "HCCDA Tech Essentials", org: "Huawei", year: "2025", image: certHccda },
  { title: "Programming using Python", org: "NTI", year: "2025", image: certPython },
  { title: "AWS Academy Cloud Architecting", org: "AWS Academy", year: "2025", image: certArchitecting },
  { title: "AWS Academy Cloud Foundations", org: "AWS Academy", year: "2025", image: certFoundations },
  { title: "Cloud Services Management & Operation", org: "NTI", year: "2025", image: certCloudServices },
  { title: "Programming using C++", org: "GDSC", year: "2024", image: certCpp },
  { title: "SmallTalk English Speaking Level Test Certificate (B2 – Upper-Intermediate)", org: "SmallTalk", year: "2024", image: certEfset },
  {
    title: "EF SET English Certificate (B2)",
    org: "EF SET",
    year: "2021",
    image: certEfsetEnglish,
    level: "B2 Upper Intermediate",
    description: "Demonstrates strong English proficiency with the ability to communicate effectively in academic and professional environments.",
  },
];

const Certifications = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<CertData | null>(null);

  useEffect(() => {
    const cards = ref.current?.querySelectorAll(".cert-card");
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cert-card",
        { opacity: 0, scale: 0.9 },
        {
          scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none none" },
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="certifications" ref={ref} className="py-20">
      <div className="section-container">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-12 text-center">
          Certifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {certs.map((cert) => (
            <button
              key={cert.title}
              onClick={() => setSelected(cert)}
              className="cert-card glass-card glow-border overflow-hidden rounded-xl text-left group hover:glow-shadow transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-background/50">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground leading-tight">{cert.title}</h3>
                {cert.level && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/20 text-primary border border-primary/30">
                    {cert.level}
                  </span>
                )}
                {cert.score && (
                  <p className="mt-1.5 font-mono-data text-xs text-foreground/80">
                    Score: <span className="text-primary font-semibold">{cert.score}</span>
                  </p>
                )}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded text-[10px] font-mono-data bg-muted text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono-data text-xs text-primary">{cert.org}</span>
                  <span className="font-mono-data text-xs text-muted-foreground">{cert.year}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selected?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selected?.org} · {selected?.year}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="w-full max-h-[70vh] overflow-auto rounded-lg">
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Certifications;
