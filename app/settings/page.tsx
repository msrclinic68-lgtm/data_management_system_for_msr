"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Building, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    
    const [formData, setFormData] = useState({
        clinicName: "",
        clinicLogo: "",
        clinicAddress: "",
        doctorNames: "",
        clinicContact: ""
    });

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        clinicName: data.clinicName || "",
                        clinicLogo: data.clinicLogo || "",
                        clinicAddress: data.clinicAddress || "",
                        doctorNames: data.doctorNames || "",
                        clinicContact: data.clinicContact || ""
                    });
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Branding settings saved successfully!" });
                router.refresh();
            } else {
                const errData = await res.json();
                setMessage({ type: "error", text: errData.error || "Failed to save settings." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Network error. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card className="border-slate-200 shadow-lg rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-3">
                        <Building className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">Clinic Branding & Settings</CardTitle>
                            <CardDescription>Configure clinic branding, doctor names, and contact details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinic Name</label>
                            <Input
                                type="text"
                                placeholder="e.g. Prasad General Clinic"
                                value={formData.clinicName}
                                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                                required
                                className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary shadow-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinic Logo URL (Optional)</label>
                            <Input
                                type="text"
                                placeholder="e.g. https://domain.com/logo.png"
                                value={formData.clinicLogo}
                                onChange={(e) => setFormData({ ...formData, clinicLogo: e.target.value })}
                                className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary shadow-sm"
                            />
                            <p className="text-[10px] text-muted-foreground italic mt-0.5">Leave blank to use the generic text logo.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctor Name(s)</label>
                            <Input
                                type="text"
                                placeholder="e.g. Dr. Prasad, M.B.B.S"
                                value={formData.doctorNames}
                                onChange={(e) => setFormData({ ...formData, doctorNames: e.target.value })}
                                required
                                className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary shadow-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinic Contact Number</label>
                            <Input
                                type="text"
                                placeholder="e.g. +91 98765 43210"
                                value={formData.clinicContact}
                                onChange={(e) => setFormData({ ...formData, clinicContact: e.target.value })}
                                required
                                className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary shadow-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinic Address</label>
                            <textarea
                                placeholder="e.g. 123 Main Street, Clinic City"
                                value={formData.clinicAddress}
                                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                                required
                                rows={3}
                                className="flex w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${
                                message.type === "success" 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                    : "bg-destructive/10 border-destructive/20 text-destructive"
                            }`}>
                                <div className={`h-2 w-2 rounded-full ${message.type === "success" ? "bg-emerald-500" : "bg-destructive"} animate-pulse`} />
                                {message.text}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full rounded-xl h-11 font-bold shadow-md bg-slate-900 hover:bg-black text-white active:scale-[0.98] transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Settings...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Branding Settings
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow bg-slate-50 border-dashed rounded-2xl">
                <CardContent className="p-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Data Security Note</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            These settings are saved to your synchronized Google Sheet. To prevent unauthorized modification of patient data or inventory records, make sure that your Google Spreadsheet access list is limited only to clinic personnel.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
