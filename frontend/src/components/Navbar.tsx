import { useState, useEffect } from "react";
import { Menu, X, Radar, Zap } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Analyze", href: "/analyze" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-white/10 shadow-lg shadow-navy-950/50"
          : "bg-transparent"
      }`}
    >
      <nav className="container-max px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-tight tracking-tight">
                RoadSense<span className="gradient-text"> AI</span>
              </span>
              <span className="text-[9px] font-mono text-white/40 leading-none tracking-wider">
                ROAD INTELLIGENCE
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:block">
            <a
              href="/analyze"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4" />
              Start Analysis
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 animate-fade-in">
            <div className="glass rounded-2xl p-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/analyze"
                onClick={() => setMobileOpen(false)}
                className="btn-primary inline-flex items-center justify-center gap-2 text-sm mt-2"
              >
                <Zap className="w-4 h-4" />
                Start Analysis
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
