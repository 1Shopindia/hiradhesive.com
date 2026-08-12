import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { contact } from "@/lib/site-data";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/visualizer", label: "Visualizer" },
  { to: "/calculator", label: "Calculator" },
  { to: "/blogs", label: "Blogs" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="gradient-ink text-white text-[0.72rem] sm:text-xs tracking-wide py-2.5 px-4 text-center">
        <span className="text-white/70">Since 1972 · German–American–Japanese technology</span>
        <span aria-hidden="true" className="mx-3 text-white/25">|</span>
        <a href={contact.phoneHref} className="font-semibold text-white hover:text-brand transition-colors">
          Toll Free {contact.phone}
        </a>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? "glass shadow-soft border-b border-white/40" : "bg-white/90 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-0 flex items-center justify-between h-[4.75rem]">
          <Link to="/" className="flex items-center group shrink-0" aria-label="HIR Industries — home">
            <img
              src="/images/hir-logo.png"
              alt="HIR — Your Building Master"
              className="h-11 w-auto transition-transform duration-500 group-hover:scale-105"
              width={140}
              height={44}
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {nav.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-brand transition-colors link-underline"
                activeProps={{ className: "relative px-4 py-2 text-sm font-semibold text-brand link-underline" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/contact" className="btn-luxe btn-luxe-primary text-sm px-6 py-2.5 min-h-11">
              Get a Quote
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden min-h-11 min-w-11 grid place-items-center rounded-xl hover:bg-accent transition"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span className="sr-only">Toggle navigation</span>
            <span aria-hidden="true">
              <span className={`block w-6 h-0.5 rounded-full bg-brand-blue mb-1.5 transition-transform duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 rounded-full bg-brand-blue mb-1.5 transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 rounded-full bg-brand-blue transition-transform duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav"
              key="mnav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-border bg-white"
            >
              <nav aria-label="Mobile" className="flex flex-col p-4 gap-1">
                {nav.map((n, i) => (
                  <motion.div
                    key={n.to}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className="px-4 py-3.5 rounded-xl text-base font-medium hover:bg-accent hover:text-brand transition min-h-12 flex items-center"
                    >
                      {n.label}
                    </Link>
                  </motion.div>
                ))}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-luxe btn-luxe-primary mt-3 w-full"
                >
                  Get a Quote
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
