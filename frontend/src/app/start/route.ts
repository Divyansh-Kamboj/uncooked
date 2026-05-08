import { getStartRoute } from "@/lib/auth/get-start-route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const route = await getStartRoute();
  return NextResponse.redirect(new URL(route, request.url));
}
