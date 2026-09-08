import { redirect } from "next/navigation";
import { getIdentity, defaultDestination } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const identity = await getIdentity();
  redirect(identity ? defaultDestination(identity) : "/login");
}
