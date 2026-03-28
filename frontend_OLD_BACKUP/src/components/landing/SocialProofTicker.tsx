const brands = [
  "Reliance Retail", "Titan", "Shoppers Stop", "Big Bazaar",
  "Lifestyle", "Pantaloons", "Croma", "D-Mart",
];

const SocialProofTicker = () => (
  <section className="border-y border-border py-8 overflow-hidden bg-transparent">
    <p className="text-center text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">
      Trusted by leading retail enterprises across India
    </p>
    <div
      className="relative"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="flex animate-scroll-left gap-16 whitespace-nowrap hover:[animation-play-state:paused]">
        {[...brands, ...brands].map((name, i) => (
          <span
            key={i}
            className="text-lg font-semibold text-muted-foreground/40 flex-shrink-0 transition-all duration-300 hover:text-primary hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] cursor-default"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofTicker;
