import { NextResponse, type NextRequest } from "next/server";
import { me } from "@/lib/api/mock-auth";

export async function GET(req: NextRequest) {
  const user = me(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json(user);
}
