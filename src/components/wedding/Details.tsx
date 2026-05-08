import { MapPin } from "lucide-react";

interface DetailItem {
  title: string;
  time: string;
  venue: string;
  address: string;
}

export const Details = ({ 
  ceremony, 
  reception, 
  eyebrow, 
  title 
}: { 
  ceremony: DetailItem; 
  reception: DetailItem; 
  eyebrow?: string;
  title?: string;
}) => {
  const cards = [ceremony, reception];

  return (
    <section id="details" className="bg-ivory relative z-[2] px-6 md:px-10 py-24 md:py-32">
      <div className="text-center mb-16">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h2 className="font-display font-light leading-tight text-warm-dark"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
          {title}
        </h2>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-20 items-start">
        {cards.map((c) => (
          <div
            key={c.title}
            className="relative px-8 md:px-10 py-10 md:py-12 border border-blush hover:border-gold transition-colors duration-300"
          >
            <span className="absolute -top-px left-10 w-16 h-0.5 bg-gold" />
            <h3 className="font-display text-2xl md:text-[28px] font-normal text-warm-dark mb-4">
              {c.title}
            </h3>
            <span className="font-display text-4xl md:text-[42px] text-gold font-light block my-3">
              {c.time}
            </span>
            <p className="text-warm-mid text-sm leading-loose font-light">
              <span className="block font-medium text-warm-dark">{c.venue}</span>
              {c.address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${c.venue} ${c.address}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.3em] text-gold border-b border-gold/40 pb-1 hover:text-warm-dark hover:border-warm-mid transition-colors"
            >
              <MapPin className="w-3 h-3" /> View on Map
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
