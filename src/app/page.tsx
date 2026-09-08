import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { homeForRole } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  redirect(user ? homeForRole(user.role) : "/login");
}
