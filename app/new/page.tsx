import { AssessmentForm } from "@/components/assessment-form";

export default function NewAssessmentPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">New Patient Visit</h1>
                <p className="text-muted-foreground">
                    Fill out the form below to record a new patient visit and consultation.
                </p>
            </div>
            <AssessmentForm />
        </div>
    );
}
