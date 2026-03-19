import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LinkedinLogo, GithubLogo } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-inner", {
        scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" ref={ref} className="py-20">
      <div className="section-container">
        <div className="contact-inner glass-card p-8 sm:p-12 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 text-center">
            Get In Touch
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-8">
            Let's build something amazing together
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Name"
              required
              className="w-full bg-surface border border-foreground/[0.08] rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full bg-surface border border-foreground/[0.08] rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <textarea
              placeholder="Message"
              rows={4}
              required
              className="w-full bg-surface border border-foreground/[0.08] rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
            />
            <button type="submit" className="btn-glow w-full">
              {submitted ? "Message Sent ✓" : "Let's Build Something"}
            </button>
          </form>
          <div className="flex items-center justify-center gap-6 mt-8">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <LinkedinLogo size={28} weight="thin" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <GithubLogo size={28} weight="thin" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
