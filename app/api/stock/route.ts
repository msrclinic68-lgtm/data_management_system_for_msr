import { NextResponse } from "next/server";
import { getMedicines, saveMedicine, MedicineData } from "@/lib/apps-script";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const medicines = await getMedicines();
        return NextResponse.json(medicines);
    } catch (error) {
        console.error("Fetch Stock Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch stock" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        if (!action || !['create', 'update', 'delete'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const result = await saveMedicine(action, data as MedicineData);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Save Stock Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to adjust stock" },
            { status: 500 }
        );
    }
}
