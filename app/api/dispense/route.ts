import { NextResponse } from "next/server";
import { getDispensedLogs, dispenseMedicine } from "@/lib/data-service";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logs = await getDispensedLogs();
        return NextResponse.json(logs);
    } catch (error) {
        console.error("Fetch Dispense Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch dispense logs" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.medicineName || !body.quantity) {
            return NextResponse.json({ error: "Medicine name and quantity are required" }, { status: 400 });
        }

        const result = await dispenseMedicine(body);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Dispense Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to dispense medicine" },
            { status: 500 }
        );
    }
}
