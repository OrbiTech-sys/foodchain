"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton } from "@/components/ui/dialog";
import { DeliveryEligibilityChecker } from "./delivery-eligibility-checker";

interface DeliveryCheckButtonProps {
  label?: string;
  variant?: "primary" | "dark" | "outline" | "outline-light" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** A button that opens the 5 km checker in a dialog. */
export function DeliveryCheckButton({
  label = "Check my address",
  variant = "outline",
  size = "md",
  className,
}: DeliveryCheckButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <MapPin className="size-4" aria-hidden />
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="delivery-check-title" variant="modal">
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-rule px-6 py-4">
            <h2 id="delivery-check-title" className="text-2xl">
              Can we deliver to you?
            </h2>
            <DialogCloseButton onClick={() => setOpen(false)} className="-mr-2 -mt-1" />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <DeliveryEligibilityChecker onSwitchToPickup={() => setOpen(false)} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
