"use client"
import { AppSidebar } from "@/components/app-sidebar";
import { LoadingProvider } from "@/components/provider/loading-provider";
import NavigationProvider from "@/components/provider/navigation-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUserData } from "@/hooks/use-user";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userData] = useUserData();

  useEffect(() => {
    if(userData?.uid === 0) {
      window.location.href = `/login?redirect=${window.location.href}`
    }
  }, [userData]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <NavigationProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </NavigationProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
