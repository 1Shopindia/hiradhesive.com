import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CTASection } from "@/components/CTASection";
import { Reveal, StaggerGroup, staggerItem } from "@/components/Reveal";
import { historyVideoId, testimonials } from "@/lib/site-data";
import { buildMeta, canonicalLinks, jsonLdScript, breadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: buildMeta({
      title: "About HIR Industries — 50+ Years of Manufacturing",
      description: "Since 1972, HIR Industries has manufactured premium tile adhesives, epoxy grouts and waterproofing systems. 500+ products, global reach, powered by German-American-Japanese technology.",
      path: "/about",
      keywords: ["HIR Industries history", "construction chemical manufacturer", "tile adhesive company India"],
    }),
    links: canonicalLinks("/about"),
    scripts: [
      jsonLdScript(breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
      ])),
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const stats = [
    { n: "50+", l: "Years of Experience" },
    { n: "500+", l: "Happy Customers" },
    { n: "200+", l: "Projects Completed" },
    { n: "15+", l: "Awards Won" },
  ];
  return (
    <div className="overflow-hidden">
      <section className="max-w-7xl mx-auto px-0 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.img
          initial={{ opacity: 0, scale: 0.95, x: -30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          src="/images/tiler-working-renovation-apartment (1).jpg"
          alt="HIR craftsmanship"
          className="rounded-2xl w-full shadow-elegant"
        />
        <div>
          <Reveal><p className="text-brand font-semibold uppercase tracking-widest text-xs mb-3">About Us</p></Reveal>
          <Reveal delay={0.05}><h1 className="text-4xl md:text-6xl font-bold leading-tight">About <span className="text-gradient-brand">Pioneer Of HIR</span></h1></Reveal>
          <StaggerGroup className="grid grid-cols-2 gap-6 mt-10">
            {stats.map(s => (
              <motion.div key={s.l} variants={staggerItem} className="border-l-4 border-brand pl-4">
                <p className="text-4xl md:text-5xl font-bold text-gradient-brand">{s.n}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{s.l}</p>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="bg-gradient-to-b from-secondary/40 to-white py-20">
        <Reveal className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Most Modern & Powerful Industry In The World</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
            Explore our handpicked selection of featured solutions. Each listing offers a glimpse into your basic
            home problems and available through HIR.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Building a new home or office space is not just a financial choice. It is an emotionally and mentally
            overwhelming decision for an individual. Dream of every person is to live in a home made by them and
            leaving them as a legacy for their kids. But using improper or mediocre quality materials in constructing
            houses can lead to frequent requirements of repairs. With the right help and high-grade products, one can
            make this process quick and easy for themselves.
          </p>
          <Link to="/products" className="inline-block mt-8 gradient-brand text-white rounded-full px-7 py-3.5 font-semibold shadow-elegant hover:-translate-y-0.5 transition-all">
            Explore More →
          </Link>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-0 py-20 grid md:grid-cols-2 gap-12 items-center">
        <Reveal><img src="/images/history.png" alt="HIR Industries company history and manufacturing timeline" className="w-full rounded-2xl" /></Reveal>
        <Reveal delay={0.1}>
          <p className="text-brand font-semibold uppercase tracking-widest text-xs mb-3">Our Journey</p>
          <h2 className="text-3xl md:text-5xl font-bold">Our History</h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            The journey of business began in 1972 when our forefathers first started producing quality products.
            Ever since then, we have been working alongside the ceramics industry, growing and developing together.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            It was named after Late Hiral Jayantibhai Patel, sister of our founding father. Our business prospered
            under the experienced guidance of Late Hatiba Raichandbai Patel, Late Shri Sankhabai Patel, Late Shree
            Valjibhai Raichandbai Patel, and Late Maghanbhai Raichandbai Patel.
          </p>
        </Reveal>
      </section>

      <section className="bg-gradient-to-b from-secondary/40 to-white py-20">
        <StaggerGroup className="max-w-7xl mx-auto px-0 grid md:grid-cols-2 gap-8">
          <motion.div variants={staggerItem} whileHover={{ y: -6 }} className="bg-white p-10 rounded-2xl border border-border hover:shadow-elegant hover:border-brand/40 transition-all">
            <h3 className="text-2xl font-bold text-gradient-brand mb-4">Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to serve our customers with best quality products for better construction. Most people are
              able to construct one home or shelter in their life by investing most of the income earned. Our goal is
              to provide value for money products to enhance beauty and quality of construction.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              HIR Brand is here to be part of new Landmarks with Eco-Green and Eco-Friendly products. We inspire green
              building by using natural resources which do not cause harm to environment.
            </p>
          </motion.div>
          <motion.div variants={staggerItem} whileHover={{ y: -6 }} className="bg-white p-10 rounded-2xl border border-border hover:shadow-elegant hover:border-brand/40 transition-all">
            <h3 className="text-2xl font-bold text-gradient-brand mb-4">Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              They say DREAM BIG. So do we (HIR Team) — dream to build your Dream House or Project. Most acknowledged
              enterprise leading best in performance & low-cost maintenance philosophy with German and American
              high-end technology.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              HIR Team has vision to be one of the most effective, innovative and creative brands in the field of
              construction, focusing on green building using eco-friendly materials.
            </p>
          </motion.div>
        </StaggerGroup>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20">
        <Reveal className="text-center mb-10">
          <p className="text-brand font-semibold uppercase tracking-widest text-xs mb-3">Timeline</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-3">Milestones</h2>
          <p className="text-muted-foreground">HIR History and Timeline — meet the owners of HIR.</p>
        </Reveal>
        <Reveal className="aspect-video rounded-2xl overflow-hidden shadow-elegant">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${historyVideoId}`}
            title="HIR History" allowFullScreen loading="lazy" />
        </Reveal>
      </section>

      <section className="bg-gradient-to-b from-secondary/40 to-white py-20">
        <div className="max-w-7xl mx-auto px-0">
          <Reveal className="text-center mb-12">
            <p className="text-brand font-semibold uppercase tracking-widest text-xs mb-3">Voices</p>
            <h2 className="text-3xl md:text-5xl font-bold">Testimonials</h2>
          </Reveal>
          <StaggerGroup className="grid gap-6 md:grid-cols-3">
            {testimonials.map(t => (
              <motion.div key={t.videoId} variants={staggerItem} className="bg-white rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-elegant transition-all">
                <div className="aspect-video">
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${t.videoId}`}
                    title={t.title} allowFullScreen loading="lazy" />
                </div>
                <div className="p-5"><p className="text-sm font-medium">{t.title}</p></div>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
