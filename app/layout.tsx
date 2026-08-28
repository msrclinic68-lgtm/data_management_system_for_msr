import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getClinicSettings } from "@/lib/data-service";
import { Settings, Building2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  try {
    const settings = await getClinicSettings();
    return {
      title: settings.clinicName || "Clinic Manager",
      description: `Patient and Stock Management System for ${settings.clinicName || "General Clinic"}`,
      icons: {
        icon: settings.clinicLogo || "/logo.jpg",
        apple: settings.clinicLogo || "/logo.jpg",
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: settings.clinicName || "Clinic Manager",
      },
    };
  } catch (error) {
    return {
      title: "Clinic Patient & Stock Management",
      description: "General Clinic Patient and Medicine Stock Management System",
    };
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings: any = {
    clinicName: "General Clinic",
    clinicLogo: "",
    clinicAddress: "",
    doctorNames: "",
    clinicContact: ""
  };

  try {
    settings = await getClinicSettings();
  } catch (error) {
    console.error("Layout failed to load clinic settings:", error);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b sticky top-0 bg-white z-50 shadow-sm">
          <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 bg-slate-100 flex items-center justify-center">
                <img
                  src={settings.clinicLogo || "/logo.jpg"}
                  alt={settings.clinicName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-base sm:text-xl font-bold text-primary tracking-tight truncate max-w-[150px] sm:max-w-none">
                {settings.clinicName || "Clinic Manager"}
              </span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-xl font-black text-[10px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-4 text-slate-600 hover:text-slate-900">
                <Link href="/">DASHBOARD</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-xl font-black text-[10px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-4 text-slate-600 hover:text-slate-900">
                <Link href="/settings">
                  <Settings className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">SETTINGS</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl font-black text-[10px] sm:text-xs h-8 sm:h-9 px-3 sm:px-5 shadow-md bg-slate-900 hover:bg-black transition-all text-white">
                <Link href="/new">NEW VISIT</Link>
              </Button>
            </nav>
          </div>
        </header>
        <main className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
