import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { computeForOrg } from "@/lib/score-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const supabase = await createClient();
  const data = await computeForOrg(supabase, orgId);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data.result);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const data = await computeForOrg(supabase, orgId);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { error } = await supabase.from("scalability_scores").insert({
    organization_id: orgId,
    score: data.result.total,
    breakdown: {
      financial: data.result.financial,
      operational: data.result.operational,
      maturity: data.result.maturity,
      details: data.result.details,
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json(data.result);
}
