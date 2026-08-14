import { NextResponse } from "next/server";
import { getFromGoogleSheet, saveToGoogleSheet, PatientVisitData } from "@/lib/apps-script";

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * PUT /api/assessments/[id]
 * Updates a patient visit record in Sheet1.
 */
export async function PUT(request: Request, context: RouteParams) {
    try {
        const params = await context.params;
        const assessmentIndex = Number(params.id);
        const body = await request.json();

        // Fetch state to merge
        const assessments = await getFromGoogleSheet();

        if (isNaN(assessmentIndex) || assessmentIndex < 0 || assessmentIndex >= assessments.length) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        const existingRow = assessments[assessmentIndex];
        const existingMedia: string[] = body.existingMedia || [];

        // Patient Visit Schema Mapping
        const updateData: PatientVisitData = {
            Date: body.date ?? existingRow.Date,
            PatientName: body.name ?? existingRow.PatientName,
            Age: body.age ?? existingRow.Age,
            Sex: body.sex ?? existingRow.Sex ?? "",
            Occupation: body.occupation ?? existingRow.Occupation ?? "",
            PhoneNumber: body.phoneNumber ?? existingRow.PhoneNumber ?? "",
            Height: body.height ?? existingRow.Height ?? "",
            Weight: body.weight ?? existingRow.Weight ?? "",
            BloodPressure: body.bloodPressure ?? existingRow.BloodPressure ?? "",
            DiabeticMellitus: body.diabeticMellitus ?? existingRow.DiabeticMellitus ?? "",
            DietHabit: body.dietHabit ?? existingRow.DietHabit ?? "",
            SleepingHistory: body.sleepingHistory ?? existingRow.SleepingHistory ?? "",
            MenstruationHistory: body.menstruationHistory ?? existingRow.MenstruationHistory ?? "",

            ChiefComplaint: body.chiefComplaint ?? existingRow.ChiefComplaint ?? "",
            DiagnosticImaging: body.diagnosticImaging ?? existingRow.DiagnosticImaging ?? "",
            Diagnosis: body.diagnosis ?? existingRow.Diagnosis ?? "",
            TreatmentPlan: body.treatmentPlan ?? existingRow.TreatmentPlan ?? "",
            DailyNote: body.dailyNote ?? existingRow.DailyNote ?? "",
            Comments: body.comments ?? existingRow.Comments ?? "",

            Media1: existingMedia.length > 0 ? existingMedia[0] : (existingRow.Media1 || ""),
            Media2: existingMedia.length > 1 ? existingMedia[1] : (existingRow.Media2 || ""),
            Media3: existingMedia.length > 2 ? existingMedia[2] : (existingRow.Media3 || ""),
            Media4: existingMedia.length > 3 ? existingMedia[3] : (existingRow.Media4 || ""),

            Timestamp: new Intl.DateTimeFormat('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true, timeZone: 'Asia/Kolkata'
            }).format(new Date()).replace(', ', ', '),

            id: assessmentIndex,
            rowIndex: assessmentIndex, // Passed to Google Apps Script (0-based)
            action: 'update'
        };

        const payload: PatientVisitData = { ...updateData };
        if (body.files && body.files.length > 0) {
            payload.files = body.files;
        }

        const result = await saveToGoogleSheet(payload);
        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Sync failure" },
            { status: 500 }
        );
    }
}
