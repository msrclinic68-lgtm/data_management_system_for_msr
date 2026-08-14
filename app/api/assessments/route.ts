import { NextResponse } from "next/server";
import { savePatientVisit, getPatientVisits } from "@/lib/data-service";

/**
 * POST /api/assessments
 * Handles general clinic patient visit record creation.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
        }

        // General Clinic Patient Visit Schema Mapping
        const rowData = {
            Date: body.date || new Date().toISOString().split('T')[0],
            PatientName: body.name,
            Age: String(body.age || ""),
            Sex: body.sex || "",
            Occupation: body.occupation || "",
            PhoneNumber: body.phoneNumber || "",
            Height: body.height || "",
            Weight: body.weight || "",
            BloodPressure: body.bloodPressure || "",
            DiabeticMellitus: body.diabeticMellitus || "",
            DietHabit: body.dietHabit || "",
            SleepingHistory: body.sleepingHistory || "",
            MenstruationHistory: body.menstruationHistory || "",

            ChiefComplaint: body.chiefComplaint || "",
            DiagnosticImaging: body.diagnosticImaging || "",
            Diagnosis: body.diagnosis || "",
            TreatmentPlan: body.treatmentPlan || "",
            DailyNote: body.dailyNote || "",
            Comments: body.comments || "",

            Media1: "",
            Media2: "",
            Media3: "",
            Media4: "",

            Timestamp: new Intl.DateTimeFormat('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true, timeZone: 'Asia/Kolkata',
            }).format(new Date()).replace(', ', ', '),

            files: body.files || [],
            action: 'create'
        };

        const result = await savePatientVisit(rowData);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Save Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Persistence failure" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/assessments
 * Retrieves patient visits list.
 */
export async function GET() {
    try {
        const assessments = await getPatientVisits();
        return NextResponse.json(assessments);
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Retrieval failure" },
            { status: 500 }
        );
    }
}
