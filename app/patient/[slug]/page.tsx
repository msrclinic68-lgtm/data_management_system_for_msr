import { getFromGoogleSheet, getDispensedLogs } from "@/lib/apps-script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, User, Calendar, ClipboardList, Pill, Phone, Building } from "lucide-react";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format-date";
import { groupByPatient } from "@/lib/utils-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DispenseDialog } from "@/components/dispense-dialog";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function PatientProfilePage(props: PageProps) {
    const params = await props.params;
    let assessments: any[] = [];
    let dispensedLogs: any[] = [];
    
    const getSlug = (name: string) => (name || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
        const [data, logs] = await Promise.all([
            getFromGoogleSheet(),
            getDispensedLogs()
        ]);
        assessments = Array.isArray(data)
            ? data.filter((a: any) => a && typeof a === 'object' && !Array.isArray(a) && a.PatientName)
            : [];
        dispensedLogs = Array.isArray(logs) ? logs : [];
    } catch (error) {
        console.error("Failed to fetch data for patient profile:", error);
        return <div className="p-8 text-center">Error loading patient details. Check connection settings.</div>;
    }

    const profiles = groupByPatient(assessments);
    const profile = profiles.find(p => p.slug === params.slug);

    if (!profile) {
        notFound();
    }

    const patientAssessments = profile.assessmentIndices.map(i => ({
        ...assessments[i],
        originalIndex: i
    })).sort((a, b) => (b.Date || '').localeCompare(a.Date || ''));

    // Filter dispensed logs for this patient
    const patientDispensed = dispensedLogs.filter(
        log => log.patientSlug === params.slug || getSlug(log.patientName) === params.slug
    );

    // Latest demographics from the most recent visit
    const latestVisit = patientAssessments[0] || {};

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                
                <DispenseDialog 
                    patientName={profile.name} 
                    patientSlug={profile.slug} 
                    trigger={
                        <Button className="rounded-xl h-10 px-5 font-bold shadow-md bg-slate-900 text-white">
                            <Pill className="mr-2 h-4 w-4" />
                            Dispense Medicine
                        </Button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section: Demographics & Dispensed Logs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/20">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight uppercase">{profile.name}</h1>
                                <p className="text-muted-foreground font-semibold">Patient Profile • {profile.totalVisits} Visit{profile.totalVisits !== 1 ? 's' : ''}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-primary/10">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Age / Gender</p>
                                    <p className="text-sm font-semibold truncate">{latestVisit.Age ? `${latestVisit.Age}y` : 'Age?'} / {latestVisit.Sex || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Contact Phone</p>
                                    <p className="text-sm font-semibold truncate text-primary">{latestVisit.PhoneNumber || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">First Visit</p>
                                    <p className="text-sm font-semibold truncate">{profile.firstVisitDate ? formatDate(profile.firstVisitDate) : 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Last Visit</p>
                                    <p className="text-sm font-semibold truncate">{profile.lastVisitDate ? formatDate(profile.lastVisitDate) : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dispensed History Table */}
                    <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center gap-2">
                            <Pill className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Dispensed Medicines Log</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/30">
                                    <TableRow>
                                        <TableHead className="font-bold text-[10px] px-4">Date</TableHead>
                                        <TableHead className="font-bold text-[10px] px-4">Medicine Name</TableHead>
                                        <TableHead className="font-bold text-[10px] text-center">Qty</TableHead>
                                        <TableHead className="font-bold text-[10px]">Dosage Advice</TableHead>
                                        <TableHead className="font-bold text-[10px] text-right pr-6">Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientDispensed.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center italic py-12 text-slate-400 text-xs">
                                                No dispensed medicine records found for this patient.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        [...patientDispensed].sort((a,b) => String(b.timestamp || '').localeCompare(String(a.timestamp || ''))).map((log, idx) => (
                                            <TableRow key={log.id || idx}>
                                                <TableCell className="text-xs text-slate-500 font-mono px-4">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                                                </TableCell>
                                                <TableCell className="font-black text-slate-800 text-xs uppercase px-4">{log.medicineName}</TableCell>
                                                <TableCell className="text-center text-xs font-bold text-slate-900">{log.quantity}</TableCell>
                                                <TableCell className="text-xs text-slate-500">{log.dosage || '-'}</TableCell>
                                                <TableCell className="text-right text-[10px] font-black uppercase text-slate-400 pr-6">{log.type}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section: Visit History List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Visit Records Timeline
                    </h2>
                    <div className="space-y-3">
                        {patientAssessments.map((a, idx) => (
                            <Link key={idx} href={`/assessment/${a.originalIndex}`}>
                                <Card className="hover:border-primary/50 transition-colors cursor-pointer group rounded-xl shadow-sm hover:shadow">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex flex-col items-center justify-center text-[10px] font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{a.Date ? formatDate(a.Date) : 'Unknown Date'}</p>
                                                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">Diagnosis: <span className="font-semibold text-slate-600">{a.Diagnosis || '-'}</span></p>
                                            </div>
                                        </div>
                                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                            →
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
