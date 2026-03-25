import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LinkedinLogo, GithubLogo, EnvelopeSimple, DownloadSimple } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const resumeHref = "https://pdflink.to/953c6091/";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".contact-inner",
        { opacity: 0, y: 50 },
        {
          scrollTrigger: { trigger: ref.current, start: "top bottom-=100", toggleActions: "play none none none" },
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        }
      );
      gsap.fromTo(".contact-input",
        { opacity: 0, y: 20 },
        {
          scrollTrigger: { trigger: ref.current, start: "top bottom-=80", toggleActions: "play none none none" },
          opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out", delay: 0.3,
        }
      );
      gsap.fromTo(".contact-social",
        { opacity: 0, y: 20 },
        {
          scrollTrigger: { trigger: ref.current, start: "top bottom-=60", toggleActions: "play none none none" },
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.6,
        }
      );
      gsap.fromTo(".download-cv-btn",
        { opacity: 0, y: 30 },
        {
          scrollTrigger: { trigger: ".download-cv-btn", start: "top bottom-=40", toggleActions: "play none none none" },
          opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.8,
        }
      );
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
              className="contact-input diamond-input"
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="contact-input diamond-input"
            />
            <textarea
              placeholder="Message"
              rows={4}
              required
              className="contact-input diamond-input resize-none"
            />
            <button
              type="submit"
              className="btn-glow w-full active:scale-95 transition-transform"
            >
              {submitted ? "Message Sent ✓" : "Let's Build Something"}
            </button>
          </form>

          {/* Social Links */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex items-center gap-6">
              <a
                href="https://www.linkedin.com/in/mohamed-hazem-hegazy-6197b8262"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social social-link"
              >
                <LinkedinLogo size={24} weight="regular" />
                <span className="text-sm">Mohamed Hazem</span>
              </a>
              <a
                href="https://github.com/hazo63"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social social-link"
              >
                <GithubLogo size={24} weight="regular" />
                <span className="text-sm">hazo63</span>
              </a>
            </div>
            <a
              href="mailto:mdmdss1212@gmail.com"
              className="contact-social social-link"
            >
              <EnvelopeSimple size={24} weight="regular" />
              <span className="text-sm">mdmdss1212@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Download CV Button */}
        <div className="download-cv-btn flex justify-center mt-10">
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-glow flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto justify-center"
          >
            <DownloadSimple size={22} weight="bold" />
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
