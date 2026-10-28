import { siteConfig } from "@/config/site";

/**
 * Opening hours. Rendered only when the owner has confirmed them (siteConfig.hours.verified);
 * otherwise an honest "to be confirmed" line is shown instead.
 */
export function BusinessHours({ className, showNote = true }: { className?: string; showNote?: boolean }) {
  const { hours } = siteConfig;
  if (!hours.verified) {
    return <p className={className}>Opening hours to be confirmed.</p>;
  }
  return (
    <div className={className}>
      <p className="tabular">{hours.label}</p>
      {showNote ? <p className="text-sm">{hours.note}</p> : null}
    </div>
  );
}
