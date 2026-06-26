import { NextResponse } from "next/server";
import { getHistory } from "@/lib/api/mock-db";

export async function GET() {
  return NextResponse.json(getHistory());
}
