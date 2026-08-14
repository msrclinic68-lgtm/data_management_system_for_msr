import { getPatientVisits, isSupabaseEnabled } from "@/lib/data-service";
import { EditAssessmentForm } from "@/components/edit-assessment-form";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditAssessmentPage(props: PageProps) {
    const params = await props.params;
    let assessments: any[] = [];
    
    try {
        assessments = await getPatientVisits();
    } catch (error) {
        console.error("Failed to fetch assessment for editing:", error);
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-muted/20 rounded-xl border-2 border-dashed">
                <h2 className="text-xl font-bold text-destructive mb-2">Connection Error</h2>
                <p className="text-muted-foreground mb-6">Could not retrieve data from the database.</p>
                <Link href="/" className="text-primary hover:underline font-medium">Return to Dashboard</Link>
            </div>
        );
    }

    let assessment: any = null;
    let assessmentIndex: string | number = "";

    if (isSupabaseEnabled()) {
        assessment = assessments.find(a => String(a.id) === params.id);
        assessmentIndex = params.id;
    } else {
        const index = Number(params.id);
        if (!isNaN(index) && index >= 0 && index < assessments.length) {
            assessment = assessments[index];
            assessmentIndex = index;
        }
    }

    if (!assessment) {
        notFound();
    }

    return <EditAssessmentForm assessment={assessment} assessmentIndex={assessmentIndex as any} />;
}
