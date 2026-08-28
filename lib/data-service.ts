import { PrismaClient } from "@prisma/client";
import * as appsScript from "./apps-script";

export const isSupabaseEnabled = () => 
  !!process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://"));

// Instantiate PrismaClient globally in dev mode to prevent hot-reload socket leaks
let prisma: PrismaClient | undefined;

if (isSupabaseEnabled()) {
  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    if (process.env.NODE_ENV === "production") {
      prisma = new PrismaClient({ adapter });
    } else {
      if (!(global as any).prisma) {
        (global as any).prisma = new PrismaClient({ adapter });
      }
      prisma = (global as any).prisma;
    }
  } catch (error) {
    console.error("Prisma 7 adapter initialization failed:", error);
  }
}

// Simple in-memory cache for Google Sheets mode to make loading super fast
let sheetsCache: {
  patients?: { data: any[]; timestamp: number };
  medicines?: { data: any[]; timestamp: number };
  dispensed?: { data: any[]; timestamp: number };
  settings?: { data: any; timestamp: number };
} = {};

const CACHE_TTL_MS = 20000; // 20 seconds TTL

const clearPatientsCache = () => { sheetsCache.patients = undefined; };
const clearMedicinesCache = () => { sheetsCache.medicines = undefined; };
const clearDispensedCache = () => { sheetsCache.dispensed = undefined; };
const clearSettingsCache = () => { sheetsCache.settings = undefined; };

// Mapping Helpers for Patient Visits (Assessments)
function mapPrismaToVisits(record: any, index?: number): any {
  return {
    id: record.id,
    rowIndex: index ?? 0,
    Date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
    PatientName: record.name || '',
    Age: String(record.age || ''),
    Sex: record.sex || '',
    Occupation: record.occupation || '',
    PhoneNumber: record.phoneNumber || '',
    Height: record.height || '',
    Weight: record.weight || '',
    BloodPressure: record.bloodPressure || '',
    DiabeticMellitus: record.diabeticMellitus || '',
    DietHabit: record.dietHabit || '',
    SleepingHistory: record.sleepingHistory || '',
    MenstruationHistory: record.menstruationHistory || '',
    ChiefComplaint: record.chiefComplaint || '',
    DiagnosticImaging: record.diagnosticImaging || '',
    Diagnosis: record.diagnosis || '',
    TreatmentPlan: record.treatmentPlan || '',
    DailyNote: record.dailyNote || '',
    Comments: record.comments || '',
    Media1: record.media1 || '',
    Media2: record.media2 || '',
    Media3: record.media3 || '',
    Media4: record.media4 || '',
    Timestamp: record.createdAt ? new Date(record.createdAt).toLocaleString('en-IN') : ''
  };
}

function mapVisitsToPrisma(data: any): any {
  return {
    date: data.Date ? new Date(data.Date) : new Date(),
    name: data.PatientName || '',
    age: Number(data.Age) || 0,
    sex: data.Sex || null,
    occupation: data.Occupation || null,
    phoneNumber: data.PhoneNumber || null,
    height: data.Height || null,
    weight: data.Weight || null,
    bloodPressure: data.BloodPressure || null,
    diabeticMellitus: data.DiabeticMellitus || null,
    dietHabit: data.DietHabit || null,
    sleepingHistory: data.SleepingHistory || null,
    menstruationHistory: data.MenstruationHistory || null,
    chiefComplaint: data.ChiefComplaint || null,
    diagnosticImaging: data.DiagnosticImaging || null,
    diagnosis: data.Diagnosis || null,
    treatmentPlan: data.TreatmentPlan || null,
    dailyNote: data.DailyNote || null,
    comments: data.Comments || null,
    media1: data.Media1 || null,
    media2: data.Media2 || null,
    media3: data.Media3 || null,
    media4: data.Media4 || null
  };
}

// Data Services
export async function getPatientVisits(): Promise<any[]> {
  if (prisma && isSupabaseEnabled()) {
    const list = await prisma.assessment.findMany({
      orderBy: { date: 'desc' }
    });
    return list.map((record, index) => mapPrismaToVisits(record, index));
  }
  
  const now = Date.now();
  if (sheetsCache.patients && (now - sheetsCache.patients.timestamp < CACHE_TTL_MS)) {
    return sheetsCache.patients.data;
  }
  
  const list = await appsScript.getFromGoogleSheet();
  const mapped = (list || []).map((record, index) => ({
    ...record,
    id: record.id !== undefined && record.id !== null ? record.id : (record.rowIndex !== undefined && record.rowIndex !== null ? record.rowIndex : index),
    rowIndex: record.rowIndex !== undefined && record.rowIndex !== null ? record.rowIndex : index
  }));
  
  sheetsCache.patients = { data: mapped, timestamp: now };
  return mapped;
}

export async function savePatientVisit(data: any): Promise<any> {
  clearPatientsCache();
  if (prisma && isSupabaseEnabled()) {
    const mappedData = mapVisitsToPrisma(data);
    
    // Handle Media base64 uploads to Google Drive if there are attachments
    // We can still upload to Google Drive using the Apps Script helper since Postgres doesn't store files directly!
    let mediaUrls: string[] = [];
    if (data.files && data.files.length > 0) {
      try {
        const uploadResult = await appsScript.saveToGoogleSheet(data);
        // If it succeeded, the response contains driving files which we merge
        return uploadResult;
      } catch (err) {
        console.error("Failed to upload drive attachment, fallback to direct save:", err);
      }
    }

    if (data.rowIndex !== undefined && data.id) {
      const updated = await prisma.assessment.update({
        where: { id: String(data.id) },
        data: mappedData
      });
      return { success: true, data: mapPrismaToVisits(updated) };
    } else {
      const created = await prisma.assessment.create({
        data: mappedData
      });
      return { success: true, data: mapPrismaToVisits(created) };
    }
  }
  return appsScript.saveToGoogleSheet(data);
}

export async function getMedicines(): Promise<any[]> {
  if (prisma && isSupabaseEnabled()) {
    const list = await prisma.medicine.findMany({
      orderBy: { name: 'asc' }
    });
    return list.map((m, index) => ({
      id: m.id,
      name: m.name,
      batchType: m.batchType || '',
      unit: m.unit || '',
      unitMeasurement: m.unitMeasurement || '',
      totalStock: m.totalStock,
      availableStock: m.availableStock,
      pendingStock: m.pendingStock,
      outgoingStock: m.outgoingStock,
      lowStockThreshold: m.lowStockThreshold,
      rowIndex: index
    }));
  }
  
  const now = Date.now();
  if (sheetsCache.medicines && (now - sheetsCache.medicines.timestamp < CACHE_TTL_MS)) {
    return sheetsCache.medicines.data;
  }
  
  const list: any[] = await appsScript.getMedicines();
  const mapped = (list || []).map((m, index) => ({
    id: m.id || m.ID || "",
    name: m.name || m.Name || "",
    batchType: m.batchType || m.BatchType || "",
    unit: m.unit || m.Unit || "Tablet",
    unitMeasurement: m.unitMeasurement || m.UnitMeasurement || "mg",
    totalStock: Number(m.totalStock !== undefined ? m.totalStock : (m.TotalStock !== undefined ? m.TotalStock : 0)),
    availableStock: Number(m.availableStock !== undefined ? m.availableStock : (m.AvailableStock !== undefined ? m.AvailableStock : 0)),
    pendingStock: Number(m.pendingStock !== undefined ? m.pendingStock : (m.PendingStock !== undefined ? m.PendingStock : 0)),
    outgoingStock: Number(m.outgoingStock !== undefined ? m.outgoingStock : (m.OutgoingStock !== undefined ? m.OutgoingStock : 0)),
    lowStockThreshold: Number(m.lowStockThreshold !== undefined ? m.lowStockThreshold : (m.LowStockThreshold !== undefined ? m.LowStockThreshold : 10)),
    rowIndex: m.rowIndex !== undefined ? m.rowIndex : index
  }));
  
  sheetsCache.medicines = { data: mapped, timestamp: now };
  return mapped;
}

export async function saveMedicine(action: 'create' | 'update' | 'delete', data: any): Promise<any> {
  clearMedicinesCache();
  clearPatientsCache();
  if (prisma && isSupabaseEnabled()) {
    if (action === "create") {
      const created = await prisma.medicine.create({
        data: {
          name: data.name,
          batchType: data.batchType || null,
          unit: data.unit || 'Tablet',
          unitMeasurement: data.unitMeasurement || 'mg',
          totalStock: Number(data.totalStock) || 0,
          availableStock: Number(data.availableStock) || 0,
          pendingStock: Number(data.pendingStock) || 0,
          outgoingStock: Number(data.outgoingStock) || 0,
          lowStockThreshold: Number(data.lowStockThreshold) || 10
        }
      });
      return created;
    }
    
    if (action === "update") {
      const updated = await prisma.medicine.update({
        where: { id: String(data.id) },
        data: {
          name: data.name,
          batchType: data.batchType || null,
          unit: data.unit || 'Tablet',
          unitMeasurement: data.unitMeasurement || 'mg',
          totalStock: Number(data.totalStock) || 0,
          availableStock: Number(data.availableStock) || 0,
          pendingStock: Number(data.pendingStock) || 0,
          outgoingStock: Number(data.outgoingStock) || 0,
          lowStockThreshold: Number(data.lowStockThreshold) || 10
        }
      });
      return updated;
    }
    
    if (action === "delete") {
      const deleted = await prisma.medicine.delete({
        where: { id: String(data.id) }
      });
      return deleted;
    }
  }
  return appsScript.saveMedicine(action, data);
}

export async function getDispensedLogs(): Promise<any[]> {
  if (prisma && isSupabaseEnabled()) {
    const list = await prisma.dispensedRecord.findMany({
      orderBy: { timestamp: 'desc' }
    });
    return list.map(log => ({
      id: log.id,
      patientName: log.patientName,
      patientSlug: log.patientSlug || '',
      medicineName: log.medicineName,
      quantity: log.quantity,
      dosage: log.dosage || '',
      type: log.type,
      timestamp: log.timestamp.toISOString()
    }));
  }
  
  const now = Date.now();
  if (sheetsCache.dispensed && (now - sheetsCache.dispensed.timestamp < CACHE_TTL_MS)) {
    return sheetsCache.dispensed.data;
  }
  
  const list: any[] = await appsScript.getDispensedLogs();
  const mapped = (list || []).map(log => ({
    id: log.id || log.ID || '',
    patientName: log.patientName || log.PatientName || '',
    patientSlug: log.patientSlug || log.PatientSlug || '',
    medicineName: log.medicineName || log.MedicineName || '',
    quantity: Number(log.quantity !== undefined ? log.quantity : (log.Quantity !== undefined ? log.Quantity : 0)),
    dosage: log.dosage || log.Dosage || '',
    type: log.type || log.Type || '',
    timestamp: log.timestamp || log.Timestamp || ''
  }));
  
  sheetsCache.dispensed = { data: mapped, timestamp: now };
  return mapped;
}

export async function dispenseMedicine(data: any): Promise<any> {
  clearMedicinesCache();
  clearDispensedCache();
  clearPatientsCache();
  if (prisma && isSupabaseEnabled()) {
    // Transactional logic: Acquire a lock via Prisma Transaction
    return await prisma.$transaction(async (tx) => {
      const med = await tx.medicine.findFirst({
        where: {
          OR: [
            { id: data.medicineName },
            { name: data.medicineName }
          ]
        }
      });

      if (!med) {
        throw new Error(`Medicine not found in stock: ${data.medicineName}`);
      }

      const qty = Number(data.quantity);
      if (med.availableStock < qty) {
        throw new Error(`Insufficient stock. Available: ${med.availableStock}, Requested: ${qty}`);
      }

      const newAvailable = med.availableStock - qty;
      const newOutgoing = med.outgoingStock + qty;

      // Update Stock level
      await tx.medicine.update({
        where: { id: med.id },
        data: {
          availableStock: newAvailable,
          outgoingStock: newOutgoing
        }
      });

      // Append Dispense Log
      const log = await tx.dispensedRecord.create({
        data: {
          patientName: data.patientName || "Walk-in",
          patientSlug: data.patientSlug || "",
          medicineName: med.name,
          quantity: qty,
          dosage: data.dosage || null,
          type: data.type || "quick"
        }
      });

      return {
        success: true,
        dispensedId: log.id,
        newAvailableStock: newAvailable
      };
    });
  }
  return appsScript.dispenseMedicine(data);
}

export async function getClinicSettings(): Promise<any> {
  if (prisma && isSupabaseEnabled()) {
    const settings = await prisma.clinicSettings.findFirst();
    if (!settings) {
      // Return default clinic values
      return {
        clinicName: "General Clinic",
        clinicLogo: "",
        clinicAddress: "123 Main Street, Clinic City",
        doctorNames: "Medical Doctor",
        clinicContact: "123-456-7890"
      };
    }
    return {
      clinicName: settings.clinicName,
      clinicLogo: settings.clinicLogo || "",
      clinicAddress: settings.clinicAddress,
      doctorNames: settings.doctorNames,
      clinicContact: settings.clinicContact
    };
  }
  
  const now = Date.now();
  if (sheetsCache.settings && (now - sheetsCache.settings.timestamp < CACHE_TTL_MS)) {
    return sheetsCache.settings.data;
  }
  
  const settings = await appsScript.getClinicSettings();
  sheetsCache.settings = { data: settings, timestamp: now };
  return settings;
}

export async function saveClinicSettings(data: any): Promise<any> {
  clearSettingsCache();
  if (prisma && isSupabaseEnabled()) {
    const current = await prisma.clinicSettings.findFirst();
    const payload = {
      clinicName: data.clinicName,
      clinicLogo: data.clinicLogo || null,
      clinicAddress: data.clinicAddress,
      doctorNames: data.doctorNames,
      clinicContact: data.clinicContact
    };

    if (current) {
      await prisma.clinicSettings.update({
        where: { id: current.id },
        data: payload
      });
    } else {
      await prisma.clinicSettings.create({
        data: payload
      });
    }
    return { success: true, message: "Settings saved successfully" };
  }
  return appsScript.saveClinicSettings(data);
}
