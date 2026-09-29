"use client";

import { useState } from "react";
import { DashboardTable } from "@/components/dashboard-table";
import { StockManagement } from "@/components/stock-management";
import { Users, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assessment {
    id: number | string;
    Date: string;
    Timestamp?: string;
    PatientName: string;
    Age: string;
    Occupation: string;
    Diagnosis?: string;
    ChiefComplaint?: string;
    PastHistory?: string;
    PainIntensity_VAS?: string | number;
    DailyNote?: string;
    PhoneNumber?: string;
    Sex?: string;
    [key: string]: any;
}

interface DashboardTabsProps {
    assessments: Assessment[];
}

export function DashboardTabs({ assessments }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<"patients" | "stock">("patients");

    return (
        <div className="space-y-6">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("patients")}
                    className={cn(
                        "flex items-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-b-2 -mb-px outline-none whitespace-nowrap",
                        activeTab === "patients"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Users className="h-4 w-4 shrink-0" />
                    Patient Management
                </button>
                <button
                    onClick={() => setActiveTab("stock")}
                    className={cn(
                        "flex items-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-b-2 -mb-px outline-none whitespace-nowrap",
                        activeTab === "stock"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Package className="h-4 w-4 shrink-0" />
                    Stock & Inventory
                </button>
            </div>

            {/* Tab Contents */}
            <div className="transition-all duration-300">
                {activeTab === "patients" ? (
                    <DashboardTable assessments={assessments} />
                ) : (
                    <StockManagement />
                )}
            </div>
        </div>
    );
}
