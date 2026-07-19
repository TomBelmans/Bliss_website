import { getSessionProfileOrRedirect } from "@mediators";
import { ThemeProvider } from "@/lib/context/themeProvider";
import { AppSidebar } from "@/components/custom/navbar/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfileOrRedirect("/admin/login");

  return (
    <ThemeProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar profile={profile} />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AdminBreadcrumb />
            </header>
            <div className="flex-1 p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
