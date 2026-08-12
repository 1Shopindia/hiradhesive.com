import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Mail, MapPin } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { contact, socialLinks } from "@/lib/site-data";
import { buildMeta, canonicalLinks, jsonLdScript, breadcrumbSchema, localBusinessSchema } from "@/lib/seo";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: buildMeta({
      title: "Contact HIR Industries — Enquiries & Support",
      description: "Contact HIR Industries for product enquiries, distributor partnerships and technical support. Call 1800 572 2779 or email info@hirgroup.in. Response within one business day.",
      path: "/contact",
      keywords: ["HIR Industries contact", "tile adhesive dealer", "construction chemical enquiry", "HIR distributor"],
    }),
    links: canonicalLinks("/contact"),
    scripts: [
      jsonLdScript(localBusinessSchema()),
      jsonLdScript(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ])),
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { enquiry?: string } => ({
    enquiry: typeof search.enquiry === "string" ? search.enquiry.slice(0, 1200) : undefined,
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const { enquiry } = Route.useSearch();
  return (
    <div className="overflow-hidden">
      <section className="relative bg-gradient-to-b from-secondary/60 to-white py-20 text-center px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-brand/10 blur-3xl" />
        </div>
        <Reveal>
          <p className="text-brand font-semibold uppercase tracking-widest text-xs mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-bold">Contact <span className="text-gradient-brand">Us</span></h1>
          <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-lg">
            Reach out for product enquiries, dealership opportunities, or technical support. We respond within one business day.
          </p>
        </Reveal>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <Reveal>
          <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
          <div className="space-y-5">
            {[
              { icon: MapPin, title: "HIR Industries", sub: "Gujarat, India" },
              { icon: Mail, title: "Email", sub: "info@hirgroup.in", href: "mailto:info@hirgroup.in" },
              { icon: Globe, title: "Website", sub: "www.hirgroup.in", href: "https://www.hirgroup.in" },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-white hover:border-brand/40 hover:shadow-soft transition-all">
                <div className="h-10 w-10 rounded-full gradient-brand shrink-0 flex items-center justify-center text-white">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.href
                    ? <a href={item.href} className="text-brand hover:underline">{item.sub}</a>
                    : <p className="text-muted-foreground text-sm">{item.sub}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="font-semibold mb-3">Follow us</h3>
            <div className="flex gap-3">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="h-11 w-11 rounded-full bg-brand/10 hover:gradient-brand hover:-translate-y-1 flex items-center justify-center transition-all group"
                >
                  <img src={s.icon} alt="" loading="lazy" className="h-5 w-5 group-hover:invert transition" />
                </a>
              ))}
            </div>
          </div>

        </Reveal>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const name = String(data.get("name") ?? "").trim();
            const message = String(data.get("message") ?? "").trim();
            const text = `Hello HIR Industries,\n\nName: ${name}\n\n${message}`;
            window.open(
              `https://api.whatsapp.com/send?phone=${contact.whatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(text)}`,
              "_blank",
              "noopener,noreferrer",
            );
            setSent(true);
          }}
          className="bg-white border border-border rounded-2xl p-8 space-y-5 shadow-soft"
        >
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold mb-2">Name</label>
            <input id="contact-name" name="name" autoComplete="name" required className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-semibold mb-2">Message</label>
            <textarea id="contact-message" name="message" required rows={6} defaultValue={enquiry ?? ""} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition resize-none" placeholder="How can we help?" />
          </div>
          <button className="gradient-brand text-white rounded-full px-6 py-3.5 font-semibold w-full shadow-elegant hover:-translate-y-0.5 hover:shadow-2xl transition-all min-h-11" type="submit">
            Send on WhatsApp →
          </button>
          <p role="status" aria-live="polite" className="min-h-[1.25rem]">
            {sent && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-700 font-medium"
              >
                ✓ WhatsApp opened — send the message to reach us instantly.
              </motion.span>
            )}
          </p>
        </motion.form>
      </section>
    </div>
  );
}
