import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/server/mediators/sessionMediators";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (profile) {
    redirect("/admin");
  }

  return <main className="min-h-screen bg-cream">{children}</main>;
}
