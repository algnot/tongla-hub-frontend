"use client";
import * as React from "react";
import { Code2, SquareTerminal, User2 } from "lucide-react";

import { NavMain } from "@/components/navbar/nav-main";
import { NavUser } from "@/components/navbar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserData } from "@/hooks/use-user";

const navUser = [
  {
    title: "Playground",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Playground",
        url: "/dashboard/",
      }
    ],
  },
  {
    title: "Problems",
    url: "#",
    icon: Code2,
    isActive: true,
    items: [
      {
        title: "All Problems",
        url: "/dashboard/problems",
      }
    ],
  },
  // {
  //   title: "Settings",
  //   url: "#",
  //   icon: Settings2,
  //   isActive: true,
  //   items: [
  //     {
  //       title: "General",
  //       url: "#",
  //     }
  //   ],
  // },
];

const navAdmin = [
  {
    title: "Users",
    url: "/dashboard/users",
    icon: User2,
    isActive: false,
    items: [
      {
        title: "Users",
        url: "/dashboard/admin/users",
      }
    ],
  },
  {
    title: "System",
    url: "/dashboard/users",
    icon: SquareTerminal,
    isActive: false,
    items: [
      {
        title: "Email",
        url: "/dashboard/admin/email",
      },
      {
        title: "One Time Password",
        url: "/dashboard/admin/one-time-password",
      }
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData] = useUserData();
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="mt-5">
        <NavMain items={navUser} title="Dashboard" />
        {
          userData?.role === "ADMIN" && <NavMain items={navAdmin} title="Admin Panel" />
        } 
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
