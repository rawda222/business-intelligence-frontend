import { NextResponse, type NextRequest } from "next/server";
import { refresh } from "@/lib/api/mock-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.refresh_token) {
      return NextResponse.json({ detail: "refresh_token is required." }, { status: 400 });
    }
    const res = refresh(String(body.refresh_token));
    if (!res) {
      return NextResponse.json({ detail: "Invalid refresh token." }, { status: 401 });
    }
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }
}
