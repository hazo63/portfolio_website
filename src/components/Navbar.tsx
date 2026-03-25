import { useState, useEffect, useRef } from "react";
import { List, X, User, GraduationCap, Lightning, Certificate, Path, Briefcase, EnvelopeSimple, DownloadSimple } from "@phosphor-icons/react";
import gsap from "gsap";

const navItems = [
  { label: "About", href: "#about", icon: User },
  { label: "Education", href: "#education", icon: GraduationCap },
  { label: "Skills", href: "#skills", icon: Lightning },
  { label: "Certifications", href: "#certifications", icon: Certificate },
  { label: "My Journey", href: "#journey", icon: Path },
  { label: "Projects", href: "#projects", icon: Briefcase },
  { label: "Contact", href: "#contact", icon: EnvelopeSimple },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const resumeHref = "https://pdflink.to/953c6091/";

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
      if (linksRef.current) {
        gsap.fromTo(linksRef.current.children,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out", delay: 0.5 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // Scrollspy
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-foreground/[0.08] backdrop-blur-xl"
      >
        <div className="section-container flex items-center justify-between h-16">
          <a href="#" className="font-semibold text-lg tracking-tight text-foreground">
            MH<span className="text-primary">.</span>
          </a>

          {/* Desktop */}
          <div ref={linksRef} className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <button
                  key={item.href}
                  onClick={() => handleClick(item.href)}
                  className={`nav-link focus:outline-none focus:ring-2 focus:ring-ring ${isActive ? "active" : ""}`}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} />
                  {item.label}
                </button>
              );
            })}
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold btn-outline-glow focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <DownloadSimple size={16} weight="bold" />
              Download CV
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-1"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col lg:hidden">
          <div className="section-container flex items-center justify-between h-16">
            <a href="#" className="font-semibold text-lg tracking-tight text-foreground">
              MH<span className="text-primary">.</span>
            </a>
            <button
              onClick={() => setOpen(false)}
              className="text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-1"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <button
                  key={item.href}
                  onClick={() => handleClick(item.href)}
                  className={`nav-link w-64 text-lg font-medium rounded-xl px-6 py-3 gap-3 ${isActive ? "active" : ""}`}
                >
                  <Icon size={22} weight={isActive ? "fill" : "regular"} />
                  {item.label}
                </button>
              );
            })}
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-64 btn-glow rounded-xl py-3 text-lg font-semibold"
            >
              <DownloadSimple size={22} weight="bold" />
              Download CV
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
