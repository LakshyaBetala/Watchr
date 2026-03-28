interface SectionBadgeProps {
  text: string;
}

const SectionBadge = ({ text }: SectionBadgeProps) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/20 backdrop-blur-sm px-4 py-1.5 mb-4">
    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
      ● {text}
    </span>
  </div>
);

export default SectionBadge;
