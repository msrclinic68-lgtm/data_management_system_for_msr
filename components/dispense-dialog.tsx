"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pill, PlusCircle, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medicine {
    id?: string;
    ID?: string;
    name: string;
    availableStock: number;
    AvailableStock?: number;
    unit: string;
    Unit?: string;
    unitMeasurement: string;
    UnitMeasurement?: string;
}

interface DispenseDialogProps {
    patientName: string;
    patientSlug: string;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function DispenseDialog({ patientName, patientSlug, onSuccess, trigger }: DispenseDialogProps) {
    const [open, setOpen] = useState(false);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [fields, setFields] = useState({
        medicineName: "",
        quantity: "",
        dosage: "",
    });

    useEffect(() => {
        if (open) {
            loadMedicines();
            setError(null);
            setSuccess(false);
            setFields({ medicineName: "", quantity: "", dosage: "" });
        }
    }, [open]);

    async function loadMedicines() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/stock");
            if (res.ok) {
                const data = await res.json();
                // Show medicines with available stock
                setMedicines(data);
            }
        } catch (err) {
            console.error("Failed to load medicines:", err);
            setError("Failed to load medicine inventory.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const qty = Number(fields.quantity);
        if (isNaN(qty) || qty <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            patientName,
            patientSlug,
            medicineName: fields.medicineName,
            quantity: qty,
            dosage: fields.dosage || "",
            type: "patient"
        };

        try {
            const res = await fetch("/api/dispense", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess(true);
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    setOpen(false);
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to dispense medicine.");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="h-8 rounded-lg text-[10px] font-black px-3 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all">
                        <Pill className="mr-1 h-3.5 w-3.5" /> DISPENSE
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border-none">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Pill className="h-5 w-5 text-emerald-600" />
                            Dispense Medicine
                        </DialogTitle>
                        <DialogDescription>
                            Dispense medicine to <span className="font-bold text-slate-900 uppercase">"{patientName}"</span>. Stock counts will update in real time.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Medicine successfully dispensed & recorded!</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Select Medicine</label>
                            {isLoading ? (
                                <div className="text-xs text-slate-400 italic mt-2 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading medicine stock...
                                </div>
                            ) : (
                                <select
                                    required
                                    value={fields.medicineName}
                                    onChange={(e) => setFields({ ...fields, medicineName: e.target.value })}
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary mt-1"
                                >
                                    <option value="">-- Choose Medicine --</option>
                                    {medicines.map((med, idx) => {
                                        const avail = Number(med.availableStock) || 0;
                                        const name = med.name;
                                        return (
                                            <option key={med.id || idx} value={name} disabled={avail <= 0}>
                                                {name} (Avail: {avail} {med.unitMeasurement})
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                                <Input
                                    type="number"
                                    required
                                    value={fields.quantity}
                                    onChange={(e) => setFields({ ...fields, quantity: e.target.value })}
                                    className="rounded-xl h-10 border-slate-200 mt-1"
                                    placeholder="e.g. 10"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Dosage Advice</label>
                                <Input
                                    type="text"
                                    value={fields.dosage}
                                    onChange={(e) => setFields({ ...fields, dosage: e.target.value })}
                                    className="rounded-xl h-10 border-slate-200 mt-1"
                                    placeholder="e.g. 1-0-1 after food"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-11 font-semibold">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || success} className="rounded-xl h-11 font-bold bg-slate-900 hover:bg-black text-white px-6">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Dispensing...
                                </>
                            ) : "Confirm & Dispense"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
