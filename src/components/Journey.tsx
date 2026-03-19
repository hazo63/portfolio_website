import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    title: "Data Engineer Intern",
    company: "DEPI",
    points: [
      "Built end-to-end ETL pipelines using Python & SQL",
      "Processed big data using Spark & Hadoop",
      "Worked with Azure cloud",
      "Optimized data quality & database performance",
    ],
  },
  {
    title: "Big Data Trainee",
    company: "Huawei",
    points: [
      "Learned big data concepts & tools",
      "Worked with Hadoop & Spark",
      "Completed hands-on labs",
    ],
  },
  {
    title: "Tech Essentials Trainee",
    company: "Huawei",
    points: [
      "Learned cloud, networking & IT fundamentals",
      "Gained knowledge in virtualization & cloud services",
    ],
  },
  {
    title: "Cloud Intern",
    company: "NTI",
    points: [
      "Designed AWS architectures (EC2, S3, RDS, VPC)",
      "Implemented high availability & monitoring",
    ],
  },
  {
    title: "Python Intern",
    company: "NTI",
    points: [
      "Data analysis using Pandas & NumPy",
      "Built automation scripts",
      "Applied OOP concepts",
    ],
  },
];

const Journey = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".journey-card", {
        scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none reverse" },
        opacity: 0,
        x: (i) => (i % 2 === 0 ? -40 : 40),
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" ref={ref} className="py-20">
      <div className="section-container">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-16 text-center">
          My Journey
        </h2>
        <div className="relative max-w-3xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 timeline-line hidden md:block" />

          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <div
                key={exp.title + exp.company}
                className={`journey-card relative flex flex-col md:flex-row items-center gap-6 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="glass-card glow-border p-6">
                    <h3 className="text-lg font-semibold text-foreground">{exp.title}</h3>
                    <p className="font-mono-data text-xs text-primary mt-1">{exp.company}</p>
                    <ul className="mt-3 space-y-1">
                      {exp.points.map((p) => (
                        <li key={p} className="text-sm text-muted-foreground">• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="timeline-dot shrink-0 hidden md:block" />
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
