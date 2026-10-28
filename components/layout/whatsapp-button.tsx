import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { toWhatsAppUrl } from "@/lib/format";

/**
 * Floating WhatsApp action. It renders only when siteConfig.contact.whatsappNumber is a valid
 * Pakistan mobile number; set it to null to remove the button entirely.
 */
export function WhatsAppButton() {
  const number = siteConfig.contact.whatsappNumber;
  const url = number ? toWhatsAppUrl(number, siteConfig.contact.whatsappMessage) : null;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Food Chain on WhatsApp (opens in a new tab)"
      style={{ bottom: "calc(1rem + var(--float-offset))" }}
      className="fixed right-4 z-[var(--z-sticky)] grid size-14 place-items-center rounded-full bg-char text-gold shadow-lift transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5 active:translate-y-0 sm:right-6"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
