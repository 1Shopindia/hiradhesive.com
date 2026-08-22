import type { LegalContent } from "~/config/legalContent";

export interface LegalPageProps extends LegalContent {}

export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="legal-page">
      {/* Header with gradient background */}
      <header className="gradient-ink text-white py-14">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-3 text-white/70">Last Updated: {lastUpdated}</p>
        </div>
      </header>

      {/* Content sections */}
      <section className="container mx-auto max-w-5xl px-4 py-16">
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {section.heading}
            </h2>
            {typeof section.content === "string" ? (
              <p className="leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            ) : (
              <ul className="ml-6 list-disc space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-relaxed text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
