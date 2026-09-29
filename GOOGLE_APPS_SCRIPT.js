/**
 * General Clinic - Backend Sync Engine (v3.0 - General Clinic + Stock Sync)
 * Features: Multi-sheet storage, concurrency LockService, and body-only secret token auth.
 */

const SHEET_NAME = "Sheet1"; // Patient Visits
const MEDICINES_SHEET = "Medicines";
const DISPENSED_SHEET = "Dispensed";
const SETTINGS_SHEET = "Settings";
const MEDIA_FOLDER_NAME = "ClinicalMedia";

const SHARED_SECRET_TOKEN = "physio_secret_token_change_me"; // Make sure this matches Next.js env config

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Authenticate Request
    if (!data.token || data.token !== SHARED_SECRET_TOKEN) {
      return createJsonResponse({ success: false, error: "401 Unauthorized" });
    }

    const type = data.type || "patients";
    const action = data.action || "get";

    if (action === "get") {
      return handleGet(type);
    }

    if (type === "settings") {
      return handleSaveSettings(data.data);
    }

    if (type === "medicines") {
      return handleStockAction(action, data.data);
    }

    if (type === "dispense" || type === "dispensed") {
      return handleDispense(data.data);
    }

    // Default: patients
    return handlePatientAction(action, data.data);

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// Keep a stub doGet for security guidance
function doGet(e) {
  return createJsonResponse({ 
    success: false, 
    error: "GET is disabled for security. Use POST with authorization token in body." 
  });
}

// ─── GET Handler ─────────────────────────────────────────────────────
function handleGet(type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  
  if (type === "settings") {
    const sheet = ss.getSheetByName(SETTINGS_SHEET);
    const rows = sheet.getDataRange().getValues();
    const settings = {};
    rows.slice(1).forEach(row => {
      if (row[0]) settings[row[0]] = row[1] || "";
    });
    return createJsonResponse({ success: true, data: settings });
  }

  if (type === "medicines") {
    const sheet = ss.getSheetByName(MEDICINES_SHEET);
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return createJsonResponse({ success: true, data: [] });
    const headers = data[0];
    const result = data.slice(1).map((row, i) => {
      let obj = {};
      headers.forEach((h, j) => {
        obj[h] = row[j];
      });
      obj.rowIndex = i; // Store array index for subsequent updates
      return obj;
    });
    return createJsonResponse({ success: true, data: result });
  }

  if (type === "dispensed") {
    const sheet = ss.getSheetByName(DISPENSED_SHEET);
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return createJsonResponse({ success: true, data: [] });
    const headers = data[0];
    const result = data.slice(1).map((row, i) => {
      let obj = {};
      headers.forEach((h, j) => {
        obj[h] = row[j];
      });
      obj.rowIndex = i;
      return obj;
    });
    return createJsonResponse({ success: true, data: result });
  }

  // patients (Sheet1)
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse({ success: true, data: [] });
  const headers = data[0];
  const result = data.slice(1).map((row, i) => {
    let obj = {};
    headers.forEach((h, j) => {
      obj[h] = row[j];
    });
    obj.rowIndex = i;
    return obj;
  });
  return createJsonResponse({ success: true, data: result });
}

// ─── Settings Handler ────────────────────────────────────────────────
function handleSaveSettings(settingsData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  sheet.clear();
  sheet.appendRow(["Key", "Value"]);
  
  Object.keys(settingsData).forEach(key => {
    sheet.appendRow([key, String(settingsData[key])]);
  });
  
  return createJsonResponse({ success: true, message: "Settings saved successfully" });
}

// ─── Stock (Medicines) Handler ────────────────────────────────────────
function handleStockAction(action, medicineData) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return createJsonResponse({ success: false, error: "Concurrency lock acquisition timeout. Please try again." });
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheets(ss);
    const sheet = ss.getSheetByName(MEDICINES_SHEET);
    const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData.length > 0 ? allData[0].map(h => String(h).trim()) : [];
    
    // Ensure OldName header exists
    let oldNameColIdx = headers.findIndex(h => h.toLowerCase() === "oldname");
    if (oldNameColIdx === -1 && headers.length > 0) {
      sheet.getRange(1, headers.length + 1).setValue("OldName").setFontWeight("bold").setBackground("#f3f3f3").setHorizontalAlignment("center");
      headers.push("OldName");
      oldNameColIdx = headers.length - 1;
    }

    if (action === "create") {
      const id = "MED-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      const row = [
        id,
        medicineData.name || "",
        medicineData.batchType || "",
        medicineData.unit || "",
        medicineData.unitMeasurement || "",
        Number(medicineData.totalStock) || 0,
        Number(medicineData.availableStock) || 0,
        Number(medicineData.pendingStock) || 0,
        Number(medicineData.outgoingStock) || 0,
        Number(medicineData.lowStockThreshold) || 10,
        timestamp,
        medicineData.oldName || ""
      ];
      sheet.appendRow(row);
      return createJsonResponse({ success: true, action: "create", data: { id } });
    }
    
    // Helper to find target row
    let actualRow = -1;
    const targetId = String(medicineData.id || medicineData.ID || "").trim();
    const targetName = String(medicineData.originalName || medicineData.name || medicineData.Name || "").trim().toLowerCase();

    if (medicineData.rowIndex !== undefined && medicineData.rowIndex !== null && !isNaN(Number(medicineData.rowIndex))) {
      const testRow = Number(medicineData.rowIndex) + 2;
      if (testRow >= 2 && testRow <= allData.length) {
        const rId = String(allData[testRow - 1][0] || "").trim();
        const rName = String(allData[testRow - 1][1] || "").trim().toLowerCase();
        if ((targetId && rId === targetId) || (targetName && rName === targetName)) {
          actualRow = testRow;
        }
      }
    }

    if (actualRow === -1) {
      for (let r = 1; r < allData.length; r++) {
        const rId = String(allData[r][0] || "").trim();
        const rName = String(allData[r][1] || "").trim().toLowerCase();
        if ((targetId && rId === targetId) || (targetName && rName === targetName)) {
          actualRow = r + 1;
          break;
        }
      }
    }

    if (actualRow === -1 && medicineData.rowIndex !== undefined && !isNaN(Number(medicineData.rowIndex))) {
      actualRow = Number(medicineData.rowIndex) + 2;
    }

    if (actualRow < 2) {
      return createJsonResponse({ success: false, error: "Medicine row not found for update/delete" });
    }

    if (action === "update") {
      const existingRow = actualRow <= allData.length ? allData[actualRow - 1] : [];
      const updatedRow = [
        medicineData.ID || medicineData.id || existingRow[0] || "",
        medicineData.Name || medicineData.name || existingRow[1] || "",
        medicineData.BatchType || medicineData.batchType || existingRow[2] || "",
        medicineData.Unit || medicineData.unit || existingRow[3] || "",
        medicineData.UnitMeasurement || medicineData.unitMeasurement || existingRow[4] || "",
        Number(medicineData.TotalStock !== undefined ? medicineData.TotalStock : (medicineData.totalStock !== undefined ? medicineData.totalStock : existingRow[5])) || 0,
        Number(medicineData.AvailableStock !== undefined ? medicineData.AvailableStock : (medicineData.availableStock !== undefined ? medicineData.availableStock : existingRow[6])) || 0,
        Number(medicineData.PendingStock !== undefined ? medicineData.PendingStock : (medicineData.pendingStock !== undefined ? medicineData.pendingStock : existingRow[7])) || 0,
        Number(medicineData.OutgoingStock !== undefined ? medicineData.OutgoingStock : (medicineData.outgoingStock !== undefined ? medicineData.outgoingStock : existingRow[8])) || 0,
        Number(medicineData.LowStockThreshold !== undefined ? medicineData.LowStockThreshold : (medicineData.lowStockThreshold !== undefined ? medicineData.lowStockThreshold : existingRow[9])) || 10,
        timestamp,
        medicineData.OldName !== undefined ? medicineData.OldName : (medicineData.oldName !== undefined ? medicineData.oldName : (existingRow[11] || ""))
      ];
      
      sheet.getRange(actualRow, 1, 1, updatedRow.length).setValues([updatedRow]);
      return createJsonResponse({ success: true, action: "update" });
    }
    
    if (action === "delete") {
      sheet.deleteRow(actualRow);
      return createJsonResponse({ success: true, action: "delete" });
    }
    
    return createJsonResponse({ success: false, error: "Unknown stock action" });
    
  } finally {
    lock.releaseLock();
  }
}

// ─── Dispensing Handler ──────────────────────────────────────────────
function handleDispense(dispenseData) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return createJsonResponse({ success: false, error: "Concurrency lock acquisition timeout. Please try again." });
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheets(ss);
    
    const medSheet = ss.getSheetByName(MEDICINES_SHEET);
    const medData = medSheet.getDataRange().getValues();
    if (medData.length < 2) {
      return createJsonResponse({ success: false, error: "No medicines found in stock." });
    }
    
    const targetMedName = dispenseData.medicineName;
    const qtyToDispense = Number(dispenseData.quantity);
    if (isNaN(qtyToDispense) || qtyToDispense <= 0) {
      return createJsonResponse({ success: false, error: "Invalid dispense quantity." });
    }
    
    let foundRowIndex = -1;
    let currentAvailable = 0;
    let currentOutgoing = 0;
    
    for (let i = 1; i < medData.length; i++) {
      if (medData[i][1] === targetMedName || medData[i][0] === targetMedName) {
        foundRowIndex = i + 1; // 1-based row number
        currentAvailable = Number(medData[i][6]) || 0;
        currentOutgoing = Number(medData[i][8]) || 0;
        break;
      }
    }
    
    if (foundRowIndex === -1) {
      return createJsonResponse({ success: false, error: "Medicine not found in stock: " + targetMedName });
    }
    
    if (currentAvailable < qtyToDispense) {
      return createJsonResponse({ 
        success: false, 
        error: "Insufficient stock. Available: " + currentAvailable + ", Requested: " + qtyToDispense 
      });
    }
    
    const newAvailable = currentAvailable - qtyToDispense;
    const newOutgoing = currentOutgoing + qtyToDispense;
    
    // Update Medicines sheet G = AvailableStock (Col 7), I = OutgoingStock (Col 9)
    medSheet.getRange(foundRowIndex, 7).setValue(newAvailable);
    medSheet.getRange(foundRowIndex, 9).setValue(newOutgoing);
    
    // Record in Dispensed log
    const dispSheet = ss.getSheetByName(DISPENSED_SHEET);
    const id = "DISP-" + Utilities.getUuid().substring(0, 8).toUpperCase();
    const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    
    const logRow = [
      id,
      dispenseData.patientName || "Walk-in",
      dispenseData.patientSlug || "",
      targetMedName,
      qtyToDispense,
      dispenseData.dosage || "",
      dispenseData.type || "quick",
      timestamp
    ];
    dispSheet.appendRow(logRow);
    
    return createJsonResponse({ success: true, dispensedId: id, newAvailableStock: newAvailable });
    
  } finally {
    lock.releaseLock();
  }
}

// ─── Patient Actions (Visits) Handler ──────────────────────────────────
function handlePatientAction(action, patientData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Process Media Uploads
  const mediaUrls = [];
  if (patientData.files && patientData.files.length > 0) {
    const folder = getOrCreateMediaFolder();
    patientData.files.forEach(file => {
      const blob = Utilities.newBlob(Utilities.base64Decode(file.data), file.type, file.name);
      const driveFile = folder.createFile(blob);
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      mediaUrls.push(`${driveFile.getId()}|${file.type}|${file.name}`);
    });
  }
  
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  const headers = getPatientHeaders();
  
  const rowData = headers.map(header => {
    if (header === "Timestamp") return timestamp;
    if (header.startsWith("Media")) {
      const index = parseInt(header.replace("Media", "")) - 1;
      return mediaUrls[index] || patientData[header] || "";
    }
    const val = patientData[header];
    return val !== undefined ? val : "";
  });
  
  if (action === "update" && patientData.rowIndex !== undefined) {
    const actualRow = Number(patientData.rowIndex) + 2; 
    sheet.getRange(actualRow, 1, 1, rowData.length).setValues([rowData]);
    return createJsonResponse({ success: true, action: "update" });
  } else {
    sheet.appendRow(rowData);
    return createJsonResponse({ success: true, action: "create" });
  }
}

// ─── Utilities ────────────────────────────────────────────────────────
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateMediaFolder() {
  const folders = DriveApp.getFoldersByName(MEDIA_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(MEDIA_FOLDER_NAME);
}

function getPatientHeaders() {
  return [
    "Date", "PatientName", "Age", "Sex", "Occupation", "PhoneNumber", "Height", "Weight", 
    "BloodPressure", "DiabeticMellitus", "DietHabit", "SleepingHistory", "MenstruationHistory",
    "ChiefComplaint", "DiagnosticImaging", "Diagnosis", "TreatmentPlan", "DailyNote", "Comments",
    "Media1", "Media2", "Media3", "Media4", "Timestamp"
  ];
}

function setupSheets(ss) {
  // 1. Ensure Patient Visits Sheet
  let sheet1 = ss.getSheetByName(SHEET_NAME);
  if (!sheet1) {
    sheet1 = ss.insertSheet(SHEET_NAME);
  }
  const patientHeaders = getPatientHeaders();
  sheet1.getRange(1, 1, 1, patientHeaders.length).setValues([patientHeaders]);
  sheet1.getRange(1, 1, 1, patientHeaders.length).setFontWeight("bold").setBackground("#f3f3f3").setHorizontalAlignment("center");
  sheet1.setFrozenRows(1);
  
  // 2. Ensure Medicines Stock Sheet
  let medSheet = ss.getSheetByName(MEDICINES_SHEET);
  if (!medSheet) {
    medSheet = ss.insertSheet(MEDICINES_SHEET);
  }
  const medHeaders = ["ID", "Name", "BatchType", "Unit", "UnitMeasurement", "TotalStock", "AvailableStock", "PendingStock", "OutgoingStock", "LowStockThreshold", "Timestamp", "OldName"];
  medSheet.getRange(1, 1, 1, medHeaders.length).setValues([medHeaders]);
  medSheet.getRange(1, 1, 1, medHeaders.length).setFontWeight("bold").setBackground("#f3f3f3").setHorizontalAlignment("center");
  medSheet.setFrozenRows(1);
  
  // 3. Ensure Dispensed Logs Sheet
  let dispSheet = ss.getSheetByName(DISPENSED_SHEET);
  if (!dispSheet) {
    dispSheet = ss.insertSheet(DISPENSED_SHEET);
  }
  const dispHeaders = ["ID", "PatientName", "PatientSlug", "MedicineName", "Quantity", "Dosage", "Type", "Timestamp"];
  dispSheet.getRange(1, 1, 1, dispHeaders.length).setValues([dispHeaders]);
  dispSheet.getRange(1, 1, 1, dispHeaders.length).setFontWeight("bold").setBackground("#f3f3f3").setHorizontalAlignment("center");
  dispSheet.setFrozenRows(1);
  
  // 4. Ensure Clinic Settings Sheet
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET);
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["clinicName", "General Clinic"]);
    settingsSheet.appendRow(["clinicLogo", ""]);
    settingsSheet.appendRow(["clinicAddress", "123 Main Street, Clinic City"]);
    settingsSheet.appendRow(["doctorNames", "Dr. John Doe"]);
    settingsSheet.appendRow(["clinicContact", "123-456-7890"]);
  }
}
