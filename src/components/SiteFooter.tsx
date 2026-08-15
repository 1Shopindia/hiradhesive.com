import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { contact, socialLinks } from "@/lib/site-data";
import { CatalogueDownload } from "@/components/CatalogueDownload";
import { subscribeToNewsletter } from "@/lib/cms.functions";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "Products" },
  { to: "/visualizer", label: "Visualizer" },
  { to: "/blogs", label: "Blogs" },
  { to: "/contact", label: "Contact Us" },
] as const;

const categories = [
  "Tiles & Stone Solutions",
  "Wall Solutions",
  "Grouts & Sealants",
  "Waterproofing",
  "Tools & Accessories",
];

const certifications = ["ISO Certified", "Food Grade Certified", "Green Building", "US-FDA Tested"];

export function SiteFooter() {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const emailInput = form.elements.namedItem("newsletter-email") as HTMLInputElement;
    const email = emailInput?.value?.trim();

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await subscribeToNewsletter({
        email,
        ipAddress: undefined,
        userAgent: navigator.userAgent,
      });
      setJoined(true);
      form.reset();
    } catch (err: any) {
      setError(err.message || "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative gradient-ink text-white/85 mt-28 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.16] pointer-events-none">
        <div className="absolute -top-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-brand blur-3xl" />
        <div className="absolute -bottom-52 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand blur-3xl" />
      </div>

      {/* Newsletter */}
      <div className="relative max-w-7xl mx-auto px-0 pt-16">
        <div className="glass-dark rounded-3xl p-8 md:p-12 grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
          <div>
            <p className="eyebrow text-brand">Newsletter</p>
            <h2 className="mt-3 text-2xl md:text-4xl font-bold text-white">
              Technical insights, straight to your inbox.
            </h2>
            <p className="mt-3 text-sm md:text-base text-white/65 max-w-lg">
              Product launches, application guides and dealer updates from the HIR technical team. No spam.
            </p>
          </div>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              name="newsletter-email"
              type="email"
              required
              disabled={loading || joined}
              placeholder="you@company.com"
              className="flex-1 min-h-12 rounded-full bg-white/10 border border-white/20 px-5 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-brand transition disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={loading || joined}
              className="btn-luxe btn-luxe-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
            <p role="status" aria-live="polite" className="sr-only">{joined ? "Subscribed" : ""}</p>
          </form>
          {joined && <p className="text-sm text-brand md:col-span-2">✓ You're on the list — thank you.</p>}
          {error && <p className="text-sm text-red-400 md:col-span-2">✗ {error}</p>}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-0 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-flex items-center justify-center bg-white rounded-2xl p-3.5 mb-6 shadow-soft">
            <img src="/images/hir-logo.png" alt="HIR Industries" className="h-12 w-auto" width={150} height={48} />
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
            HIR Industries is backed by rich industry experience since 1972 — manufacturing and supplying
            9 categories of construction chemicals across a 500+ product range.
          </p>
          <CatalogueDownload variant="dark" className="mt-6" />
          <div className="flex gap-3 mt-6">
            {socialLinks.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="h-11 w-11 rounded-full bg-white/10 border border-white/15 hover:bg-brand hover:border-brand flex items-center justify-center transition-all hover:-translate-y-1"
              >
                <img src={s.icon} alt="" className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold mb-5 text-white text-base tracking-wide">Quick Links</h3>
          <ul className="space-y-3 text-sm text-white/60">
            {quickLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-brand transition-colors link-underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold mb-5 text-white text-base tracking-wide">Products</h3>
          <ul className="space-y-3 text-sm text-white/60">
            {categories.map(c => (
              <li key={c}>
                <Link to="/products" className="hover:text-brand transition-colors link-underline">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold mb-5 text-white text-base tracking-wide">Contact</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="leading-relaxed">{contact.address}</li>
            <li><a href={contact.phoneHref} className="hover:text-brand transition-colors">Toll Free: {contact.phone}</a></li>
            <li><a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">WhatsApp: {contact.whatsapp}</a></li>
            <li><a href={`mailto:${contact.email}`} className="hover:text-brand transition-colors">{contact.email}</a></li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {certifications.map(c => (
              <span key={c} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.68rem] font-medium text-white/70">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} HIR Industries. All rights reserved.</p>
          <p>Your Building Master · Himatnagar, Gujarat, India</p>
        </div>
      </div>
    </footer>
  );
}
