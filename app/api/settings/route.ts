import { NextResponse } from "next/server";
import { getClinicSettings, saveClinicSettings } from "@/lib/data-service";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await getClinicSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error("Fetch Settings Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.clinicName) {
            return NextResponse.json({ error: "Clinic Name is required" }, { status: 400 });
        }

        const result = await saveClinicSettings(body);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Save Settings Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to save settings" },
            { status: 500 }
        );
    }
}
