"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Search, RefreshCw, AlertTriangle, Package, History, ArrowUpRight, Scale, ArrowDownRight, Edit3, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { DispenseDialog } from "@/components/dispense-dialog";

interface Medicine {
    id?: string | number;
    name: string;
    type: string;
    unitMeasurement: string;
    totalStock: number;
    availableStock: number;
    pendingStock: number;
    outgoingStock: number;
    lowStockThreshold: number;
    oldName?: string;
}

interface DispensedRecord {
    id?: string | number;
    timestamp?: string;
    patientName: string;
    patientSlug: string;
    medicineName: string;
    quantity: number;
    dosage?: string;
    type: string;
}

export function StockManagement() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [dispensedLogs, setDispensedLogs] = useState<DispensedRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // Modals open state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

    // Form inputs
    const [newMed, setNewMed] = useState({
        name: "",
        type: "Tablet",
        unitMeasurement: "mg",
        availableStock: "",
        pendingStock: "",
        lowStockThreshold: "10"
    });

    const [adjustment, setAdjustment] = useState({
        quantity: "",
        type: "add", // add, subtract, set
        notes: ""
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Load data
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [medRes, logRes] = await Promise.all([
                fetch("/api/stock"),
                fetch("/api/dispense")
            ]);

            if (medRes.ok && logRes.ok) {
                const medData = await medRes.json();
                const logData = await logRes.json();
                setMedicines(Array.isArray(medData) ? medData : []);
                setDispensedLogs(Array.isArray(logData) ? logData : []);
            }
        } catch (error) {
            console.error("Failed to load inventory data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Add Medicine
    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMed.name) return;

        setIsActionLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const available = Number(newMed.availableStock) || 0;
            const pending = Number(newMed.pendingStock) || 0;

            const payload: Medicine = {
                name: newMed.name,
                type: newMed.type,
                unitMeasurement: newMed.unitMeasurement,
                totalStock: available + pending,
                availableStock: available,
                pendingStock: pending,
                outgoingStock: 0,
                lowStockThreshold: Number(newMed.lowStockThreshold) || 10
            };

            const response = await fetch("/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create", ...payload })
            });

            if (response.ok) {
                setSuccessMessage("Medicine added successfully!");
                setNewMed({
                    name: "",
                    type: "Tablet",
                    unitMeasurement: "mg",
                    availableStock: "",
                    pendingStock: "",
                    lowStockThreshold: "10"
                });
                setIsAddOpen(false);
                loadData();
            } else {
                const err = await response.json();
                setErrorMessage(err.error || "Failed to add medicine.");
            }
        } catch (error) {
            setErrorMessage("Failed to save. Check your connection.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Adjust Stock Levels
    const handleAdjustStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMed) return;

        const qty = Number(adjustment.quantity);
        if (isNaN(qty) || qty <= 0) {
            setErrorMessage("Please enter a valid positive quantity.");
            return;
        }

        setIsActionLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            let totalStock = Number(selectedMed.totalStock) || 0;
            let availableStock = Number(selectedMed.availableStock) || 0;
            let pendingStock = Number(selectedMed.pendingStock) || 0;
            let outgoingStock = Number(selectedMed.outgoingStock) || 0;

            if (adjustment.type === "add") {
                availableStock += qty;
                totalStock += qty;
            } else if (adjustment.type === "subtract") {
                if (availableStock < qty) {
                    setErrorMessage(`Insufficient stock. Available: ${availableStock}`);
                    setIsActionLoading(false);
                    return;
                }
                availableStock -= qty;
                totalStock -= qty;
                outgoingStock += qty;
            } else if (adjustment.type === "set") {
                availableStock = qty;
                totalStock = qty + pendingStock;
            }

            const updated: Medicine = {
                ...selectedMed,
                totalStock,
                availableStock,
                pendingStock,
                outgoingStock,
                lowStockThreshold: Number(selectedMed.lowStockThreshold) || 10
            };

            const response = await fetch("/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", ...updated })
            });

            if (response.ok) {
                setSuccessMessage("Stock adjusted successfully!");
                setAdjustment({ quantity: "", type: "add", notes: "" });
                setIsAdjustOpen(false);
                setSelectedMed(null);
                loadData();
            } else {
                const err = await response.json();
                setErrorMessage(err.error || "Failed to adjust stock.");
            }
        } catch (error) {
            setErrorMessage("Failed to adjust stock level.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Filters
    const filteredMedicines = (medicines || []).filter(med => {
        if (!med) return false;
        const name = String(med.name || "").toLowerCase();
        const type = String(med.type || "").toLowerCase();
        const oldName = String(med.oldName || "").toLowerCase();
        const query = (searchQuery || "").trim().toLowerCase();
        if (!query) return true;
        return name.includes(query) || type.includes(query) || oldName.includes(query);
    });

    const lowStockItems = (medicines || []).filter(med => 
        med && (Number(med.availableStock) || 0) <= (Number(med.lowStockThreshold) || 10)
    );

    return (
        <div className="space-y-6">
            
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Medicines</span>
                            <p className="text-2xl font-black text-slate-800">{medicines.length}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <Package className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white border-l-4 border-l-amber-500">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Low Stock Alerts</span>
                            <p className="text-2xl font-black text-amber-600">{lowStockItems.length}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Orders</span>
                            <p className="text-2xl font-black text-blue-600">
                                {medicines.reduce((acc, curr) => acc + (Number(curr.pendingStock) || 0), 0)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <Scale className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Dispenses Logged</span>
                            <p className="text-2xl font-black text-emerald-600">{dispensedLogs.length}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <History className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadData}
                        disabled={isLoading}
                        className="h-10 px-4 rounded-xl border-slate-200"
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                        Refresh
                    </Button>

                    <DispenseDialog 
                        patientName="" 
                        patientSlug="" 
                        trigger={
                            <Button size="sm" className="rounded-xl h-10 px-4 bg-emerald-600 text-white hover:bg-emerald-700">
                                <PlusCircle className="mr-2 h-4 w-4" /> Quick Dispense
                            </Button>
                        }
                        onSuccess={loadData}
                    />

                    {/* Add Medicine Dialog */}
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="rounded-xl h-10 px-4 bg-slate-900 text-white hover:bg-black">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Medicine
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white">
                            <form onSubmit={handleAddMedicine}>
                                <DialogHeader>
                                    <DialogTitle>Register New Medicine</DialogTitle>
                                    <DialogDescription>Create a new medicine entry in the stock ledger.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {errorMessage && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">{errorMessage}</div>}
                                    {successMessage && <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl font-bold">{successMessage}</div>}
                                    
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Medicine Name</label>
                                        <Input
                                            required
                                            value={newMed.name}
                                            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                            placeholder="e.g. Paracetamol"
                                            className="rounded-xl mt-1"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Type / Form</label>
                                            <select
                                                value={newMed.type}
                                                onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
                                                className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary mt-1"
                                            >
                                                <option value="Tablet">Tablet</option>
                                                <option value="Capsule">Capsule</option>
                                                <option value="Syrup">Syrup</option>
                                                <option value="Injection">Injection</option>
                                                <option value="Ointment">Ointment</option>
                                                <option value="Drops">Drops</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Unit Measure</label>
                                            <Input
                                                value={newMed.unitMeasurement}
                                                onChange={(e) => setNewMed({ ...newMed, unitMeasurement: e.target.value })}
                                                placeholder="e.g. mg, ml"
                                                className="rounded-xl mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Available</label>
                                            <Input
                                                type="number"
                                                value={newMed.availableStock}
                                                onChange={(e) => setNewMed({ ...newMed, availableStock: e.target.value })}
                                                placeholder="0"
                                                className="rounded-xl mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Pending</label>
                                            <Input
                                                type="number"
                                                value={newMed.pendingStock}
                                                onChange={(e) => setNewMed({ ...newMed, pendingStock: e.target.value })}
                                                placeholder="0"
                                                className="rounded-xl mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Threshold</label>
                                            <Input
                                                type="number"
                                                value={newMed.lowStockThreshold}
                                                onChange={(e) => setNewMed({ ...newMed, lowStockThreshold: e.target.value })}
                                                placeholder="10"
                                                className="rounded-xl mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isActionLoading} className="rounded-xl bg-slate-900 text-white">
                                        {isActionLoading ? "Saving..." : "Register Medicine"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Inventory and Logs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Inventory Table (Left & Middle) */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold">Medicine Inventory & Stock Levels</CardTitle>
                            <CardDescription>Real-time listing of clinic pharmaceuticals and alert status.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="px-4 font-bold text-[10px] uppercase text-slate-500">Name</TableHead>
                                            <TableHead className="w-[100px] px-4 font-bold text-[10px] uppercase text-slate-500 text-center">Type</TableHead>
                                            <TableHead className="w-[100px] px-4 font-bold text-[10px] uppercase text-slate-500 text-center">Total Stock</TableHead>
                                            <TableHead className="w-[110px] px-4 font-bold text-[10px] uppercase text-slate-500 text-center">Available Stock</TableHead>
                                            <TableHead className="w-[90px] px-4 font-bold text-[10px] uppercase text-slate-500 text-center">Status</TableHead>
                                            <TableHead className="w-[80px] text-right pr-6 font-bold text-[10px] uppercase text-slate-500">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-slate-400 italic">
                                                    Fetching live stock levels...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredMedicines.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-slate-400 italic">
                                                    No medicines match search query.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMedicines.map((med, idx) => {
                                                const avail = Number(med.availableStock) || 0;
                                                const thresh = Number(med.lowStockThreshold) || 10;
                                                const isLow = avail <= thresh;

                                                return (
                                                    <TableRow key={med.id || idx}>
                                                        <TableCell className="px-4 py-3">
                                                            <div className="font-black text-slate-800 text-sm uppercase">{med.name}</div>
                                                            {med.oldName && (
                                                                <div className="text-[11px] text-slate-400 font-medium italic">
                                                                    Formerly: {med.oldName}
                                                                </div>
                                                            )}
                                                            <div className="text-[10px] text-slate-400">Unit: {med.unitMeasurement}</div>
                                                        </TableCell>
                                                        <TableCell className="text-center px-4 py-3">
                                                            <Badge variant="secondary" className="rounded-lg text-[10px] font-black uppercase text-slate-600 bg-slate-100">
                                                                {med.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold px-4 py-3 text-slate-600">{med.totalStock}</TableCell>
                                                        <TableCell className="text-center font-black px-4 py-3 text-slate-800">{avail}</TableCell>
                                                        <TableCell className="text-center px-4 py-3">
                                                            {isLow ? (
                                                                <Badge className="bg-red-50 hover:bg-red-50 text-red-600 border border-red-200 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                                                    LOW
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                                                    OK
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6 py-3">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-8 rounded-lg text-[9px] font-black border-slate-200"
                                                                onClick={() => {
                                                                    setSelectedMed(med);
                                                                    setIsAdjustOpen(true);
                                                                }}
                                                            >
                                                                <Edit3 className="h-3 w-3 mr-1" /> ADJUST
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Dispense Logs Timeline (Right) */}
                <div className="space-y-4">
                    <h3 className="text-md font-bold flex items-center gap-2 text-slate-800">
                        <History className="h-4 w-4 text-primary" />
                        Recent Dispense Logs
                    </h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {dispensedLogs.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic bg-white">
                                No medicines dispensed yet.
                             </div>
                        ) : (
                            [...dispensedLogs].sort((a,b) => String(b.timestamp || '').localeCompare(String(a.timestamp || ''))).map((log, idx) => (
                                <Card key={log.id || idx} className="rounded-xl shadow-sm border border-slate-200 bg-white">
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-black text-xs text-slate-800 uppercase leading-snug">{log.patientName}</div>
                                                <p className="text-[10px] text-slate-400">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"} • {log.timestamp ? new Date(log.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' }) : ''}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                                                        {log.quantity} units
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-bold uppercase truncate max-w-[120px]">
                                                        {log.medicineName}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 border shrink-0">
                                                {log.type}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Adjust Stock Level Modal */}
            <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white">
                    {selectedMed && (
                        <form onSubmit={handleAdjustStock}>
                            <DialogHeader>
                                <DialogTitle>Adjust Stock Levels</DialogTitle>
                                <DialogDescription>
                                    Modify quantity details for <span className="font-bold text-slate-800 uppercase">{selectedMed.name}</span>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {errorMessage && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">{errorMessage}</div>}
                                
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                                    <p><span className="font-bold text-slate-500 uppercase">Current Available:</span> <span className="font-bold text-slate-800">{selectedMed.availableStock}</span></p>
                                    <p><span className="font-bold text-slate-500 uppercase">Current Pending:</span> <span className="font-bold text-slate-800">{selectedMed.pendingStock}</span></p>
                                    <p><span className="font-bold text-slate-500 uppercase">Total Stock:</span> <span className="font-bold text-slate-800">{selectedMed.totalStock}</span></p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Adjustment Type</label>
                                    <select
                                        value={adjustment.type}
                                        onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value })}
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary mt-1"
                                    >
                                        <option value="add">Add Stock (Receive/Purchase)</option>
                                        <option value="subtract">Subtract Stock (Dispense/Write-off)</option>
                                        <option value="set">Overwrite Stock (Override Available level)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Quantity ({selectedMed.unitMeasurement})</label>
                                    <Input
                                        type="number"
                                        required
                                        value={adjustment.quantity}
                                        onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                                        placeholder="Enter adjustment qty..."
                                        className="rounded-xl mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Notes / Remarks</label>
                                    <Input
                                        value={adjustment.notes}
                                        onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                                        placeholder="e.g. Purchase order #123"
                                        className="rounded-xl mt-1"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isActionLoading} className="rounded-xl bg-slate-900 text-white">
                                    {isActionLoading ? "Processing..." : "Commit Stock Adjust"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
