import { useEffect, useState } from "react";

interface NavProps {
  initials: string;
  year: string;
  labels?: {
    countdown?: string;
    story?: string;
    schedule?: string;
    gallery?: string;
    rsvp?: string;
  };
}

export const Nav = ({ initials, year, labels }: NavProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#countdown", label: labels?.countdown || "Countdown" },
    { href: "#schedule", label: labels?.schedule || "Schedule" },
    { href: "#gallery", label: labels?.gallery || "Gallery" },
    { href: "#rsvp", label: labels?.rsvp || "RSVP" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 px-6 md:px-14 py-5 md:py-7 flex justify-between items-center transition-all duration-500 ${scrolled ? "bg-cream/90 backdrop-blur-xl " : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto w-full flex justify-between">
        <span className={`text-[13px] uppercase font-normal tracking-[0.35em] mx-auto md:mx-0 ${scrolled ? "text-warm-dark" : "text-cream"}`}>
          {initials} · {year}
        </span>
        <div className="hidden md:flex gap-10">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`nav-link font-normal ${scrolled ? "text-warm-dark" : "text-cream"}`}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};
