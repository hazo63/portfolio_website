import { useState, useCallback } from "react";
import Preloader from "@/components/Preloader";
import AnimatedBackground from "@/components/AnimatedBackground";
import FuturisticCursor from "@/components/FuturisticCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Journey from "@/components/Journey";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

const Index = () => {
  const [loading, setLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <Preloader onComplete={handleLoadComplete} />}
      <AnimatedBackground />
      <div className={`relative z-10 ${loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}`}>
        <Navbar />
        <Hero />
        <About />
        <Education />
        <Skills />
        <Certifications />
        <Journey />
        <Projects />
        <Contact />
        <footer className="py-8 text-center text-xs text-muted-foreground border-t border-foreground/[0.05]">
          <p>© 2025 Mohamed Hazem. Architecting the Intelligence Layer.</p>
        </footer>
      </div>
    </>
  );
};

export default Index;
