import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "ok", service: "772-notary" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
