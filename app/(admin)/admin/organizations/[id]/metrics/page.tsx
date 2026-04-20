import { createClient } from "@/lib/supabase/server";

import { MetricForm } from "./metric-form";

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default async function OrgMetricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: metrics } = await supabase
    .from("growth_metrics")
    .select("id, period_start, period_end, revenue, cac, ltv, fte, gross_margin_pct, notes")
    .eq("organization_id", id)
    .order("period_start", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-4 text-[13px] font-semibold text-white">Nouvelle période</div>
        <MetricForm organizationId={id} />
      </div>

      <div className="rounded-xl border border-line overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <span className="text-[13px] font-semibold text-white">Historique</span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              {["Période", "CA", "CAC", "LTV", "ETP", "Marge"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics?.map((m) => (
              <tr
                key={m.id}
                className="border-t border-line transition-colors hover:bg-surface-raised"
              >
                <td className="px-5 py-3 text-[12px] text-textL">
                  {new Date(m.period_start).toLocaleDateString("fr-FR")} –{" "}
                  {new Date(m.period_end).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-3 text-[13px] font-medium text-gold">
                  {m.revenue ? EUR.format(Number(m.revenue)) : "—"}
                </td>
                <td className="px-5 py-3 text-[12px] text-textL">
                  {m.cac ? EUR.format(Number(m.cac)) : "—"}
                </td>
                <td className="px-5 py-3 text-[12px] text-textL">
                  {m.ltv ? EUR.format(Number(m.ltv)) : "—"}
                </td>
                <td className="px-5 py-3 text-[12px] text-textL">{m.fte ?? "—"}</td>
                <td className="px-5 py-3 text-[12px] text-textL">
                  {m.gross_margin_pct != null
                    ? `${Number(m.gross_margin_pct).toFixed(1)}%`
                    : "—"}
                </td>
              </tr>
            ))}
            {!metrics?.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[13px] text-muted"
                >
                  Aucune métrique enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
