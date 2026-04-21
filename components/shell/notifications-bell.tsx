"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, Inbox } from "lucide-react";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import { formatRelative, type Notification } from "@/lib/notifications-data";
import { cn } from "@/lib/utils";

export function NotificationsBell({
  initial,
}: {
  initial: Notification[];
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initial);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setItems(initial), [initial]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = items.filter((n) => !n.read_at).length;

  const onItemClick = (id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    startTransition(() => void markNotificationRead(id));
  };

  const onMarkAll = () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    startTransition(() => void markAllNotificationsRead());
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-textL hover:bg-surface-hover"
        aria-label="Notifications"
      >
        <Bell size={15} strokeWidth={1.6} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[340px] overflow-hidden rounded-xl border border-line bg-ink-soft shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-[13px] font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={onMarkAll}
                className="inline-flex items-center gap-1 text-[11px] text-gold hover:text-gold-soft"
              >
                <Check size={11} /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-muted">
                <Inbox size={24} strokeWidth={1.4} className="opacity-60" />
                <span className="text-[12px]">Aucune notification pour l&apos;instant</span>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const content = (
                    <>
                      <div className="flex items-start gap-2">
                        {!n.read_at && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        )}
                        <div className={cn("flex-1 min-w-0", n.read_at && "pl-3.5")}>
                          <p
                            className={cn(
                              "truncate text-[12px]",
                              n.read_at
                                ? "text-textL"
                                : "font-semibold text-white",
                            )}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 truncate text-[11px] text-muted">
                              {n.body}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-muted">
                            {formatRelative(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                  const baseCn =
                    "block border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-raised";
                  return (
                    <li key={n.id}>
                      {n.url ? (
                        <Link
                          href={n.url}
                          className={baseCn}
                          onClick={() => {
                            onItemClick(n.id);
                            setOpen(false);
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onItemClick(n.id)}
                          className={cn(baseCn, "w-full text-left")}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
