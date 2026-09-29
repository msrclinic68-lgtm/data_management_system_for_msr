import { getPatientVisits, getDispensedLogs } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { 
    ArrowLeft, User, Calendar, ClipboardList, Pill, Phone, 
    Activity, FileText, Camera, CalendarDays, Pencil, PlusCircle,
    Clock, HeartPulse, CheckCircle2, ChevronRight
} from "lucide-react";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { groupByPatient } from "@/lib/utils-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DispenseDialog } from "@/components/dispense-dialog";
import { DownloadReportButton, DownloadSummaryButton } from "@/components/download-report";
import { ClinicalMediaGallery } from "@/components/media-gallery";
import { DailyNoteSheet } from "@/components/daily-note-sheet";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-slate-100">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
    </div>
);

const InfoRow = ({ label, value, fullWidth = false }: { label: string; value: string | number | undefined; fullWidth?: boolean }) => (
    <div className={`space-y-1 ${fullWidth ? 'col-span-full' : ''}`}>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 min-h-[38px] flex items-center">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                {value || <span className="text-slate-300 font-normal italic">Empty</span>}
            </p>
        </div>
    </div>
);

export default async function PatientProfilePage(props: PageProps) {
    const params = await props.params;
    let assessments: any[] = [];
    let dispensedLogs: any[] = [];
    
    const getSlug = (name: string) => (name || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
        const [data, logs] = await Promise.all([
            getPatientVisits(),
            getDispensedLogs()
        ]);
        assessments = Array.isArray(data)
            ? data.filter((a: any) => a && typeof a === 'object' && !Array.isArray(a) && a.PatientName)
            : [];
        dispensedLogs = Array.isArray(logs) ? logs : [];
    } catch (error) {
        console.error("Failed to fetch data for patient profile:", error);
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-destructive font-bold">Error loading patient details. Check connection settings.</p>
                <Button asChild variant="outline">
                    <Link href="/">Back to Dashboard</Link>
                </Button>
            </div>
        );
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
        <div className="min-h-screen bg-[#fafafa] pb-16 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Top Nav & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 h-10 px-4 font-bold shadow-sm w-fit">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="rounded-xl h-10 px-4 font-bold bg-slate-900 text-white hover:bg-black shadow-sm">
                            <Link href="/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Patient Visit
                            </Link>
                        </Button>
                        <DispenseDialog 
                            patientName={profile.name} 
                            patientSlug={profile.slug} 
                            trigger={
                                <Button size="sm" className="rounded-xl h-10 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                    <Pill className="mr-2 h-4 w-4" />
                                    Dispense Medicine
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Patient Header Card */}
                <Card className="overflow-hidden border-slate-200 shadow-md rounded-2xl bg-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                                    <User className="h-8 w-8 sm:h-10 sm:w-10" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                                        {profile.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-xs uppercase px-2.5 py-0.5">
                                            {profile.totalVisits} Total Visit{profile.totalVisits !== 1 ? 's' : ''}
                                        </Badge>
                                        {latestVisit.Occupation && (
                                            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                                {latestVisit.Occupation}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Age / Gender</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {latestVisit.Age ? `${latestVisit.Age}y` : '-'} • {latestVisit.Sex || '-'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</p>
                                    <p className="text-sm font-bold text-primary truncate max-w-[130px]">
                                        {latestVisit.PhoneNumber || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">First Visit</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {profile.firstVisitDate ? formatDate(profile.firstVisitDate) : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Latest Visit</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {profile.lastVisitDate ? formatDate(profile.lastVisitDate) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Anchor Pills if Multiple Visits */}
                {patientAssessments.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Jump To Visit:</span>
                        {patientAssessments.map((a, idx) => (
                            <a
                                key={idx}
                                href={`#visit-${idx}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition-all shrink-0 shadow-sm"
                            >
                                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                {a.Date ? formatDate(a.Date) : `Visit #${patientAssessments.length - idx}`}
                                {idx === 0 && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-black">LATEST</span>}
                            </a>
                        ))}
                    </div>
                )}

                {/* Comprehensive Visit Clinical Records (No extra clicks needed!) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-primary" />
                            Clinical Visit Details & Assessments
                        </h2>
                        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200">
                            Showing all {patientAssessments.length} consultation record{patientAssessments.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {patientAssessments.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 rounded-2xl bg-white p-12 text-center">
                            <p className="text-slate-400 italic">No visit assessments recorded yet for this patient.</p>
                            <Button asChild className="mt-4 rounded-xl bg-slate-900 text-white">
                                <Link href="/new">Register First Visit</Link>
                            </Button>
                        </Card>
                    ) : (
                        patientAssessments.map((assessment, vIdx) => {
                            const visitNumber = patientAssessments.length - vIdx;
                            const isLatest = vIdx === 0;

                            // Filter medicines dispensed on this visit date
                            const visitDateStr = assessment.Date ? new Date(assessment.Date).toISOString().split('T')[0] : '';
                            const visitDispensed = patientDispensed.filter(log => 
                                log.timestamp && new Date(log.timestamp).toISOString().split('T')[0] === visitDateStr
                            );

                            // Extract media
                            const allMedia: string[] = [];
                            const seen = new Set<string>();
                            ['Media1', 'Media2', 'Media3', 'Media4'].forEach(col => {
                                const val = assessment[col];
                                if (!val) return;
                                const valStr = String(val).trim();
                                if (!seen.has(valStr)) {
                                    allMedia.push(valStr);
                                    seen.add(valStr);
                                }
                            });

                            return (
                                <div key={vIdx} id={`visit-${vIdx}`} className="scroll-mt-6">
                                    <Card className={`border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden ${isLatest ? 'ring-2 ring-primary/20' : ''}`}>
                                        
                                        {/* Visit Card Header with Actions */}
                                        <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-sm">
                                                    #{visitNumber}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                                                            {assessment.Date ? formatDate(assessment.Date) : 'Unknown Date'}
                                                        </h3>
                                                        {isLatest && (
                                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase">
                                                                Most Recent Visit
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {assessment.Timestamp && (
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                            Recorded at: {formatDateTime(assessment.Timestamp)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons for this Visit */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <DownloadReportButton assessment={assessment} />
                                                <DownloadSummaryButton assessment={assessment} />
                                                
                                                <DailyNoteSheet assessment={assessment}>
                                                    <Button variant="secondary" size="sm" className="rounded-xl shadow-sm h-9 px-3.5 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none">
                                                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                                                        Note
                                                    </Button>
                                                </DailyNoteSheet>

                                                <Button asChild size="sm" className="rounded-xl shadow-sm h-9 px-3.5 font-bold bg-slate-900 text-white hover:bg-black">
                                                    <Link href={`/assessment/${assessment.originalIndex}/edit`}>
                                                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                        Edit Record
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        {/* Visit Content Body */}
                                        <CardContent className="p-5 sm:p-6 space-y-6">
                                            
                                            {/* Primary Clinical Evaluation Banner */}
                                            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                                        <HeartPulse className="h-4 w-4 text-amber-600" />
                                                        Clinical Diagnosis
                                                    </span>
                                                </div>
                                                <p className="text-base sm:text-lg font-black text-slate-900 uppercase">
                                                    {assessment.Diagnosis || <span className="text-slate-400 italic font-normal">No diagnosis recorded</span>}
                                                </p>
                                                {assessment.ChiefComplaint && (
                                                    <div className="pt-2 border-t border-amber-200/50">
                                                        <p className="text-[10px] font-bold text-amber-800 uppercase">Chief Complaint / Symptoms:</p>
                                                        <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                                                            {assessment.ChiefComplaint}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Two-Column Clinical Grid */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                
                                                {/* Left Column: Vitals & Medical History */}
                                                <div className="space-y-4">
                                                    <SectionHeader icon={Activity} title="Patient Vitals & Medical History" />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <InfoRow label="Blood Pressure" value={assessment.BloodPressure} />
                                                        <InfoRow label="Diabetes Status" value={assessment.DiabeticMellitus} />
                                                        <InfoRow label="Physique (H / W)" value={`${assessment.Height || '-'} / ${assessment.Weight || '-'}`} />
                                                        <InfoRow label="Gender / Age" value={`${assessment.Sex || '-'} • ${assessment.Age ? `${assessment.Age}y` : '-'}`} />
                                                        <InfoRow label="Diet Habits" value={assessment.DietHabit} fullWidth />
                                                        <InfoRow label="Sleeping History" value={assessment.SleepingHistory} />
                                                        <InfoRow label="Cycle History" value={assessment.MenstruationHistory} />
                                                    </div>

                                                    {/* Diagnostic Imaging / Reports */}
                                                    {assessment.DiagnosticImaging && (
                                                        <div className="mt-3">
                                                            <InfoRow label="Diagnostic Reports & Findings" value={assessment.DiagnosticImaging} fullWidth />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Column: Treatment Plan & Prescriptions */}
                                                <div className="space-y-4">
                                                    <SectionHeader icon={Pill} title="Treatment Plan & Prescriptions" />
                                                    <div className="space-y-3">
                                                        <InfoRow label="Prescription / Treatment Plan" value={assessment.TreatmentPlan} fullWidth />
                                                        <InfoRow label="Additional Remarks / Comments" value={assessment.Comments} fullWidth />
                                                    </div>

                                                    {/* Progress Note Box */}
                                                    {assessment.DailyNote && (
                                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                                                                <FileText className="h-3.5 w-3.5 text-primary" /> Session Note
                                                            </p>
                                                            <p className="text-xs sm:text-sm font-semibold text-slate-700 italic">
                                                                "{assessment.DailyNote}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Dispensed Medicines on This Visit (if any) */}
                                            {visitDispensed.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100">
                                                    <SectionHeader icon={Pill} title="Medicines Dispensed On This Visit" />
                                                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50/70">
                                                                <TableRow>
                                                                    <TableHead className="font-bold text-[9px] uppercase px-4">Medicine Name</TableHead>
                                                                    <TableHead className="font-bold text-[9px] uppercase text-center">Quantity</TableHead>
                                                                    <TableHead className="font-bold text-[9px] uppercase">Dosage Advice</TableHead>
                                                                    <TableHead className="font-bold text-[9px] uppercase text-right pr-4">Time</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {visitDispensed.map((log, idx) => (
                                                                    <TableRow key={log.id || idx}>
                                                                        <TableCell className="font-black text-slate-800 text-xs uppercase px-4">{log.medicineName}</TableCell>
                                                                        <TableCell className="text-center text-xs font-bold text-slate-900">{log.quantity}</TableCell>
                                                                        <TableCell className="text-xs text-slate-500">{log.dosage || '-'}</TableCell>
                                                                        <TableCell className="text-right text-xs text-slate-400 font-mono pr-4">
                                                                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Clinical Media Attachments */}
                                            {allMedia.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100">
                                                    <SectionHeader icon={Camera} title="Clinical Media Attachments" />
                                                    <ClinicalMediaGallery urls={allMedia} />
                                                </div>
                                            )}

                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Patient Dispensed Medicines Full History Log */}
                <div className="pt-4">
                    <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Pill className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <CardTitle className="text-base font-bold">All-Time Dispensed Medicines Log</CardTitle>
                                    <CardDescription>Complete pharmacy dispensing audit trail for {profile.name}.</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="font-bold text-xs">
                                {patientDispensed.length} Total Dispense{patientDispensed.length !== 1 ? 's' : ''}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/30">
                                    <TableRow>
                                        <TableHead className="font-bold text-[10px] px-4">Date</TableHead>
                                        <TableHead className="font-bold text-[10px] px-4">Medicine Name</TableHead>
                                        <TableHead className="font-bold text-[10px] text-center">Quantity</TableHead>
                                        <TableHead className="font-bold text-[10px]">Dosage Advice</TableHead>
                                        <TableHead className="font-bold text-[10px] text-right pr-6">Channel</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientDispensed.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center italic py-10 text-slate-400 text-xs">
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

            </div>
        </div>
    );
}
