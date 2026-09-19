import { notFound } from "next/navigation";
import { getAdminPrincipal } from "@/modules/auth/session";
import { assertAdmin } from "@/modules/auth/authorization";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getAdminPrincipal();
  if (!principal) notFound();
  assertAdmin(principal);
  return children;
}
