import { AppSidebar } from "@/components/app-sidebar";
import { LoadingProvider } from "@/components/provider/loading-provider";
import NavigationProvider from "@/components/provider/navigation-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
