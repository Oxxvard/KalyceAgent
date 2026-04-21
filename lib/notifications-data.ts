import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export async function loadNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 12,
): Promise<Notification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, url, read_at, created_at")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

export function formatRelative(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const seconds = Math.max(1, Math.round((now - t) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
