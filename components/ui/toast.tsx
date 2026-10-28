"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "info" | "success" | "error";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: { label: string; onAction: () => void };
  /** Milliseconds. Errors and undo toasts stay longer by default. */
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastApi {
  /** Visible toast. Reserve for failures, undo and effects the user cannot otherwise see. */
  toast: (input: ToastInput) => void;
  /** Screen-reader-only announcement for silent successes such as "Added to cart". */
  announce: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside <ToastProvider>.");
  return value;
}

const ICONS = { info: Info, success: CircleCheck, error: CircleAlert } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });
  const counter = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      counter.current += 1;
      const id = counter.current;
      const duration = input.duration ?? (input.action ? 8000 : input.tone === "error" ? 8000 : 5000);
      setItems((current) => [...current.slice(-2), { ...input, id }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
    },
    [dismiss],
  );

  const announce = useCallback((text: string) => {
    counter.current += 1;
    setAnnouncement({ id: counter.current, text });
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const api = useMemo(() => ({ toast, announce }), [toast, announce]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        <span key={announcement.id}>{announcement.text}</span>
      </div>
      <div className="toast-region" role="region" aria-label="Notifications">
        {items.map((item) => {
          const Icon = ICONS[item.tone ?? "info"];
          return (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              className="toast flex items-start gap-3 rounded-2xl bg-char p-4 text-cream shadow-lift on-dark"
            >
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", item.tone === "error" ? "text-tomato-glow" : "text-gold")}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                {item.description ? <p className="mt-0.5 text-sm text-fog">{item.description}</p> : null}
              </div>
              {item.action ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm shrink-0 text-gold"
                  onClick={() => {
                    item.action?.onAction();
                    dismiss(item.id);
                  }}
                >
                  {item.action.label}
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Dismiss notification"
                className="btn btn--ghost btn--icon btn--sm -my-2 -mr-2 shrink-0"
                onClick={() => dismiss(item.id)}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
