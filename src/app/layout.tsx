import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scouty Planner",
  description: "Family Calendar and School Lunch Dashboard for the Swentonelli Family",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Scouty Planner",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 bg-ambient min-h-screen text-slate-100 selection:bg-amber-500 selection:text-slate-950 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {children}
      </body>
    </html>
  );
}
