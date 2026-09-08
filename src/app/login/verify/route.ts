import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { verifyMagicLink } from "@/app/actions/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    redirect("/login?error=invalid_token");
  }
  await verifyMagicLink(token);
}
