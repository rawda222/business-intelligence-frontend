import { NextResponse } from "next/server";
import { getSwotReport } from "@/lib/api/mock-db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ business_id: string }> },
) {
  const { business_id } = await params;
  const report = getSwotReport(business_id);
  if (!report) {
    return NextResponse.json(
      { detail: "SWOT report not generated yet. Run the pipeline first." },
      { status: 404 },
    );
  }
  return NextResponse.json(report);
}
