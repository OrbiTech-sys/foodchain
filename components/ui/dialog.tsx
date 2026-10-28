"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type DialogVariant = "modal" | "sheet" | "drawer" | "drawer-left";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog. */
  labelledBy: string;
  variant?: DialogVariant;
  className?: string;
  children: ReactNode;
}

/**
 * Accessible dialog built on the native <dialog> element: focus is trapped and restored by the
 * browser, Escape closes it, and the backdrop is the top layer. Clicking the backdrop closes it too.
 * Enter/exit motion is plain CSS (see .dialog in globals.css).
 */
export function Dialog({ open, onClose, labelledBy, variant = "modal", className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "dialog",
        variant === "drawer-left" ? "dialog--drawer dialog--drawer-left" : `dialog--${variant}`,
        className,
      )}
    >
      {children}
    </dialog>
  );
}

export function DialogCloseButton({ onClick, label = "Close", className }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("btn btn--ghost btn--icon shrink-0", className)}
    >
      <X className="size-5" aria-hidden />
    </button>
  );
}
