import { ThemeProvider } from "@/components/provider/theme-provider";
import "./globals.css";
import { Metadata } from "next";
import { FullLoadingProvider } from "@/components/provider/full-loading-provider";
import { AlertDialogProvider } from "@/components/provider/alert-provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "tongla coding",
  description: "Generated by tongla",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Suspense fallback={<div></div>}>
            <FullLoadingProvider>
              <AlertDialogProvider>{children}</AlertDialogProvider>
            </FullLoadingProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
