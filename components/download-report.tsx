"use client";

import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { useState } from "react";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

interface ReportProps {
    assessment: any;
    className?: string;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous"; // Avoid CORS canvas issues
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

const drawHeader = (doc: any, logoImg: HTMLImageElement | null, pageWidth: number, settings: any) => {
    // Clinic Name
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(settings.clinicName || 'Clinic Manager', 15, 21);
    
    // Doctor names & Contact info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text(`DOCTORS: ${settings.doctorNames || 'Medical Staff'}`, 15, 26);
    doc.text(`CONTACT: ${settings.clinicContact || '123-456-7890'}`, 15, 30);
    
    // Draw Header Logo
    if (logoImg) {
        doc.addImage(logoImg, 'PNG', pageWidth - 15 - 20, 11, 20, 20);
    }
    
    // Divider Line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(15, 35, pageWidth - 15, 35);
};

const drawFooter = (doc: any, pageWidth: number, i: number, totalPages: number, settings: any) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, 271, pageWidth - 15, 271);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text(settings.clinicAddress || 'Clinic Location Address', pageWidth / 2, 276, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
    doc.text('This document is a confidential medical record and should be treated as such.', pageWidth / 2, 289, { align: 'center' });
};

const drawDemographicsGrid = (doc: any, assessment: any, yStart: number, pageWidth: number): number => {
    const col1 = 15;
    const col2 = 65;
    const col3 = 115;
    let y = yStart;

    const row = (label1: string, val1: string, label2: string, val2: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label1, col1, y);
        doc.text(label2, col3, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(String(val1 || 'N/A'), col2, y);
        doc.text(String(val2 || 'N/A'), col2 + 80, y);
        y += 5.5;
    };

    row('PATIENT NAME', assessment.PatientName, 'PHONE', assessment.PhoneNumber);
    row('AGE', assessment.Age, 'GENDER', assessment.Sex);
    row('OCCUPATION', assessment.Occupation, 'HEIGHT / WEIGHT', `${assessment.Height || '-'} / ${assessment.Weight || '-'}`);
    row('BP VITALS', assessment.BloodPressure, 'DIABETES', assessment.DiabeticMellitus);
    row('DIET HABIT', assessment.DietHabit, 'SLEEP HISTORY', assessment.SleepingHistory);
    row('CYCLE HISTORY', assessment.MenstruationHistory, 'VISIT DATE', formatDate(assessment.Date));

    return y;
};

// ── 1. Full Medical Report Button ──
export function DownloadReportButton({ assessment, className }: ReportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    async function generatePDF() {
        setIsGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 15;

            // Fetch dynamic clinic branding
            let settings = {
                clinicName: "General Clinic",
                clinicLogo: "",
                clinicAddress: "123 Main Street",
                clinicContact: "123-456-7890",
                doctorNames: "Medical Doctor"
            };
            try {
                const settingsRes = await fetch("/api/settings");
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    settings = { ...settings, ...data };
                }
            } catch (err) { console.error("Failed to load settings for PDF:", err); }

            // Fetch medicines dispensed on this visit
            let dispensedItems: any[] = [];
            try {
                const dispRes = await fetch("/api/dispense");
                if (dispRes.ok) {
                    const logs = await dispRes.json();
                    const visitDateStr = new Date(assessment.Date).toISOString().split('T')[0];
                    dispensedItems = logs.filter((log: any) => 
                        (log.patientName === assessment.PatientName) && 
                        (log.timestamp && new Date(log.timestamp).toISOString().split('T')[0] === visitDateStr)
                    );
                }
            } catch (err) { console.error("Failed to load dispense logs for PDF:", err); }

            // Load logo image
            let logoImg: HTMLImageElement | null = null;
            if (settings.clinicLogo) {
                try {
                    logoImg = await loadImage(settings.clinicLogo);
                } catch (e) { console.error("Logo load error:", e); }
            }

            const addTitle = (text: string) => {
                if (y > 240) { 
                    doc.addPage(); 
                    y = 45; 
                }
                // Accent indicator
                doc.setFillColor(30, 58, 138); // Blue-800
                doc.rect(15, y - 4.5, 3, 6.5, 'F');

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 58, 138);
                doc.text(text, 20, y);
                y += 2;
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.4);
                doc.line(15, y, pageWidth - 15, y);
                y += 7;
            };

            const addField = (label: string, value: string | undefined | null) => {
                if (y > 260) { 
                    doc.addPage(); 
                    y = 45; 
                }
                const val = value || 'N/A';

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 116, 139);
                doc.text(`${label.toUpperCase()}`, 15, y);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59);
                const lines = doc.splitTextToSize(String(val), pageWidth - 80);
                doc.text(lines, 65, y);
                y += Math.max(lines.length * 4.2, 6) + 1.5;
            };

            // ── Document Title ──
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.text('CLINICAL ASSESSMENT REPORT', pageWidth / 2, 42, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`Visit Index ID: #${String(assessment.id || 'NEW')}`, pageWidth / 2, 46, { align: 'center' });
            y = 54;

            // ── Patient Demographics ──
            addTitle('I. PATIENT IDENTIFICATION');
            y = drawDemographicsGrid(doc, assessment, y, pageWidth);
            y += 8;

            // ── Clinical Evaluation ──
            addTitle('II. CLINICAL EVALUATION');
            addField('Chief Complaint', assessment.ChiefComplaint);
            addField('Diagnostic Imaging', assessment.DiagnosticImaging);
            addField('Clinical Diagnosis', assessment.Diagnosis);
            y += 4;

            // ── Dispensed Medicines on Visit ──
            if (dispensedItems.length > 0) {
                addTitle('III. DISPENSED MEDICINES');
                dispensedItems.forEach((item, idx) => {
                    addField(`Med #${idx+1}`, `${item.medicineName} - Qty: ${item.quantity} (${item.dosage || 'No dosage advice'})`);
                });
                y += 4;
            }

            // ── Prescription & Advice ──
            addTitle('IV. MANAGEMENT & PRESCRIPTION ADVICE');
            addField('Prescription Advice', assessment.TreatmentPlan);
            addField('Daily progress note', assessment.DailyNote);
            addField('Additional Remarks', assessment.Comments);

            // ── Post-Process Headers, Footers, and Watermarks ──
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                
                // Draw watermark
                if (logoImg) {
                    try {
                        const GStateClass = (doc as any).GState;
                        if (GStateClass) {
                            doc.saveGraphicsState();
                            doc.setGState(new GStateClass({ opacity: 0.03 }));
                            doc.addImage(logoImg, 'PNG', (pageWidth - 70) / 2, (297 - 70) / 2, 70, 70);
                            doc.restoreGraphicsState();
                        }
                    } catch (err) { console.error("Watermark error:", err); }
                }

                drawHeader(doc, logoImg, pageWidth, settings);
                drawFooter(doc, pageWidth, i, totalPages, settings);
            }

            const fileName = `ClinicReport_${(assessment.PatientName || 'Patient').replace(/\s+/g, '_')}_${assessment.Date || 'NoDate'}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('An unexpected error occurred during report generation.');
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Button 
            onClick={generatePDF} 
            disabled={isGenerating} 
            variant="outline" 
            size="sm" 
            className={cn("gap-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-bold h-11", className)}
        >
            <FileDown className="h-4 w-4 shrink-0" />
            <span className="truncate">
                {isGenerating ? 'Compiling...' : 'Download Report'}
            </span>
        </Button>
    );
}

// ── 2. Limited Summary Report Button ──
export function DownloadSummaryButton({ assessment, className }: ReportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    async function generatePDF() {
        setIsGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 15;

            // Fetch dynamic clinic settings
            let settings = {
                clinicName: "General Clinic",
                clinicLogo: "",
                clinicAddress: "123 Main Street",
                clinicContact: "123-456-7890",
                doctorNames: "Medical Doctor"
            };
            try {
                const settingsRes = await fetch("/api/settings");
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    settings = { ...settings, ...data };
                }
            } catch (err) { console.error("Failed to load settings:", err); }

            // Load Logo
            let logoImg: HTMLImageElement | null = null;
            if (settings.clinicLogo) {
                try {
                    logoImg = await loadImage(settings.clinicLogo);
                } catch (e) { console.error("Logo load error:", e); }
            }

            const addTitle = (text: string) => {
                if (y > 240) { 
                    doc.addPage(); 
                    y = 45; 
                }
                doc.setFillColor(30, 58, 138); // Blue-800
                doc.rect(15, y - 4.5, 3, 6.5, 'F');

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 58, 138);
                doc.text(text, 20, y);
                y += 2;
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.4);
                doc.line(15, y, pageWidth - 15, y);
                y += 7;
            };

            const addField = (label: string, value: string | undefined | null) => {
                if (y > 260) { 
                    doc.addPage(); 
                    y = 45; 
                }
                const val = value || 'N/A';

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 116, 139);
                doc.text(`${label.toUpperCase()}`, 15, y);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59);
                const lines = doc.splitTextToSize(String(val), pageWidth - 80);
                doc.text(lines, 65, y);
                y += Math.max(lines.length * 4.2, 6) + 1.5;
            };

            // ── Document Title ──
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.text('CLINICAL SESSION SUMMARY', pageWidth / 2, 42, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`Visit Index ID: #${String(assessment.id || 'NEW')}`, pageWidth / 2, 46, { align: 'center' });
            y = 54;

            // ── Patient Identification ──
            addTitle('PATIENT IDENTIFICATION');
            y = drawDemographicsGrid(doc, assessment, y, pageWidth);
            y += 8;

            // ── Session Summary & Clinical Note ──
            addTitle('CLINICAL SUMMARY');
            addField('Diagnosis', assessment.Diagnosis);
            addField('Treatment Advice', assessment.TreatmentPlan);
            addField('Session Notes & Summary', assessment.DailyNote);
            y += 4;

            // ── Post-Process Headers, Footers, and Watermarks ──
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                
                if (logoImg) {
                    try {
                        const GStateClass = (doc as any).GState;
                        if (GStateClass) {
                            doc.saveGraphicsState();
                            doc.setGState(new GStateClass({ opacity: 0.03 }));
                            doc.addImage(logoImg, 'PNG', (pageWidth - 70) / 2, (297 - 70) / 2, 70, 70);
                            doc.restoreGraphicsState();
                        }
                    } catch (err) { console.error("Watermark error:", err); }
                }

                drawHeader(doc, logoImg, pageWidth, settings);
                drawFooter(doc, pageWidth, i, totalPages, settings);
            }

            const fileName = `ClinicSummary_${(assessment.PatientName || 'Patient').replace(/\s+/g, '_')}_${assessment.Date || 'NoDate'}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('An unexpected error occurred during summary report generation.');
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Button 
            onClick={generatePDF} 
            disabled={isGenerating} 
            variant="outline" 
            size="sm" 
            className={cn("gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold h-11", className)}
        >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">
                {isGenerating ? 'Compiling...' : 'Download Summary'}
            </span>
        </Button>
    );
}
