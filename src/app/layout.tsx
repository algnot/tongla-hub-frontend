import { ThemeProvider } from "@/components/provider/theme-provider";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "tongla hub admin",
  description: "Generated by create next app",
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
