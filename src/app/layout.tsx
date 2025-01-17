import type { Metadata } from "next";
import { ThemeProvider } from "@/components/provider/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tongla Hub Admin",
  description: "Tongla Hub Admin v1.0.0",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
