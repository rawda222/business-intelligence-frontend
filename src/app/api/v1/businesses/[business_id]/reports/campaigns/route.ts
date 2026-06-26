import { NextResponse } from "next/server";
import { getCampaignsReport } from "@/lib/api/mock-db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ business_id: string }> },
) {
  const { business_id } = await params;
  const report = getCampaignsReport(business_id);
  if (!report) {
    return NextResponse.json(
      { detail: "Campaign briefs not generated yet. Run the pipeline first." },
      { status: 404 },
    );
  }
  return NextResponse.json(report);
}
