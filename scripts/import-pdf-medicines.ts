import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

interface MedicineImport {
  name: string;
  type: string;
  unit: string;
  unitMeasurement: string;
  totalStock: number;
  availableStock: number;
  lowStockThreshold: number;
}

const MEDICINES_DATA: MedicineImport[] = [
  // Page 1
  { name: "TAB. KHAZNA CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 87, availableStock: 37, lowStockThreshold: 10 },
  { name: "TAB. REST MODE 0.5", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 146, availableStock: 146, lowStockThreshold: 20 },
  { name: "TAB. REST MODE 0.25", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 270, availableStock: 270, lowStockThreshold: 20 },
  { name: "TAB. ATRALIPID", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 49, availableStock: 49, lowStockThreshold: 10 },
  { name: "TAB. SLO LONG", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 110, availableStock: 65, lowStockThreshold: 15 },
  { name: "CAP. CLOV CARE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 72, availableStock: 72, lowStockThreshold: 10 },
  { name: "TAB. CLOV CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 85, availableStock: 75, lowStockThreshold: 15 },
  { name: "TAB. AYOTIC", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 63, availableStock: 63, lowStockThreshold: 10 },
  { name: "TAB. ACTION TONE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 112, availableStock: 112, lowStockThreshold: 15 },
  { name: "CAP. ACTION TONE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 56, availableStock: 52, lowStockThreshold: 10 },
  { name: "TAB. WARM CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 19, availableStock: 19, lowStockThreshold: 5 },
  { name: "TAB. IMMUNE CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 332, availableStock: 315, lowStockThreshold: 30 },
  { name: "TAB. GENTLE 10MG", type: "Tablet", unit: "Tablet", unitMeasurement: "10mg", totalStock: 606, availableStock: 592, lowStockThreshold: 40 },
  { name: "TAB. GENTLE 20MG", type: "Tablet", unit: "Tablet", unitMeasurement: "20mg", totalStock: 158, availableStock: 158, lowStockThreshold: 20 },
  { name: "TAB. RAK CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 415, availableStock: 363, lowStockThreshold: 35 },
  { name: "TAB. CIPROX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 82, availableStock: 78, lowStockThreshold: 15 },
  { name: "TAB. CEFRIG 100", type: "Tablet", unit: "Tablet", unitMeasurement: "100mg", totalStock: 80, availableStock: 80, lowStockThreshold: 15 },
  { name: "TAB. CEFRIG 200", type: "Tablet", unit: "Tablet", unitMeasurement: "200mg", totalStock: 63, availableStock: 63, lowStockThreshold: 10 },
  { name: "CAP. KOEXIN CARE", type: "Capsule", unit: "Capsule", unitMeasurement: "500mg", totalStock: 64, availableStock: 64, lowStockThreshold: 10 },
  { name: "TAB. BRAIN UP", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 45, availableStock: 45, lowStockThreshold: 10 },
  { name: "TAB. MIND REST", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 78, availableStock: 78, lowStockThreshold: 15 },
  { name: "TAB. COMI GUARD", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 72, availableStock: 72, lowStockThreshold: 10 },

  // Page 2
  { name: "TAB. DS CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 218, availableStock: 218, lowStockThreshold: 20 },
  { name: "TAB. DAB CARE 5", type: "Tablet", unit: "Tablet", unitMeasurement: "5mg", totalStock: 70, availableStock: 69, lowStockThreshold: 10 },
  { name: "TAB. DAB CARE 10", type: "Tablet", unit: "Tablet", unitMeasurement: "10mg", totalStock: 121, availableStock: 121, lowStockThreshold: 15 },
  { name: "TAB. DERMA CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 849, availableStock: 849, lowStockThreshold: 50 },
  { name: "TAB. FEVARIN", type: "Tablet", unit: "Tablet", unitMeasurement: "650mg", totalStock: 34, availableStock: 34, lowStockThreshold: 10 },
  { name: "TAB. DOXO GUARD", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 84, availableStock: 84, lowStockThreshold: 15 },
  { name: "TAB. DIBI CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 228, availableStock: 78, lowStockThreshold: 20 },
  { name: "TAB. ORTHO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 82, availableStock: 72, lowStockThreshold: 15 },
  { name: "TAB. DR CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 77, availableStock: 77, lowStockThreshold: 10 },
  { name: "TAB. DIPIT-M", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 93, availableStock: 63, lowStockThreshold: 15 },
  { name: "TAB. PHYREX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 223, availableStock: 223, lowStockThreshold: 20 },
  { name: "TAB. DECTO CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 948, availableStock: 920, lowStockThreshold: 50 },
  { name: "TAB. DOXROL", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 163, availableStock: 163, lowStockThreshold: 20 },
  { name: "TAB. AYULAX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 140, availableStock: 126, lowStockThreshold: 15 },
  { name: "TAB. FIT GO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 60, availableStock: 60, lowStockThreshold: 10 },
  { name: "TAB. VOMEX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 53, availableStock: 53, lowStockThreshold: 10 },
  { name: "TAB. E. GERM CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 176, availableStock: 176, lowStockThreshold: 20 },
  { name: "CAP. DAMANO", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 446, availableStock: 412, lowStockThreshold: 35 },
  { name: "TAB. STRESS FREE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 245, availableStock: 238, lowStockThreshold: 25 },
  { name: "CAP. BRAIN TONE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 109, availableStock: 109, lowStockThreshold: 15 },
  { name: "TAB. ACICID", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 299, availableStock: 271, lowStockThreshold: 25 },
  { name: "TAB. FELIZTONIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 160, availableStock: 149, lowStockThreshold: 20 },
  { name: "TAB. FORT CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 288, availableStock: 260, lowStockThreshold: 25 },
  { name: "TAB. FUNG CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 48, availableStock: 48, lowStockThreshold: 10 },
  { name: "TAB. FEMILONE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 75, availableStock: 75, lowStockThreshold: 15 },

  // Page 3
  { name: "TAB. GANDAA CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 104, availableStock: 104, lowStockThreshold: 15 },
  { name: "CAP. NEUROVIN", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 155, availableStock: 140, lowStockThreshold: 20 },
  { name: "TAB. GONSET CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 3, availableStock: 3, lowStockThreshold: 5 },
  { name: "TAB. GMET GO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 239, availableStock: 239, lowStockThreshold: 25 },
  { name: "TAB. GLIMET", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 60, availableStock: 60, lowStockThreshold: 10 },
  { name: "TAB. LENGM CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 159, availableStock: 159, lowStockThreshold: 20 },
  { name: "TAB. ROPAN CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 307, availableStock: 141, lowStockThreshold: 25 },
  { name: "TAB. HARTONE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 242, availableStock: 227, lowStockThreshold: 20 },
  { name: "TAB. VIROKIND", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 105, availableStock: 105, lowStockThreshold: 15 },
  { name: "CAP. BREMITONE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 38, availableStock: 38, lowStockThreshold: 10 },
  { name: "TAB. GAYTARIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 354, availableStock: 354, lowStockThreshold: 30 },
  { name: "KALANI KALIMBO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 8, availableStock: 8, lowStockThreshold: 5 },
  { name: "TAB. KARBORIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 279, availableStock: 279, lowStockThreshold: 25 },
  { name: "TAB. LIBTONE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 104, availableStock: 93, lowStockThreshold: 15 },
  { name: "TAB. RESUP", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 170, availableStock: 170, lowStockThreshold: 20 },
  { name: "TAB. LUTHMAIDE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 1315, availableStock: 1315, lowStockThreshold: 50 },
  { name: "TAB. DIARESTONE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 84, availableStock: 84, lowStockThreshold: 15 },
  { name: "CAP. REGUTONE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 1150, availableStock: 1060, lowStockThreshold: 50 },
  { name: "TAB. EXOTI CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 604, availableStock: 583, lowStockThreshold: 40 },
  { name: "TAB. AR CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 101, availableStock: 58, lowStockThreshold: 15 },
  { name: "TAB. MEP-GEM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 180, availableStock: 152, lowStockThreshold: 20 },
  { name: "TAB. FLOW CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 53, availableStock: 53, lowStockThreshold: 10 },
  { name: "TAB. RHUMADHLIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 110, availableStock: 110, lowStockThreshold: 15 },

  // Page 4
  { name: "TAB. BACTO CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 78, availableStock: 78, lowStockThreshold: 15 },
  { name: "TAB. URINARY CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 176, availableStock: 176, lowStockThreshold: 20 },
  { name: "TAB. BP CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 68, availableStock: 68, lowStockThreshold: 10 },
  { name: "TAB. ARJAL", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 50, availableStock: 50, lowStockThreshold: 10 },
  { name: "TAB. PAINREX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 108, availableStock: 108, lowStockThreshold: 15 },
  { name: "TAB. MARGO CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 60, availableStock: 60, lowStockThreshold: 10 },
  { name: "TAB. PAINTONE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 71, availableStock: 71, lowStockThreshold: 10 },
  { name: "TAB. OF CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 67, availableStock: 67, lowStockThreshold: 10 },
  { name: "CAP. PEPTINLIN", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 280, availableStock: 238, lowStockThreshold: 25 },
  { name: "TAB. PIG CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 125, availableStock: 125, lowStockThreshold: 15 },
  { name: "TAB. DEMP CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 793, availableStock: 763, lowStockThreshold: 30 },
  { name: "TAB. GASTRO CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 148, availableStock: 148, lowStockThreshold: 20 },
  { name: "CAP. RG SKIN", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 674, availableStock: 674, lowStockThreshold: 30 },
  { name: "TAB. CAL CAL", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 1725, availableStock: 1725, lowStockThreshold: 50 },
  { name: "TAB. GAS PAIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 114, availableStock: 114, lowStockThreshold: 15 },
  { name: "TAB. S-TOLIN CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 14, availableStock: 14, lowStockThreshold: 5 },
  { name: "CAP. S-MONTH CARE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 256, availableStock: 234, lowStockThreshold: 25 },
  { name: "TAB. HERBO COUGH", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 342, availableStock: 329, lowStockThreshold: 30 },
  { name: "TAB. SET CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 194, availableStock: 165, lowStockThreshold: 20 },
  { name: "CAP. MEHAVIT", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 104, availableStock: 97, lowStockThreshold: 15 },
  { name: "TAB. TRIP CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 62, availableStock: 62, lowStockThreshold: 10 },
  { name: "CAP. TC SHINE", type: "Capsule", unit: "Capsule", unitMeasurement: "500mg", totalStock: 266, availableStock: 215, lowStockThreshold: 20 },
  { name: "TAB. TEM CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 86, availableStock: 86, lowStockThreshold: 10 },

  // Page 5
  { name: "TAB. NEUROTEG 100", type: "Tablet", unit: "Tablet", unitMeasurement: "100mg", totalStock: 78, availableStock: 63, lowStockThreshold: 10 },
  { name: "TAB. NEUROTEG 200", type: "Tablet", unit: "Tablet", unitMeasurement: "200mg", totalStock: 243, availableStock: 243, lowStockThreshold: 25 },
  { name: "TAB. TEF CARE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 161, availableStock: 161, lowStockThreshold: 20 },
  { name: "TAB. VM CONTROL", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 178, availableStock: 148, lowStockThreshold: 20 },
  { name: "TAB. VALARIN", type: "Tablet", unit: "Tablet", unitMeasurement: "1000", totalStock: 26, availableStock: 26, lowStockThreshold: 5 },
  { name: "TAB. NOGRAIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 108, availableStock: 108, lowStockThreshold: 15 },
  { name: "TAB. RELAX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 119, availableStock: 98, lowStockThreshold: 15 },
  { name: "SURARI POWDER", type: "Powder", unit: "Bottle", unitMeasurement: "g", totalStock: 53, availableStock: 53, lowStockThreshold: 10 },
  { name: "SY. HEARTY TONE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 7, availableStock: 7, lowStockThreshold: 2 },
  { name: "SY. ALFA ALFA", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 1, lowStockThreshold: 2 },
  { name: "SY. FREELUX", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. BIOPROM", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 1, availableStock: 1, lowStockThreshold: 2 },
  { name: "SY. ALKAZIP", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "SY. MINOLAST LC", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. OF + MRD", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 3, lowStockThreshold: 2 },
  { name: "SY. ALBENDOL", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. AMOXY CLOVE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 3, availableStock: 3, lowStockThreshold: 2 },
  { name: "SY. AZITHRO", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 6, availableStock: 6, lowStockThreshold: 2 },
  { name: "SY. NO COLD", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. COTRIMAXAZOLE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. CETRI", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 5, availableStock: 4, lowStockThreshold: 2 },
  { name: "SY. MRD", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. PARACIP", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "SY. BETAMETHASONE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 1, availableStock: 1, lowStockThreshold: 2 },

  // Page 6
  { name: "SY. COMAFLAM", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 1, availableStock: 1, lowStockThreshold: 2 },
  { name: "SY. SWASAMIRTHAM", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "PROTIN POWDER", type: "Powder", unit: "Jar", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "TV SHAMPOO", type: "Shampoo", unit: "Bottle", unitMeasurement: "ml", totalStock: 12, availableStock: 12, lowStockThreshold: 3 },
  { name: "TRICHUP SHAMPOO", type: "Shampoo", unit: "Bottle", unitMeasurement: "ml", totalStock: 5, availableStock: 4, lowStockThreshold: 2 },
  { name: "TRICHUP OIL", type: "Oil", unit: "Bottle", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SC LOTION", type: "Ointment", unit: "Bottle", unitMeasurement: "ml", totalStock: 8, availableStock: 7, lowStockThreshold: 2 },
  { name: "BETASOLIC LOTION", type: "Ointment", unit: "Bottle", unitMeasurement: "ml", totalStock: 10, availableStock: 10, lowStockThreshold: 2 },
  { name: "HAIRRICH OIL", type: "Oil", unit: "Bottle", unitMeasurement: "ml", totalStock: 2, availableStock: 1, lowStockThreshold: 2 },
  { name: "KHAZNA OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 15, availableStock: 13.5, lowStockThreshold: 3 },
  { name: "KT 5 DERM OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 29, availableStock: 29, lowStockThreshold: 5 },
  { name: "BETASOLIC OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 22, availableStock: 15, lowStockThreshold: 3 },
  { name: "ROPAN OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 10, availableStock: 10, lowStockThreshold: 3 },
  { name: "CLINSOL OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 21, availableStock: 20, lowStockThreshold: 3 },
  { name: "PIGMAX OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 17, availableStock: 16.5, lowStockThreshold: 3 },
  { name: "IOSTER OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "T-BACT OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 5, availableStock: 5, lowStockThreshold: 2 },
  { name: "SINDHRATHI LEPAM", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "LEUCODNA OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "GLOWIN OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 22.5, availableStock: 22.5, lowStockThreshold: 3 },
  { name: "SCABIC OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 9.5, availableStock: 9.5, lowStockThreshold: 2 },
  { name: "PILES OINTMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 15, availableStock: 14, lowStockThreshold: 3 },
  { name: "DEWARTS CREAM", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 6, availableStock: 6, lowStockThreshold: 2 },
  { name: "KETO SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 7, availableStock: 7, lowStockThreshold: 2 },
  { name: "CLINSOL SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "SK 19 SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 8, availableStock: 8, lowStockThreshold: 2 },
  { name: "SCABIC SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 5, availableStock: 3, lowStockThreshold: 2 },
  { name: "HT SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 6, availableStock: 6, lowStockThreshold: 2 },
  { name: "CBC + MAYAM", type: "Powder", unit: "Jar", unitMeasurement: "g", totalStock: 3, availableStock: 3, lowStockThreshold: 2 }
];

async function importToSupabase() {
  console.log("Connecting to Supabase PostgreSQL database using Prisma...");
  const prisma = new PrismaClient();
  
  let successCount = 0;
  let existCount = 0;

  for (const med of MEDICINES_DATA) {
    try {
      const existing = await prisma.medicine.findUnique({
        where: { name: med.name }
      });
      if (existing) {
        existCount++;
        continue;
      }
      await prisma.medicine.create({
        data: med
      });
      successCount++;
    } catch (err) {
      console.error(`Prisma failed for ${med.name}:`, err);
    }
  }
  console.log(`Supabase Database Sync Complete: ${successCount} added, ${existCount} already exists.`);
  await prisma.$disconnect();
}

async function importToGoogleSheets() {
  console.log("Connecting to Google Sheets using Apps Script URL...");
  
  // Read env variables
  const envFilePath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  } else if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, 'utf8');
  } else {
    console.error("No .env or .env.local file found. Cannot resolve APPS_SCRIPT_URL.");
    process.exit(1);
  }

  const getEnv = (key: string): string => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim().replace(/['"]/g, '') : '';
  };

  const appsScriptUrl = getEnv('GOOGLE_APPS_SCRIPT_URL') || getEnv('NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL');
  const token = getEnv('SHARED_SECRET_TOKEN') || 'physio_secret_token_change_me';

  if (!appsScriptUrl) {
    console.error("Missing GOOGLE_APPS_SCRIPT_URL environment configuration.");
    process.exit(1);
  }

  console.log(`Using Apps Script Endpoint: ${appsScriptUrl}`);

  let added = 0;
  
  // We make parallel requests to speed up the process, with concurrency control
  const CONCURRENCY_LIMIT = 5;
  const chunks = [];
  for (let i = 0; i < MEDICINES_DATA.length; i += CONCURRENCY_LIMIT) {
    chunks.push(MEDICINES_DATA.slice(i, i + CONCURRENCY_LIMIT));
  }

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    console.log(`Processing batch ${i+1}/${chunks.length} (${batch.length} items)...`);
    
    await Promise.all(batch.map(async (med) => {
      try {
        const res = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            type: 'medicines',
            action: 'create',
            data: med
          })
        });

        if (res.ok) {
          const body = await res.json();
          if (body.success) {
            added++;
          } else {
            console.error(`Failed to insert ${med.name}:`, body.error);
          }
        } else {
          console.error(`HTTP failed for ${med.name}: ${res.status}`);
        }
      } catch (err) {
        console.error(`Error requesting ${med.name}:`, err);
      }
    }));
    
    // Pause briefly between batches to avoid lock contention
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  console.log(`Google Sheets Sync Complete: ${added}/${MEDICINES_DATA.length} medicines created.`);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const isPostgres = dbUrl && (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql'));
  
  if (isPostgres) {
    await importToSupabase();
  } else {
    await importToGoogleSheets();
  }
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
