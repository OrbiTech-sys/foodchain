import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/lib/types";

interface FoodImageProps {
  image?: ProductImage;
  /** next/image `sizes` hint for the rendered width. */
  sizes: string;
  /** Above-the-fold images only. */
  eager?: boolean;
  className?: string;
}

/**
 * Fills its (relatively positioned) parent. White-background and cut-out packshots are multiplied onto
 * the surface behind them so no white box shows; full photographs cover the frame.
 */
export function FoodImage({ image, sizes, eager, className }: FoodImageProps) {
  if (!image) {
    return (
      <div className={cn("absolute inset-0 grid place-items-center text-muted", className)} aria-hidden>
        <UtensilsCrossed className="size-10" />
      </div>
    );
  }
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : undefined}
      className={cn(
        image.kind === "packshot" && "object-contain p-3 mix-blend-multiply",
        image.kind === "collage" && "object-contain",
        image.kind === "photo" && "object-cover",
        className,
      )}
    />
  );
}
