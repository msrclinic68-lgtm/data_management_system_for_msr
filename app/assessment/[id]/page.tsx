import { getPatientVisits, getDispensedLogs } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Pencil, User, ClipboardList, Activity, FileText, Camera, CalendarDays, Pill } from "lucide-react";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { DownloadReportButton, DownloadSummaryButton } from "@/components/download-report";
import { ClinicalMediaGallery } from "@/components/media-gallery";
import { DailyNoteSheet } from "@/components/daily-note-sheet";
import { DispenseDialog } from "@/components/dispense-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
    </div>
);

const InfoRow = ({ label, value, fullWidth = false }: { label: string; value: string | number | undefined; fullWidth?: boolean }) => (
    <div className={`space-y-1 ${fullWidth ? 'col-span-full' : ''}`}>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
        <div className={`p-2.5 rounded-lg bg-slate-50 border border-slate-100 min-h-[42px] flex items-center`}>
            <p className="text-sm font-semibold text-slate-700 leading-snug">
                {value || <span className="text-slate-300 font-normal italic">Empty</span>}
            </p>
        </div>
    </div>
);

export default async function AssessmentDetailPage(props: PageProps) {
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
        console.error("Failed to fetch visit details:", error);
        return (
            <div className="p-4 sm:p-8 space-y-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center text-center py-10">
                            <h2 className="text-xl font-bold text-destructive mb-2">Sync Error</h2>
                            <p className="text-muted-foreground mb-6">Could not connect to the database. Verify APPS_SCRIPT_URL.</p>
                            <Button asChild variant="outline">
                                <Link href="/">Return to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const assessmentIndex = Number(params.id);
    if (isNaN(assessmentIndex) || assessmentIndex < 0 || assessmentIndex >= assessments.length) {
        notFound();
    }

    const assessment = assessments[assessmentIndex];
    const patientName = assessment.PatientName || 'Unnamed Patient';
    const patientSlug = getSlug(patientName);

    // Filter medicines dispensed on this visit (matches name & date split)
    const visitDateStr = assessment.Date ? new Date(assessment.Date).toISOString().split('T')[0] : '';
    const visitDispensed = dispensedLogs.filter(log => 
        log.patientName === patientName && 
        log.timestamp && new Date(log.timestamp).toISOString().split('T')[0] === visitDateStr
    );

    return (
        <div className="min-h-screen bg-[#fafafa] p-4 sm:p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto rounded-xl border-slate-200 bg-white hover:bg-slate-50 h-11 px-4 font-bold shadow-sm">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                        <div className="flex-1 xs:flex-initial">
                            <DownloadReportButton assessment={assessment} className="w-full" />
                        </div>
                        <div className="flex-1 xs:flex-initial">
                            <DownloadSummaryButton assessment={assessment} className="w-full" />
                        </div>
                        
                        <DispenseDialog 
                            patientName={patientName} 
                            patientSlug={patientSlug} 
                            trigger={
                                <Button variant="secondary" size="sm" className="w-full sm:w-auto rounded-xl shadow-md h-11 px-6 font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-none transition-all active:scale-95">
                                    <Pill className="mr-2 h-4 w-4 text-emerald-600" />
                                    Dispense Medicine
                                </Button>
                            }
                        />

                        <DailyNoteSheet assessment={assessment}>
                            <Button variant="secondary" size="sm" className="w-full sm:w-auto rounded-xl shadow-md h-11 px-6 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-none transition-all active:scale-95">
                                <FileText className="mr-2 h-4 w-4" />
                                Session Note
                            </Button>
                        </DailyNoteSheet>
                        <Button asChild size="sm" className="w-full sm:w-auto rounded-xl shadow-lg h-11 px-6 font-bold bg-slate-900 text-white hover:bg-black transition-all active:scale-95">
                            <Link href={`/assessment/${assessmentIndex}/edit`} className="flex items-center justify-center">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Record
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Patient Header */}
                <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                                    <User className="h-6 w-6 sm:h-10 sm:w-10" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight break-words uppercase hover:underline">
                                        <Link href={`/patient/${patientSlug}`}>{patientName}</Link>
                                    </h1>
                                    <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-[12px] font-black text-primary/60 mt-2 uppercase tracking-widest">
                                        <span className="flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md">
                                            <Activity className="h-3.5 w-3.5" /> 
                                            AGE: {assessment.Age || 'N/A'} • {assessment.Sex || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 sm:p-5 rounded-2xl border border-slate-100 flex-shrink-0 shadow-sm text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Consultation Date</p>
                                <p className="text-sm font-black text-slate-800 flex items-center justify-end gap-2">
                                    <CalendarDays className="h-4 w-4 text-primary" />
                                    {formatDate(assessment.Date)}
                                </p>
                                {assessment.Timestamp && (
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                                        Sync: {formatDateTime(assessment.Timestamp).split(' at ')[1]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Demographics and Vitals */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <SectionHeader title="Patient Profile & Vitals" icon={User} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow label="Gender" value={assessment.Sex} />
                                    <InfoRow label="Occupation" value={assessment.Occupation} />
                                    <InfoRow label="Phone" value={assessment.PhoneNumber} />
                                    <InfoRow label="Physique (H / W)" value={`${assessment.Height || '-'} / ${assessment.Weight || '-'}`} />
                                    <InfoRow label="Blood Pressure" value={assessment.BloodPressure} />
                                    <InfoRow label="Diabetes Status" value={assessment.DiabeticMellitus} />
                                    <InfoRow label="Diet Habits" value={assessment.DietHabit} fullWidth />
                                    <InfoRow label="Sleeping History" value={assessment.SleepingHistory} />
                                    <InfoRow label="Cycle History" value={assessment.MenstruationHistory} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle & Right: Evaluation & Dispense Logs */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <SectionHeader title="Clinical Evaluation & Complaint" icon={ClipboardList} />
                                <div className="space-y-4">
                                    <InfoRow label="Chief Complaint & Symptoms" value={assessment.ChiefComplaint} fullWidth />
                                    <InfoRow label="Diagnostic Reports & Findings" value={assessment.DiagnosticImaging} fullWidth />
                                    <InfoRow label="Clinical Diagnosis" value={assessment.Diagnosis} fullWidth />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dispensed medicines on this visit */}
                        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardContent className="p-5">
                                <SectionHeader title="Medicines Dispensed This Visit" icon={Pill} />
                                {visitDispensed.length === 0 ? (
                                    <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl text-slate-400 text-xs">
                                        No medicines dispensed during this session visit yet.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow>
                                                <TableRow className="border-none">
                                                    <TableHead className="font-bold text-[9px] uppercase">Medicine Name</TableHead>
                                                    <TableHead className="font-bold text-[9px] uppercase text-center">Quantity</TableHead>
                                                    <TableHead className="font-bold text-[9px] uppercase">Dosage Advice</TableHead>
                                                    <TableHead className="font-bold text-[9px] uppercase text-right">Time</TableHead>
                                                </TableRow>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {visitDispensed.map((log, idx) => (
                                                <TableRow key={log.id || idx}>
                                                    <TableCell className="font-black text-slate-800 text-xs uppercase">{log.medicineName}</TableCell>
                                                    <TableCell className="text-center text-xs font-bold text-slate-900">{log.quantity}</TableCell>
                                                    <TableCell className="text-xs text-slate-500">{log.dosage || '-'}</TableCell>
                                                    <TableCell className="text-right text-xs text-slate-400 font-mono">
                                                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <SectionHeader title="Treatment Plan & Prescription" icon={Pill} />
                                <div className="space-y-4">
                                    <InfoRow label="Prescription Details" value={assessment.TreatmentPlan} fullWidth />
                                    <InfoRow label="Additional Remarks / Comments" value={assessment.Comments} fullWidth />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white border-t-2 border-t-slate-800">
                            <CardContent className="p-5 space-y-6">
                                <SectionHeader title="Consultation Progress Note" icon={FileText} />
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 tracking-widest mb-2 uppercase">Progress Note Entry</p>
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                                        "{assessment.DailyNote || 'No entry recorded for this session.'}"
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media gallery */}
                        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <SectionHeader title="Clinical Media Attachments" icon={Camera} />
                                {(() => {
                                    const allMedia: string[] = [];
                                    const seen = new Set<string>();
                                    const mediaColumns = ['Media1', 'Media2', 'Media3', 'Media4'];
                                    
                                    mediaColumns.forEach(col => {
                                        const value = assessment[col];
                                        if (!value) return;
                                        const valStr = String(value).trim();
                                        if (!seen.has(valStr)) {
                                            allMedia.push(valStr);
                                            seen.add(valStr);
                                        }
                                    });

                                    if (allMedia.length === 0) {
                                        return <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl text-slate-300 text-[11px] font-black uppercase">No Media Files Attached</div>;
                                    }

                                    return <ClinicalMediaGallery urls={allMedia} />;
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
