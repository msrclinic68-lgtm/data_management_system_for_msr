// Google Apps Script integration
const rawUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || process.env.GOOGLE_APPS_SCRIPT_URL || "";
const APPS_SCRIPT_URL = rawUrl.replace(/[<>]/g, "").trim();

const rawToken = process.env.SHARED_SECRET_TOKEN || "physio_secret_token_change_me";
const SHARED_SECRET_TOKEN = rawToken.replace(/[<>]/g, "").trim();

const POST_TIMEOUT_MS = 30000; // 30 seconds for writes/reads

export interface PatientVisitData {
    // 1-13: Patient Demographics & Basics
    Date: string;
    PatientName: string;
    Age: string;
    Sex?: string;
    Occupation?: string;
    PhoneNumber?: string;
    Height?: string;
    Weight?: string;
    BloodPressure?: string;
    DiabeticMellitus?: string;
    DietHabit?: string;
    SleepingHistory?: string;
    MenstruationHistory?: string;

    // Clinical Evaluation
    ChiefComplaint?: string;
    DiagnosticImaging?: string;
    Diagnosis?: string;
    TreatmentPlan?: string;
    DailyNote?: string;
    Comments?: string;

    // Media suite
    Media1?: string;
    Media2?: string;
    Media3?: string;
    Media4?: string;
    Timestamp?: string;

    // Helper/System fields
    files?: {
        name: string;
        type: string;
        data: string; // base64
    }[];
    action?: 'create' | 'update';
    rowIndex?: number;
    id?: number | string; // Used for UI identification
    [key: string]: any;
}

export interface MedicineData {
    id?: string;
    ID?: string;
    name: string;
    batchType?: string;
    unit: string;
    unitMeasurement: string;
    totalStock: number;
    availableStock: number;
    pendingStock: number;
    outgoingStock: number;
    lowStockThreshold: number;
    rowIndex?: number;
    Timestamp?: string;
}

export interface DispensedData {
    id?: string;
    patientName: string;
    patientSlug?: string;
    medicineName: string;
    quantity: number;
    dosage?: string;
    type: 'patient' | 'quick';
    timestamp?: string;
}

export interface ClinicSettingsData {
    clinicName: string;
    clinicLogo?: string;
    clinicAddress: string;
    doctorNames: string;
    clinicContact: string;
}

/**
 * Sends a POST request to Google Apps Script Web App.
 * All communication is POST-only to secure the secret token in the body.
 */
async function postToAppsScript(payload: any) {
    if (!APPS_SCRIPT_URL) {
        throw new Error('NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL / GOOGLE_APPS_SCRIPT_URL is not configured.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), POST_TIMEOUT_MS);

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...payload,
                token: SHARED_SECRET_TOKEN
            }),
            redirect: 'follow',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const text = await response.text();

        if (!response.ok) {
            throw new Error(`Failed to communicate with Apps Script (HTTP ${response.status})`);
        }

        let result;
        try {
            result = JSON.parse(text);
        } catch (parseErr) {
            console.error('Non-JSON response:', text.substring(0, 300));
            throw new Error('Invalid server response format.');
        }

        if (result && result.success === false) {
            throw new Error(result.error || 'Operation failed in Google Sheets');
        }

        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error) throw error;
        throw new Error('Connection error.');
    }
}

export async function saveToGoogleSheet(data: PatientVisitData) {
    return postToAppsScript({
        action: data.action || 'create',
        type: 'patients',
        data
    });
}

export async function getFromGoogleSheet(): Promise<PatientVisitData[]> {
    const result = await postToAppsScript({
        action: 'get',
        type: 'patients'
    });
    return result.data || [];
}

// Medicines stock helpers
export async function getMedicines(): Promise<MedicineData[]> {
    const result = await postToAppsScript({
        action: 'get',
        type: 'medicines'
    });
    return result.data || [];
}

export async function saveMedicine(action: 'create' | 'update' | 'delete', data: MedicineData) {
    return postToAppsScript({
        action,
        type: 'medicines',
        data
    });
}

// Dispensing helpers
export async function getDispensedLogs(): Promise<DispensedData[]> {
    const result = await postToAppsScript({
        action: 'get',
        type: 'dispensed'
    });
    return result.data || [];
}

export async function dispenseMedicine(data: DispensedData) {
    return postToAppsScript({
        action: 'create',
        type: 'dispense',
        data
    });
}

// Settings helpers
export async function getClinicSettings(): Promise<ClinicSettingsData> {
    try {
        const result = await postToAppsScript({
            action: 'get',
            type: 'settings'
        });
        
        const defaultSettings: ClinicSettingsData = {
            clinicName: "Prasad General Clinic",
            clinicLogo: "",
            clinicAddress: "123 Main Street, Clinic City",
            doctorNames: "Dr. Prasad, M.B.B.S",
            clinicContact: "123-456-7890"
        };
        
        return {
            ...defaultSettings,
            ...(result.data || {})
        };
    } catch (error) {
        console.error("Failed to load settings from Google Sheets:", error);
        // Resilient fallback in case sheets is not yet configured or fails
        return {
            clinicName: "Prasad General Clinic",
            clinicLogo: "",
            clinicAddress: "123 Main Street, Clinic City",
            doctorNames: "Dr. Prasad, M.B.B.S",
            clinicContact: "123-456-7890"
        };
    }
}

export async function saveClinicSettings(data: ClinicSettingsData) {
    return postToAppsScript({
        action: 'save',
        type: 'settings',
        data
    });
}
