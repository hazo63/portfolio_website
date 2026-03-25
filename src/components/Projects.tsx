import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "@phosphor-icons/react";

import medicalImg from "@/assets/medical-project.png";
import cafeImg from "@/assets/cafe-aws.png";
import s3Img from "@/assets/s3-aws.png";
import hospitalImg from "@/assets/hospital-management.jpg";
import bankImg from "@/assets/bank-management.jpg";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "Medical Data Analysis",
    description: "Data analysis on 11K+ medicines to uncover trends and insights.",
    fullDescription: "Comprehensive analysis of over 11,000 medicines using Python data science stack. Identified key trends in drug efficacy, pricing patterns, and market distribution using statistical analysis and visualization techniques.",
    image: medicalImg,
    tech: ["Python", "Pandas", "NumPy", "Matplotlib"],
  },
  {
    title: "Café Website on AWS Cloud",
    description: "Scalable cloud-based website using EC2, S3, and RDS.",
    fullDescription: "Designed and deployed a fully scalable café web application on AWS Cloud infrastructure. Utilized EC2 for compute, S3 for static asset storage, RDS for database management, and implemented IAM roles for secure multi-region deployment.",
    image: cafeImg,
    tech: ["AWS", "EC2", "S3", "RDS"],
  },
  {
    title: "AWS S3 File Gateway",
    description: "Hybrid storage solution connecting on-prem systems with AWS.",
    fullDescription: "Built a hybrid cloud storage architecture using AWS S3 File Gateway to seamlessly connect on-premises systems with cloud storage. Implemented cross-region replication for disaster recovery and high availability.",
    image: s3Img,
    tech: ["AWS", "S3", "Storage Gateway"],
  },
  {
    title: "Hospital Management System",
    description: "System for managing patients, billing, and records.",
    fullDescription: "Full-featured hospital management application built with Python and SQL. Includes patient records management, appointment scheduling, staff management, medical inventory, billing system, and electronic records with data retrieval capabilities.",
    image: hospitalImg,
    tech: ["Python", "SQL", "OOP"],
  },
  {
    title: "Bank Management System",
    description: "Banking system for transactions and account management.",
    fullDescription: "Object-oriented banking management system built with C++. Features account creation, deposits, withdrawals, fund transfers, and transaction history tracking with persistent data storage.",
    image: bankImg,
    tech: ["C++", "OOP"],
  },
];

interface Project {
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  tech: string[];
}

const Projects = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".project-card", {
        scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section id="projects" ref={ref} className="py-20">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-12 text-center">
            Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {projects.map((p) => (
              <div
                key={p.title}
                onClick={() => setSelected(p)}
                className="project-card glass-card-hover glow-border overflow-hidden cursor-pointer group"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover hover-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-foreground mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <span key={t} className="font-mono-data text-[10px] text-primary/80 border border-primary/20 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X size={24} weight="bold" />
            </button>
            <div className="aspect-video overflow-hidden rounded-t-xl">
              <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">{selected.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">{selected.fullDescription}</p>
              <div className="flex flex-wrap gap-2">
                {selected.tech.map((t) => (
                  <span key={t} className="skill-tag text-xs">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
