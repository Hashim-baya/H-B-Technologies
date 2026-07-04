import { loadSiteContent, type AboutCard } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";
import marketing from "@/styles/marketing.module.css";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "VIZIA Technologies is a software engineering company delivering security-first product development, AI-powered innovation, and compliance-driven engineering standards.",
  path: "/about",
});

export const revalidate = 0;

export default async function AboutPage() {
  const c = await loadSiteContent();
  const about = c.about;

  const pairs: [typeof about.cards[0], typeof about.cards[0] | undefined][] = [];
  for (let i = 0; i < about.cards.length; i += 2) {
    pairs.push([about.cards[i], about.cards[i + 1]]);
  }

  return (
    <section className="section">
      <div className="container">
        <h1>{about.heading}</h1>
        <p className={`muted ${marketing.lead}`}>{about.lead}</p>

        {pairs.map(([a, b], pi) => (
          <div key={pi} className={`${marketing.twoCol} ${pi > 0 ? marketing.mt3 : ""}`}>
            <AboutCard card={a} />
            {b && <AboutCard card={b} />}
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutCard({ card }: { card: AboutCard }) {
  return (
    <article className={`card ${marketing.pad3}`}>
      <h2 className={marketing.sectionTitle}>{card.title}</h2>
      {card.type === "paragraph" && (
        card.content?.split("\n\n").map((p, i) => (
          <p key={i} className={`muted ${i > 0 ? marketing.mt2 : ""}`}>{p}</p>
        ))
      )}
      {card.type === "list" && (
        <ul>
          {card.items?.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
      {card.type === "numbered-list" && (
        <ol>
          {card.items?.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      )}
    </article>
  );
}
