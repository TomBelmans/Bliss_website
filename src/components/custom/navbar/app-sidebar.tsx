"use client";

import type { ComponentProps, FunctionComponent } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  CalendarDays,
  CalendarCheck,
  Receipt,
  Users,
  Home,
} from "lucide-react";
import { NavMain } from "@/components/custom/navbar/nav-main";
import { NavUser } from "@/components/custom/navbar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Profile } from "@models";

const navItems = [
  { title: "Overzicht", url: "/admin", icon: LayoutDashboard },
  { title: "Diensten", url: "/admin/diensten", icon: Sparkles },
  { title: "Producten", url: "/admin/producten", icon: ShoppingBag },
  { title: "Kalender", url: "/admin/kalender", icon: CalendarDays },
  { title: "Boekingen", url: "/admin/boekingen", icon: CalendarCheck },
  { title: "Klanten", url: "/admin/klanten", icon: Users },
  { title: "Bestellingen", url: "/admin/bestellingen", icon: Receipt },
];

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  profile: Profile;
}

export const AppSidebar: FunctionComponent<AppSidebarProps> = ({ profile, ...props }) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="font-serif text-sm">B</span>
                </div>
                <div className="grid flex-1 rounded-md border border-sidebar-foreground/80 px-2 py-1 text-center text-sm leading-tight">
                  <span className="truncate font-medium uppercase tracking-[0.15em]">Bliss</span>
                  <span className="truncate font-handwriting text-xs text-gold">Beauty by Norah</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Naar website">
              <Link href="/">
                <Home />
                <span>Naar website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={profile} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
