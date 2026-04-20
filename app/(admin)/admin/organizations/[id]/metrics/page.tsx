import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { MetricForm } from "./metric-form";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function OrgMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: metrics } = await supabase
    .from("growth_metrics")
    .select("id, period_start, period_end, revenue, cac, ltv, fte, gross_margin_pct, notes")
    .eq("organization_id", id)
    .order("period_start", { ascending: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle période</CardTitle>
        </CardHeader>
        <MetricForm organizationId={id} />
      </Card>

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-soft text-xs uppercase tracking-wide text-slate-deep/70">
            <tr>
              <th className="px-6 py-3 font-medium">Période</th>
              <th className="px-6 py-3 font-medium">CA</th>
              <th className="px-6 py-3 font-medium">CAC</th>
              <th className="px-6 py-3 font-medium">LTV</th>
              <th className="px-6 py-3 font-medium">ETP</th>
              <th className="px-6 py-3 font-medium">Marge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {metrics?.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-3">
                  {new Date(m.period_start).toLocaleDateString("fr-FR")} –{" "}
                  {new Date(m.period_end).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-3">{m.revenue ? EUR.format(Number(m.revenue)) : "—"}</td>
                <td className="px-6 py-3">{m.cac ? EUR.format(Number(m.cac)) : "—"}</td>
                <td className="px-6 py-3">{m.ltv ? EUR.format(Number(m.ltv)) : "—"}</td>
                <td className="px-6 py-3">{m.fte ?? "—"}</td>
                <td className="px-6 py-3">
                  {m.gross_margin_pct != null ? `${Number(m.gross_margin_pct).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
            {!metrics?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-deep/60">
                  Aucune métrique enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
