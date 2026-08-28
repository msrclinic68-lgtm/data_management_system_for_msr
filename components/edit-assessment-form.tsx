"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Video, X, Upload, FileVideo, Plus, User, ClipboardList, Activity, Stethoscope, FileText, Loader2, RefreshCw, Pill } from "lucide-react";
import { getIndiaDateString } from "@/lib/format-date";
import { sanitizeFormData, validateFileSize, compressImage, convertDriveUrl, isVideoUrl, calculatePayloadSize, formatBytes } from "@/lib/utils-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Autocomplete } from "@/components/ui/autocomplete";

const formSchema = z.object({
    date: z.string(),
    name: z.string().min(2, "Name is required"),
    age: z.any().optional(),
    sex: z.any().optional(),
    occupation: z.any().optional(),
    phoneNumber: z.any().optional(),
    height: z.any().optional(),
    weight: z.any().optional(),
    bloodPressure: z.any().optional(),
    diabeticMellitus: z.any().optional(),
    dietHabit: z.any().optional(),
    sleepingHistory: z.any().optional(),
    menstruationHistory: z.any().optional(),

    chiefComplaint: z.string().optional(),
    diagnosticImaging: z.string().optional(),
    diagnosis: z.string().optional(),
    treatmentPlan: z.string().optional(),
    dailyNote: z.string().optional(),
    comments: z.string().optional(),
});

interface EditFormProps {
    assessment: any;
    assessmentIndex: number;
}

export function EditAssessmentForm({ assessment, assessmentIndex }: EditFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Medicine prescribing states
    const [allMedicines, setAllMedicines] = useState<any[]>([]);
    const [prescribedMedicines, setPrescribedMedicines] = useState<{ medicineName: string; quantity: number; dosage: string }[]>([]);
    const [currentSelection, setCurrentSelection] = useState({ medicineName: "", quantity: "", dosage: "" });

    // Load medicines for autocomplete
    useEffect(() => {
        async function fetchStock() {
            try {
                const res = await fetch("/api/stock");
                if (res.ok) {
                    const data = await res.json();
                    setAllMedicines(data);
                }
            } catch (err) {
                console.error("Failed to load stock:", err);
            }
        }
        fetchStock();
    }, []);

    const handleAddMedicine = () => {
        if (!currentSelection.medicineName) {
            alert("Please select a medicine.");
            return;
        }
        const qty = Number(currentSelection.quantity);
        if (isNaN(qty) || qty <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const selectedMed = allMedicines.find(m => m.name === currentSelection.medicineName);
        if (selectedMed) {
            const avail = Number(selectedMed.availableStock) || 0;
            if (qty > avail) {
                alert(`Insufficient stock. Only ${avail} units of ${currentSelection.medicineName} are available.`);
                return;
            }
        }

        setPrescribedMedicines(prev => [...prev, {
            medicineName: currentSelection.medicineName,
            quantity: qty,
            dosage: currentSelection.dosage
        }]);

        // Reset inputs
        setCurrentSelection({ medicineName: "", quantity: "", dosage: "" });
    };

    const handleRemoveMedicine = (index: number) => {
        setPrescribedMedicines(prev => prev.filter((_, i) => i !== index));
    };

    // Media upload state
    const [mediaFiles, setMediaFiles] = useState<{ file: File; base64: string; type: 'image' | 'video' }[]>([]);
    const [existingMedia, setExistingMedia] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
    const [isInitializing, setIsInitializing] = useState(false);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bind stream to video element
    useEffect(() => {
        if (activeStream && videoRef.current) {
            videoRef.current.srcObject = activeStream;
            videoRef.current.play().catch(e => console.error("Camera playback failed:", e));
        }
    }, [activeStream]);

    // Parse existing media on load
    useEffect(() => {
        const mediaCols = ['Media1', 'Media2', 'Media3', 'Media4'];
        const list: string[] = [];
        mediaCols.forEach(col => {
            const val = assessment[col];
            if (val) list.push(String(val).trim());
        });
        setExistingMedia(list);
    }, [assessment]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: getIndiaDateString(assessment.Date),
            name: String(assessment.PatientName || ""),
            age: String(assessment.Age || ""),
            sex: String(assessment.Sex || ""),
            occupation: String(assessment.Occupation || ""),
            phoneNumber: String(assessment.PhoneNumber || ""),
            height: String(assessment.Height || ""),
            weight: String(assessment.Weight || ""),
            bloodPressure: String(assessment.BloodPressure || ""),
            diabeticMellitus: String(assessment.DiabeticMellitus || ""),
            dietHabit: String(assessment.DietHabit || ""),
            sleepingHistory: String(assessment.SleepingHistory || ""),
            menstruationHistory: String(assessment.MenstruationHistory || ""),

            chiefComplaint: String(assessment.ChiefComplaint || ""),
            diagnosticImaging: String(assessment.DiagnosticImaging || ""),
            diagnosis: String(assessment.Diagnosis || assessment.diagnosis || ""),
            treatmentPlan: String(assessment.TreatmentPlan || ""),
            dailyNote: String(assessment.DailyNote || ""),
            comments: String(assessment.Comments || ""),
        },
    });

    const dateValue = form.watch("date");
    useEffect(() => {
        if (dateValue && dateValue.includes('T')) {
            form.setValue("date", dateValue.split('T')[0]);
        }
    }, [dateValue, form]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const sizeVal = validateFileSize(file);
            if (!sizeVal.valid) {
                alert(sizeVal.error);
                continue;
            }

            const isVideo = file.type.startsWith('video/');
            
            if (isVideo) {
                const reader = new FileReader();
                reader.onload = () => {
                    setMediaFiles(prev => [...prev, {
                        file,
                        base64: reader.result as string,
                        type: 'video'
                    }]);
                };
                reader.readAsDataURL(file);
            } else {
                try {
                    const { base64 } = await compressImage(file);
                    setMediaFiles(prev => [...prev, {
                        file,
                        base64,
                        type: 'image'
                    }]);
                } catch (err) {
                    console.error("Compression failed:", err);
                }
            }
        }
    };

    const startCamera = async () => {
        setIsInitializing(true);
        try {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: cameraFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setActiveStream(stream);
            setIsStreaming(true);
        } catch (err) {
            console.error("Failed to start camera:", err);
            alert("Could not access camera. Please verify permissions.");
        } finally {
            setIsInitializing(false);
        }
    };

    const stopCamera = () => {
        if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            setActiveStream(null);
        }
        setIsStreaming(false);
        setIsRecording(false);
    };

    const toggleCameraFacing = () => {
        setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
        setTimeout(() => {
            if (isStreaming) startCamera();
        }, 100);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        
        const blob = dataURLtoBlob(base64);
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

        setMediaFiles(prev => [...prev, { file, base64, type: 'image' }]);
        stopCamera();
    };

    const startRecording = () => {
        if (!activeStream) return;
        chunksRef.current = [];

        let options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm' };
        }

        try {
            const recorder = new MediaRecorder(activeStream, options);
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
                
                const reader = new FileReader();
                reader.onload = () => {
                    setMediaFiles(prev => [...prev, {
                        file,
                        base64: reader.result as string,
                        type: 'video'
                    }]);
                };
                reader.readAsDataURL(file);
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Recording failed to start:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            stopCamera();
        }
    };

    const removeMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingMedia = (index: number) => {
        setExistingMedia(prev => prev.filter((_, i) => i !== index));
    };

    const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        try {
            // Check stock levels first
            for (const item of prescribedMedicines) {
                const med = allMedicines.find(m => m.name === item.medicineName);
                if (med) {
                    const avail = Number(med.availableStock) || 0;
                    if (item.quantity > avail) {
                        alert(`Insufficient stock for ${item.medicineName}. Available: ${avail}. Requested: ${item.quantity}`);
                        setIsSubmitting(false);
                        return;
                    }
                } else {
                    alert(`Medicine ${item.medicineName} not found in inventory.`);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Append medicines list to treatment plan for visibility in reports
            let fullTreatmentPlan = values.treatmentPlan || "";
            if (prescribedMedicines.length > 0) {
                const medLines = prescribedMedicines.map(m => `- ${m.medicineName} (Qty: ${m.quantity}) [Dosage: ${m.dosage || 'As directed'}]`).join("\n");
                fullTreatmentPlan = fullTreatmentPlan ? `${fullTreatmentPlan}\n\nPrescribed Medicines:\n${medLines}` : `Prescribed Medicines:\n${medLines}`;
            }

            const sanitized = sanitizeFormData({
                ...values,
                treatmentPlan: fullTreatmentPlan
            });

            const filesPayload = mediaFiles.map(m => ({
                name: m.file.name,
                type: m.file.type,
                data: m.base64.split(',')[1]
            }));

            const payload = {
                ...sanitized,
                existingMedia, // Merge with new uploads
                files: filesPayload
            };

            const payloadBytes = calculatePayloadSize(payload);
            console.log("Update payload size:", formatBytes(payloadBytes));

            const response = await fetch(`/api/assessments/${assessmentIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Update operation failed.");
            }

            // Real-time stock deduction: Dispense prescribed medicines
            const patientSlug = values.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            for (const item of prescribedMedicines) {
                try {
                    await fetch("/api/dispense", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            patientName: values.name,
                            patientSlug,
                            medicineName: item.medicineName,
                            quantity: item.quantity,
                            dosage: item.dosage || "",
                            type: "patient"
                        })
                    });
                } catch (dispenseErr) {
                    console.error(`Failed to deduct stock for ${item.medicineName}:`, dispenseErr);
                }
            }

            router.push(`/assessment/${assessmentIndex}`);
            router.refresh();
        } catch (err) {
            console.error("Save failed:", err);
            alert(err instanceof Error ? err.message : "Sync failure. Verify connection details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* 1. Patient Demographics & Basics */}
                <Card className="border-slate-200 shadow-md rounded-2xl bg-white">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-bold">1. Patient Profile & Demographics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Visit Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Patient Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. John Doe" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Age</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 35" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Gender</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4 h-11 items-center"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Male" id="male" />
                                                <label htmlFor="male" className="text-sm font-semibold cursor-pointer">Male</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Female" id="female" />
                                                <label htmlFor="female" className="text-sm font-semibold cursor-pointer">Female</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Other" id="other" />
                                                <label htmlFor="other" className="text-sm font-semibold cursor-pointer">Other</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Contact Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. +91 98765 43210" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Occupation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Engineer" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 2. Vital Signs & Physique */}
                <Card className="border-slate-200 shadow-md rounded-2xl bg-white">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-bold">2. Vitals & Physiology</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-5">
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Height (cm)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 175" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Weight (kg)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 70" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bloodPressure"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Blood Pressure</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 120/80" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="diabeticMellitus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Diabetic Status</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Non-diabetic" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dietHabit"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Diet & Personal Habits</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Vegetarian" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sleepingHistory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Sleeping History</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Normal" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="menstruationHistory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Menstruation Cycle</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. N/A" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 3. Clinical Evaluation */}
                <Card className="border-slate-200 shadow-md rounded-2xl bg-white">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-bold">3. Clinical History & Prescription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="chiefComplaint"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Chief Complaint & Symptoms</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Patient complaints..." {...field} className="rounded-xl border-slate-200 shadow-sm min-h-[100px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="diagnosticImaging"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Diagnostic Reports / Imaging Details</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Normal" {...field} className="rounded-xl h-11 border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="diagnosis"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase text-slate-500">Clinical Diagnosis</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Clinical Diagnosis" {...field} className="rounded-xl border-slate-200 shadow-sm min-h-[100px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="treatmentPlan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase text-slate-500">Treatment Plan & Prescription Advice</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Advice" {...field} className="rounded-xl border-slate-200 shadow-sm min-h-[100px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="dailyNote"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Daily Session / Consultation Progress Note</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Progress updates..." {...field} className="rounded-xl border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Additional Comments / Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Remarks" {...field} className="rounded-xl border-slate-200 shadow-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Medicine Prescription & Real-time Dispensing */}
                <Card className="border-slate-200 shadow-md rounded-2xl bg-white">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
                        <Pill className="h-5 w-5 text-emerald-600 font-bold animate-pulse" />
                        <CardTitle className="text-lg font-bold">4. Prescribe & Dispense Medicines (Real-Time Stock Deduction)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Search & Select Medicine</label>
                                <div className="mt-1">
                                    <Autocomplete
                                        options={(allMedicines || [])
                                            .filter((med) => med && typeof med.name === "string")
                                            .map((med) => ({
                                                label: med.name,
                                                value: med.name,
                                                availableStock: Number(med.availableStock) || 0
                                            }))}
                                        value={currentSelection.medicineName}
                                        onChange={(val) => setCurrentSelection({ ...currentSelection, medicineName: val })}
                                        placeholder="Type medicine name..."
                                        emptyMessage="No matching medicine in stock."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                                <Input
                                    type="number"
                                    value={currentSelection.quantity}
                                    onChange={(e) => setCurrentSelection({ ...currentSelection, quantity: e.target.value })}
                                    className="rounded-xl h-11 border-slate-200 mt-1 shadow-sm font-semibold"
                                    placeholder="e.g. 10"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Dosage Advice</label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type="text"
                                        value={currentSelection.dosage}
                                        onChange={(e) => setCurrentSelection({ ...currentSelection, dosage: e.target.value })}
                                        className="rounded-xl h-11 border-slate-200 shadow-sm flex-1 font-semibold"
                                        placeholder="e.g. 1-0-1 after food"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddMedicine}
                                        className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {prescribedMedicines.length > 0 ? (
                            <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-700">Medicine Name</TableHead>
                                            <TableHead className="font-bold text-slate-700 w-24">Quantity</TableHead>
                                            <TableHead className="font-bold text-slate-700">Dosage Advice</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {prescribedMedicines.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-bold text-slate-800 text-sm">{item.medicineName}</TableCell>
                                                <TableCell className="font-bold text-slate-700 text-sm">{item.quantity}</TableCell>
                                                <TableCell className="text-slate-600 font-bold text-sm">{item.dosage || "-"}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveMedicine(idx)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-4">
                                <p className="text-xs font-bold text-slate-400">No medicines prescribed for this visit yet. Select one above and click "Add".</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 5. Media Suite */}
                <Card className="border-slate-200 shadow-md rounded-2xl bg-white">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
                        <Camera className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-bold">5. Attachment & Clinical Reports Media Suite</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Existing Media List */}
                        {existingMedia.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Existing Attachments</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-150">
                                    {existingMedia.map((url, index) => {
                                        const isVideo = isVideoUrl(url);
                                        const directUrl = convertDriveUrl(url, 'download');
                                        const previewUrl = convertDriveUrl(url, 'preview');
                                        return (
                                            <div key={index} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-black group">
                                                {isVideo ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                        <FileVideo className="h-10 w-10 text-primary mb-1" />
                                                        <span className="text-[9px] font-black uppercase">Existing Video</span>
                                                    </div>
                                                ) : (
                                                    <img src={directUrl} alt="Existing" className="w-full h-full object-cover" />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingMedia(index)}
                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-200 text-slate-700 shadow-sm"
                            >
                                <Upload className="mr-2 h-4 w-4 text-primary" /> Upload Scans / Files
                            </Button>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,video/*" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                            
                            {!isStreaming ? (
                                <Button 
                                    type="button" 
                                    onClick={startCamera}
                                    className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 text-white shadow-md"
                                >
                                    <Camera className="mr-2 h-4 w-4" /> Start Device Camera
                                </Button>
                            ) : (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button type="button" onClick={capturePhoto} className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Capture Photo</Button>
                                    {!isRecording ? (
                                        <Button type="button" onClick={startRecording} className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Record Video</Button>
                                    ) : (
                                        <Button type="button" onClick={stopRecording} className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold animate-pulse">Stop Recording</Button>
                                    )}
                                    <Button type="button" variant="outline" onClick={toggleCameraFacing} className="h-11 px-3 rounded-xl border-slate-200"><RefreshCw className="h-4 w-4" /></Button>
                                    <Button type="button" variant="ghost" onClick={stopCamera} className="h-11 px-3 rounded-xl text-slate-400"><X className="h-4 w-4" /></Button>
                                </div>
                            )}
                        </div>

                        {/* Stream preview */}
                        {isStreaming && (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video max-w-xl mx-auto shadow-inner">
                                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                                {isRecording && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1.5 animate-pulse shadow-md">
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                        Recording
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected Media Grid */}
                        {mediaFiles.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-dashed border-slate-200 p-4 rounded-xl">
                                {mediaFiles.map((m, index) => (
                                    <div key={index} className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm aspect-square bg-slate-50 group">
                                        {m.type === 'image' ? (
                                            <img src={m.base64} alt="Clinical Capture" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                                <FileVideo className="h-10 w-10 text-primary mb-1" />
                                                <span className="text-[9px] font-black uppercase">Video Captured</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit buttons */}
                <div className="flex items-center gap-4 justify-end pt-4 border-t border-slate-100">
                    <Button asChild variant="outline" className="rounded-xl h-11 px-6 font-semibold">
                        <Link href={`/assessment/${assessmentIndex}`}>Cancel</Link>
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="rounded-xl h-11 px-8 font-black bg-slate-900 hover:bg-black text-white shadow-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Updating Record...
                            </>
                        ) : "Update Patient Visit"}
                    </Button>
                </div>

            </form>
        </Form>
    );
}
