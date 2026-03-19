import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skillGroups = [
  { title: "Programming", skills: ["Python", "C++"] },
  { title: "Data & Databases", skills: ["SQL", "PostgreSQL", "Data Modeling", "ETL Pipelines"] },
  { title: "Big Data", skills: ["Apache Spark", "Hadoop"] },
  { title: "Cloud", skills: ["AWS (EC2, S3, RDS, IAM)", "Azure", "Huawei Cloud"] },
  { title: "Analytics & ML", skills: ["Pandas", "NumPy", "Scikit-learn", "Power BI"] },
];

const Skills = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".skill-group", {
        scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" ref={ref} className="py-20">
      <div className="section-container">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-12 text-center">
          Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {skillGroups.map((group) => (
            <div key={group.title} className="skill-group">
              <h3 className="font-mono-data text-xs text-primary mb-4 uppercase">
                // {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
