import { Button } from "@/components/ui/button";
import { getFromGoogleSheet, getClinicSettings } from "@/lib/apps-script";
import Link from "next/link";
import { PlusCircle, RefreshCw } from "lucide-react";
import { DashboardTabs } from "@/components/dashboard-tabs";

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fetch fresh data

export default async function Home() {
  let assessments: any[] = [];
  let error: string | null = null;
  let settings = { clinicName: "General Clinic" };
  
  try {
    const [data, settingsData] = await Promise.all([
      getFromGoogleSheet(),
      getClinicSettings()
    ]);
    // Sanity filter: remove null, undefined, arrays, or non-object rows
    assessments = Array.isArray(data)
      ? data.filter((a: any) => a && typeof a === 'object' && !Array.isArray(a) && a.PatientName)
      : [];
    settings = settingsData;
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    error = err instanceof Error ? err.message : "Could not connect to Google Sheets";
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {settings.clinicName || "Clinic Manager"} Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Showing {assessments.length} patient record{assessments.length !== 1 ? 's' : ''} • Live synced with Google Sheets
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <form>
            <Button type="submit" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </form>
          <Button asChild size="sm" className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-slate-900 text-white">
            <Link href="/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>New Patient Visit</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <p className="text-sm font-medium">
            <span className="font-bold">Sync Error:</span> {error}. Please verify your deployment settings or try refreshing.
          </p>
        </div>
      )}

      <DashboardTabs assessments={assessments} />
    </div>
  );
}
