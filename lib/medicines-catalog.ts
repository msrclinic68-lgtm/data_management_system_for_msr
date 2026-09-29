export interface MedicineCatalogItem {
  id?: string;
  name: string;      // New Name from PDF
  oldName: string;   // Old Name from PDF
  type: string;      // Tablet, Capsule, Syrup, Ointment, Soap, Powder, Oil, Shampoo
  unit: string;
  unitMeasurement: string;
  totalStock: number;
  availableStock: number;
  lowStockThreshold: number;
}

export const MEDICINES_CATALOG: MedicineCatalogItem[] = [
  // Page 1
  { name: "TAB. KHAZNA CARE", oldName: "TAB. ALEGRA", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 87, availableStock: 37, lowStockThreshold: 10 },
  { name: "TAB. REST MODE 0.5", oldName: "TAB. AL 0.5", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 146, availableStock: 146, lowStockThreshold: 20 },
  { name: "TAB. REST MODE 0.25", oldName: "TAB. AL 0.25", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 270, availableStock: 270, lowStockThreshold: 20 },
  { name: "TAB. ATRALIPID", oldName: "TAB. ATROVASTIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 49, availableStock: 49, lowStockThreshold: 10 },
  { name: "TAB. SLO LONG", oldName: "TAB. AMLONG AT", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 110, availableStock: 65, lowStockThreshold: 15 },
  { name: "CAP. CLOV CARE", oldName: "CAP. AMOXY CLOV", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 72, availableStock: 72, lowStockThreshold: 10 },
  { name: "TAB. CLOV CARE", oldName: "TAB. AMOXY CLOV", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 85, availableStock: 75, lowStockThreshold: 15 },
  { name: "TAB. AYOTIC", oldName: "TAB. AZITHRO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 63, availableStock: 63, lowStockThreshold: 10 },
  { name: "TAB. ACTION TONE", oldName: "TAB. AZ100", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 112, availableStock: 112, lowStockThreshold: 15 },
  { name: "CAP. ACTION TONE", oldName: "CAP. AZ100", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 56, availableStock: 52, lowStockThreshold: 10 },
  { name: "TAB. WARM CARE", oldName: "TAB. BANDY PLUS", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 19, availableStock: 19, lowStockThreshold: 5 },
  { name: "TAB. IMMUNE CARE", oldName: "TAB. BC", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 332, availableStock: 315, lowStockThreshold: 30 },
  { name: "TAB. GENTLE 100MG", oldName: "TAB. BIGFUN 100MG", type: "Tablet", unit: "Tablet", unitMeasurement: "100mg", totalStock: 606, availableStock: 592, lowStockThreshold: 40 },
  { name: "TAB. GENTLE 50MG", oldName: "TAB. BIGFUN 50MG", type: "Tablet", unit: "Tablet", unitMeasurement: "50mg", totalStock: 158, availableStock: 158, lowStockThreshold: 20 },
  { name: "TAB. RAK CARE", oldName: "TAB. CETRI", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 415, availableStock: 363, lowStockThreshold: 35 },
  { name: "TAB. CIPROX", oldName: "TAB. CF", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 82, availableStock: 78, lowStockThreshold: 15 },
  { name: "TAB. CEFRIO 100", oldName: "TAB. CEFIXIME 100MG", type: "Tablet", unit: "Tablet", unitMeasurement: "100mg", totalStock: 80, availableStock: 80, lowStockThreshold: 15 },
  { name: "TAB. CEFRIO 200", oldName: "TAB. CEFIXIME 200MG", type: "Tablet", unit: "Tablet", unitMeasurement: "200mg", totalStock: 63, availableStock: 63, lowStockThreshold: 10 },
  { name: "CAP. KOEXIN CARE", oldName: "CAP. CEFLAXIN 500MG", type: "Capsule", unit: "Capsule", unitMeasurement: "500mg", totalStock: 64, availableStock: 64, lowStockThreshold: 10 },
  { name: "TAB. BRAIN UP", oldName: "TAB. CLONAFITBETA", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 45, availableStock: 45, lowStockThreshold: 10 },
  { name: "TAB. MIND REST", oldName: "TAB. CLONAZEPAM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 78, availableStock: 78, lowStockThreshold: 15 },
  { name: "TAB. COMI GUARD", oldName: "TAB. COMAFLAM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 72, availableStock: 72, lowStockThreshold: 10 },

  // Page 2
  { name: "TAB. DS CARE", oldName: "TAB. DS", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 218, availableStock: 218, lowStockThreshold: 20 },
  { name: "TAB. DAB CARE 5", oldName: "TAB. DABAFORD 5MG", type: "Tablet", unit: "Tablet", unitMeasurement: "5mg", totalStock: 70, availableStock: 69, lowStockThreshold: 10 },
  { name: "TAB. DAB CARE 10", oldName: "TAB. DABAFORD 10MG", type: "Tablet", unit: "Tablet", unitMeasurement: "10mg", totalStock: 121, availableStock: 121, lowStockThreshold: 15 },
  { name: "TAB. DERMA CARE", oldName: "TAB. DERMONIUM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 849, availableStock: 849, lowStockThreshold: 50 },
  { name: "TAB. FEVARIN", oldName: "TAB. DOLO 650", type: "Tablet", unit: "Tablet", unitMeasurement: "650mg", totalStock: 34, availableStock: 34, lowStockThreshold: 10 },
  { name: "TAB. DOXO GUARD", oldName: "TAB. DOXO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 84, availableStock: 84, lowStockThreshold: 15 },
  { name: "TAB. DIBI CARE", oldName: "TAB. DEBISTAL GM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 228, availableStock: 78, lowStockThreshold: 20 },
  { name: "TAB. ORTHO", oldName: "TAB. DICLO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 82, availableStock: 72, lowStockThreshold: 15 },
  { name: "TAB. DR CARE", oldName: "TAB. DR", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 77, availableStock: 77, lowStockThreshold: 10 },
  { name: "TAB. DIPIT-M", oldName: "TAB. DEBIGLIPTM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 93, availableStock: 63, lowStockThreshold: 15 },
  { name: "TAB. PHYREX", oldName: "TAB. DX DT", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 223, availableStock: 223, lowStockThreshold: 20 },
  { name: "TAB. DECTO CARE", oldName: "TAB. DEC", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 948, availableStock: 920, lowStockThreshold: 50 },
  { name: "TAB. DOXROL", oldName: "TAB. DOXY", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 163, availableStock: 163, lowStockThreshold: 20 },
  { name: "TAB. AYULAX", oldName: "TAB. DULCOLAX", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 140, availableStock: 126, lowStockThreshold: 15 },
  { name: "TAB. FIT GO", oldName: "TAB. ED SAVE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 60, availableStock: 60, lowStockThreshold: 10 },
  { name: "TAB. VOMEX", oldName: "TAB. EMISET", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 53, availableStock: 53, lowStockThreshold: 10 },
  { name: "TAB. E. GERM CARE", oldName: "TAB. EMYCINE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 176, availableStock: 176, lowStockThreshold: 20 },
  { name: "CAP. DAMANO", oldName: "CAP. EPDERM", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 446, availableStock: 412, lowStockThreshold: 35 },
  { name: "TAB. STRESS FRESS", oldName: "TAB. FELIZ +", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 245, availableStock: 238, lowStockThreshold: 25 },
  { name: "CAP. BRAIN TONE", oldName: "CAP. FLUDEP", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 109, availableStock: 109, lowStockThreshold: 15 },
  { name: "TAB. AJI CID", oldName: "TAB. FD.", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 299, availableStock: 271, lowStockThreshold: 25 },
  { name: "TAB. FELIZTONIN", oldName: "TAB. FELIZ PLAIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 160, availableStock: 149, lowStockThreshold: 20 },
  { name: "TAB. FORT CARE", oldName: "TAB. FORTAGE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 288, availableStock: 260, lowStockThreshold: 25 },
  { name: "TAB. FUNGI CARE", oldName: "TAB. FLUCONAZOLE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 48, availableStock: 48, lowStockThreshold: 10 },
  { name: "TAB. FEMILONE", oldName: "TAB. FA", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 75, availableStock: 75, lowStockThreshold: 15 },

  // Page 3
  { name: "TAB. GANDAA CARE", oldName: "TAB. GANDHAGA RASAYAN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 104, availableStock: 104, lowStockThreshold: 15 },
  { name: "CAP. NEUROVIN", oldName: "CAP. GABA SAFE", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 155, availableStock: 140, lowStockThreshold: 20 },
  { name: "TAB. GONASET CARE", oldName: "TAB. GONASET", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 3, availableStock: 3, lowStockThreshold: 5 },
  { name: "TAB. GMET GO", oldName: "TAB. GG", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 239, availableStock: 239, lowStockThreshold: 25 },
  { name: "TAB. GLIMET", oldName: "TAB. GL + GG", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 60, availableStock: 60, lowStockThreshold: 10 },
  { name: "TAB. IENGIM CARE", oldName: "TAB. GLIMER M2", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 159, availableStock: 159, lowStockThreshold: 20 },
  { name: "TAB. ROPAN CARE", oldName: "TAB. GF", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 307, availableStock: 141, lowStockThreshold: 25 },
  { name: "TAB. HARTONE", oldName: "TAB. HAIR BLESS", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 242, availableStock: 227, lowStockThreshold: 20 },
  { name: "TAB. VIROKIND", oldName: "TAB. HERBI KIND", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 105, availableStock: 105, lowStockThreshold: 15 },
  { name: "CAP. BREMITONE", oldName: "CAP. IRON", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 38, availableStock: 38, lowStockThreshold: 10 },
  { name: "TAB. GAYTARIN", oldName: "TAB. KANCHANDRA GUGULU", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 354, availableStock: 354, lowStockThreshold: 30 },
  { name: "KALANI KALIMBO", oldName: "KALANI KALIMBO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 8, availableStock: 8, lowStockThreshold: 5 },
  { name: "TAB. KARBORIN", oldName: "TAB. KARBOGI", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 279, availableStock: 279, lowStockThreshold: 25 },
  { name: "TAB. LIBTONE", oldName: "TAB. LIBROMED", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 104, availableStock: 93, lowStockThreshold: 15 },
  { name: "TAB. RESUP", oldName: "TAB. LITHOSUN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 170, availableStock: 170, lowStockThreshold: 20 },
  { name: "TAB. LUTHMAIDE", oldName: "TAB. LOPERMAIDE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 1315, availableStock: 1315, lowStockThreshold: 50 },
  { name: "TAB. DIARESTONE", oldName: "TAB. LASIS", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 84, availableStock: 84, lowStockThreshold: 15 },
  { name: "CAP. REGUTONE", oldName: "CAP. MM", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 1150, availableStock: 1060, lowStockThreshold: 50 },
  { name: "TAB. EXOTI CARE", oldName: "TAB. MRD", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 604, availableStock: 583, lowStockThreshold: 40 },
  { name: "TAB. AR CARE", oldName: "TAB. MONTICOPE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 101, availableStock: 58, lowStockThreshold: 15 },
  { name: "TAB. MEP-GEM", oldName: "TAB. MEP 4", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 180, availableStock: 152, lowStockThreshold: 20 },
  { name: "TAB. FLOW CARE", oldName: "TAB. MP5", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 53, availableStock: 53, lowStockThreshold: 10 },
  { name: "TAB. RHUMADHLIN", oldName: "TAB. NCIP MR.", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 110, availableStock: 110, lowStockThreshold: 15 },

  // Page 4
  { name: "TAB. BACTO CARE", oldName: "TAB. NF", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 78, availableStock: 78, lowStockThreshold: 15 },
  { name: "TAB. URINARY CARE", oldName: "TAB. NEERI", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 176, availableStock: 176, lowStockThreshold: 20 },
  { name: "TAB. BP CARE", oldName: "TAB. NOR BEE BEE", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 68, availableStock: 68, lowStockThreshold: 10 },
  { name: "TAB. ARJAL", oldName: "TAB. NO COLD", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 50, availableStock: 50, lowStockThreshold: 10 },
  { name: "TAB. PAINREX", oldName: "TAB. NG + PARA", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 108, availableStock: 108, lowStockThreshold: 15 },
  { name: "TAB. MARGO CARE", oldName: "TAB. NEEM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 60, availableStock: 60, lowStockThreshold: 10 },
  { name: "TAB. PAINTONE", oldName: "TAB. NG.", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 71, availableStock: 71, lowStockThreshold: 10 },
  { name: "TAB. OF CARE", oldName: "TAB. OFLAXIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 67, availableStock: 67, lowStockThreshold: 10 },
  { name: "CAP. PEPTINLIN", oldName: "CAP. OMEZ", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 280, availableStock: 238, lowStockThreshold: 25 },
  { name: "TAB. PIG CARE", oldName: "TAB. PIGMENTO", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 125, availableStock: 125, lowStockThreshold: 15 },
  { name: "TAB. DEMP CARE", oldName: "TAB. PS", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 793, availableStock: 763, lowStockThreshold: 30 },
  { name: "TAB. GASTRO CARE", oldName: "TAB. RAB D", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 148, availableStock: 148, lowStockThreshold: 20 },
  { name: "CAP. RG SKIN", oldName: "CAP. RGM.", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 674, availableStock: 674, lowStockThreshold: 30 },
  { name: "TAB. CAL CAL", oldName: "TAB. RC", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 1725, availableStock: 1725, lowStockThreshold: 50 },
  { name: "TAB. GAS PAIN", oldName: "TAB. SP + PARA", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 114, availableStock: 114, lowStockThreshold: 15 },
  { name: "TAB. S-TOLIN CARE", oldName: "TAB. SETRA", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 14, availableStock: 14, lowStockThreshold: 5 },
  { name: "CAP. S-MONTH CARE", oldName: "CAP. S. MANTHRA.", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 256, availableStock: 234, lowStockThreshold: 25 },
  { name: "TAB. HERBO COUGH", oldName: "TAB. SL", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 342, availableStock: 329, lowStockThreshold: 30 },
  { name: "TAB. SET CARE", oldName: "TAB. SITAGLIPTIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 194, availableStock: 165, lowStockThreshold: 20 },
  { name: "CAP. MEHAVIT", oldName: "CAP. SPERMRICH", type: "Capsule", unit: "Capsule", unitMeasurement: "mg", totalStock: 104, availableStock: 97, lowStockThreshold: 15 },
  { name: "TAB. TRIP CARE", oldName: "TAB. TRIPEC", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 62, availableStock: 62, lowStockThreshold: 10 },
  { name: "CAP. TC SHINE", oldName: "CAP. TC500", type: "Capsule", unit: "Capsule", unitMeasurement: "500mg", totalStock: 266, availableStock: 215, lowStockThreshold: 20 },
  { name: "TAB. TEM CARE", oldName: "TAB. TEMER.", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 86, availableStock: 86, lowStockThreshold: 10 },

  // Page 5
  { name: "TAB. NEUROTEG 100", oldName: "TAB. TEGRITAL 100MG", type: "Tablet", unit: "Tablet", unitMeasurement: "100mg", totalStock: 78, availableStock: 63, lowStockThreshold: 10 },
  { name: "TAB. NEUROTEG 200", oldName: "TAB. TEGRITAL 200MG", type: "Tablet", unit: "Tablet", unitMeasurement: "200mg", totalStock: 243, availableStock: 243, lowStockThreshold: 25 },
  { name: "TAB. TEF CARE", oldName: "TAB. TEXIFEN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 161, availableStock: 161, lowStockThreshold: 20 },
  { name: "TAB. VM CONTROL", oldName: "TAB. VOGLIMENT", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 178, availableStock: 148, lowStockThreshold: 20 },
  { name: "TAB. VALARIN", oldName: "TAB. VALANEXT 1000", type: "Tablet", unit: "Tablet", unitMeasurement: "1000", totalStock: 26, availableStock: 26, lowStockThreshold: 5 },
  { name: "TAB. NOGRAIN", oldName: "TAB. ZEROGRAIN", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 108, availableStock: 108, lowStockThreshold: 15 },
  { name: "TAB. RELAX", oldName: "TAB. ZOLPIDAM", type: "Tablet", unit: "Tablet", unitMeasurement: "mg", totalStock: 119, availableStock: 98, lowStockThreshold: 15 },
  { name: "SURARI POWDER", oldName: "SURARI POWDER.", type: "Powder", unit: "Bottle", unitMeasurement: "g", totalStock: 53, availableStock: 53, lowStockThreshold: 10 },
  { name: "SY. HEARTY TONE", oldName: "SY. HEARTY TONE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 7, availableStock: 7, lowStockThreshold: 2 },
  { name: "SY. ALFA ALFA", oldName: "SY. ALFA ALFA", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 1, lowStockThreshold: 2 },
  { name: "SY. FREELUX", oldName: "SY. FREELUX", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. BIOPROM", oldName: "SY. BIOPROM", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 1, availableStock: 1, lowStockThreshold: 2 },
  { name: "SY. ALKAZIP", oldName: "SY. ALKAZIP", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "SY. MINOLAST LC", oldName: "SY. MINOLAST LC", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. OF + MRD", oldName: "SY. OF + MRD.", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 3, lowStockThreshold: 2 },
  { name: "SY. ALBENDOL", oldName: "SY. ALBENDOL", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. AMOXY CLOVE", oldName: "SY. AMOXY CLOVE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 3, availableStock: 3, lowStockThreshold: 2 },
  { name: "SY. AZITHRO", oldName: "SY. AZITHRO", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 6, availableStock: 6, lowStockThreshold: 2 },
  { name: "SY. NO COLD", oldName: "SY. NO COLD", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. COTRIMOXAZOLE", oldName: "SY. COTRIMOXAZOLE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. CETRI", oldName: "SY. CETRI", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 5, availableStock: 4, lowStockThreshold: 2 },
  { name: "SY. MRD", oldName: "SY. MRD", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SY. PARACIP", oldName: "SY. PARACIP", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "SY. BETAMETHASONE", oldName: "SY. BETAMETHASONE", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 1, availableStock: 1, lowStockThreshold: 2 },

  // Page 6
  { name: "SY. COMIFLAM", oldName: "SY. COMIFLAM", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 1, availableStock: 1, lowStockThreshold: 2 },
  { name: "SY. SWASAMIRTHAM", oldName: "SY. SWASAMIRTHAM", type: "Syrup", unit: "Syrup", unitMeasurement: "ml", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "PROTIN POWDER", oldName: "PROTIN POWDER", type: "Powder", unit: "Jar", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "TV SHAMPOO", oldName: "TV SHAMPOO", type: "Shampoo", unit: "Bottle", unitMeasurement: "ml", totalStock: 12, availableStock: 12, lowStockThreshold: 3 },
  { name: "TRICHUP SHAMPOO", oldName: "TRICHUP SHAMPOO", type: "Shampoo", unit: "Bottle", unitMeasurement: "ml", totalStock: 5, availableStock: 4, lowStockThreshold: 2 },
  { name: "TRICHUP OIL", oldName: "TRICHUP OIL", type: "Oil", unit: "Bottle", unitMeasurement: "ml", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "SC LOTION", oldName: "SC LOTION", type: "Ointment", unit: "Bottle", unitMeasurement: "ml", totalStock: 8, availableStock: 7, lowStockThreshold: 2 },
  { name: "BETASOLIC LOTION", oldName: "BETASOLIC LOTION", type: "Ointment", unit: "Bottle", unitMeasurement: "ml", totalStock: 10, availableStock: 10, lowStockThreshold: 2 },
  { name: "HAIRRICH OIL", oldName: "HAIRRICH OIL", type: "Oil", unit: "Bottle", unitMeasurement: "ml", totalStock: 2, availableStock: 1, lowStockThreshold: 2 },
  { name: "KHAZNA OILMENT", oldName: "CASTER NF OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 15, availableStock: 13.5, lowStockThreshold: 3 },
  { name: "KT 5 DERM OILMENT", oldName: "KT 5 DERM OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 29, availableStock: 29, lowStockThreshold: 5 },
  { name: "BETASOLIC OILMENT", oldName: "BATASOLIC OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 22, availableStock: 15, lowStockThreshold: 3 },
  { name: "ROPAN OILMENT", oldName: "POVIDENT OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 10, availableStock: 10, lowStockThreshold: 3 },
  { name: "CLINSOL OILMENT", oldName: "CLINSOL OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 21, availableStock: 20, lowStockThreshold: 3 },
  { name: "PIGMAX OILMENT", oldName: "PIGMIN OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 17, availableStock: 16.5, lowStockThreshold: 3 },
  { name: "IOSTER OILMENT", oldName: "IOSTER OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "T-BACT OILMENT", oldName: "T-BACT OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 5, availableStock: 5, lowStockThreshold: 2 },
  { name: "SINDHRATHI LEPAM", oldName: "SINDHRATHI LEPAM", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "LEUCODNA OILMENT", oldName: "LEUCODNA OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 2, availableStock: 2, lowStockThreshold: 2 },
  { name: "GLOWIN OILMENT", oldName: "HT CREAM", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 22.5, availableStock: 22.5, lowStockThreshold: 3 },
  { name: "SCABIC OILMENT", oldName: "SCRABIC OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 9.5, availableStock: 9.5, lowStockThreshold: 2 },
  { name: "PILES OILMENT", oldName: "PILES OILMENT", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 15, availableStock: 14, lowStockThreshold: 3 },
  { name: "DEWARTS CREAM", oldName: "DEWARTS CREAM", type: "Ointment", unit: "Tube", unitMeasurement: "g", totalStock: 6, availableStock: 6, lowStockThreshold: 2 },
  { name: "KETO SOAP", oldName: "KETO SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 7, availableStock: 7, lowStockThreshold: 2 },
  { name: "CLINSOL SOAP", oldName: "CLINSOL SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 4, availableStock: 4, lowStockThreshold: 2 },
  { name: "SK 19 SOAP", oldName: "SK 19 SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 8, availableStock: 8, lowStockThreshold: 2 },
  { name: "SCABIC SOAP", oldName: "SCRABIC SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 5, availableStock: 3, lowStockThreshold: 2 },
  { name: "HT SOAP", oldName: "HT SOAP", type: "Soap", unit: "Bar", unitMeasurement: "g", totalStock: 6, availableStock: 6, lowStockThreshold: 2 },
  { name: "CBC + MAYAM", oldName: "CBC + MAYAM", type: "Powder", unit: "Jar", unitMeasurement: "g", totalStock: 3, availableStock: 3, lowStockThreshold: 2 }
];

// Quick lookup maps
export const NEW_TO_OLD_NAME_MAP: Record<string, string> = {};
export const OLD_TO_NEW_NAME_MAP: Record<string, string> = {};

MEDICINES_CATALOG.forEach((item) => {
  if (item.name) {
    NEW_TO_OLD_NAME_MAP[item.name] = item.oldName;
    NEW_TO_OLD_NAME_MAP[item.name.toLowerCase()] = item.oldName;
  }
  if (item.oldName) {
    OLD_TO_NEW_NAME_MAP[item.oldName] = item.name;
    OLD_TO_NEW_NAME_MAP[item.oldName.toLowerCase()] = item.name;
  }
});

/**
 * Strips dosage prefixes (TAB., CAP., SY., INJ., etc.) to obtain the clean medicine root name
 * E.g. "TAB. KHAZNA CARE" -> "KHAZNA CARE"
 * E.g. "CAP. ACTION TONE" -> "ACTION TONE"
 * E.g. "SY. ALFA ALFA" -> "ALFA ALFA"
 */
export function getCleanMedicineName(name: string): string {
  if (!name) return "";
  return name.replace(/^(TAB\.|TAB|CAP\.|CAP|SY\.|SY|INJ\.|INJ|OINT\.|OINT)\s+/i, "").trim();
}

export interface AutocompleteOption {
  label: string;
  value: string;
  availableStock?: number;
  oldName?: string;
  subLabel?: string;
}

/**
 * Intelligent Multi-Tier Ranking & Alphabetical Sorting Algorithm:
 * 
 * When query is empty:
 * - Sorts all medicines strictly alphabetically by their core medicine name (A -> Z).
 * 
 * When query is provided (e.g. "a" or "act" or "rest"):
 * - Rank 1: Core medicine name starts with query (e.g. "a" -> "Action Tone", "Atralipid", "Acicid", "Ayotic" at the top).
 * - Rank 2: Full label starts with query (e.g. user explicitly typed "tab." or "cap.").
 * - Rank 3: Old medicine name starts with query (e.g. "alegra" -> suggests "TAB. KHAZNA CARE").
 * - Rank 4: Any individual word in the core name begins with query (e.g. "care", "mode", "tone").
 * - Rank 5: Any individual word in the old name begins with query.
 * - Rank 6: Substring match in core name or full label.
 * - Rank 7: Substring match in old name.
 * 
 * Within every rank, items are sorted alphabetically by clean medicine name.
 */
export function filterAndRankMedicines(
  query: string,
  options: AutocompleteOption[]
): AutocompleteOption[] {
  const valid = Array.isArray(options)
    ? options.filter((o) => o && typeof o.label === "string" && typeof o.value === "string")
    : [];

  const q = (query || "").trim().toLowerCase();

  // If no query, return strictly sorted alphabetically by clean medicine name
  if (!q) {
    return [...valid].sort((a, b) => {
      const cleanA = getCleanMedicineName(a.label);
      const cleanB = getCleanMedicineName(b.label);
      const comp = cleanA.localeCompare(cleanB, undefined, { sensitivity: "base" });
      if (comp !== 0) return comp;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    });
  }

  // Pre-calculate clean names and old names
  const scoredItems: { item: AutocompleteOption; rank: number; cleanName: string }[] = [];

  for (const item of valid) {
    const full = item.label.toLowerCase();
    const clean = getCleanMedicineName(item.label).toLowerCase();
    const old = (item.oldName || NEW_TO_OLD_NAME_MAP[item.label] || NEW_TO_OLD_NAME_MAP[full] || "").toLowerCase();
    const cleanOld = getCleanMedicineName(old).toLowerCase();

    // Check words
    const cleanWords = clean.split(/\s+/);
    const fullWords = full.split(/\s+/);
    const oldWords = cleanOld ? cleanOld.split(/\s+/) : [];

    let rank = 999;

    if (clean.startsWith(q)) {
      // Priority 1: Core medicine name starts with query (e.g. typing "a" matches "Action Tone", "Atralipid", etc.)
      rank = 1;
    } else if (full.startsWith(q)) {
      // Priority 2: User explicitly typed the prefix e.g. "tab" or "cap"
      rank = 2;
    } else if (cleanOld.startsWith(q) || old.startsWith(q)) {
      // Priority 3: Old name starts with query (e.g. doctor typed "alegra" or "dolo")
      rank = 3;
    } else if (cleanWords.some((w) => w.startsWith(q)) || fullWords.some((w) => w.startsWith(q))) {
      // Priority 4: Word boundary in new name starts with query (e.g. "care" matches "Khazna Care", "mode" matches "Rest Mode")
      rank = 4;
    } else if (oldWords.some((w) => w.startsWith(q))) {
      // Priority 5: Word boundary in old name starts with query
      rank = 5;
    } else if (clean.includes(q) || full.includes(q)) {
      // Priority 6: Substring in new name
      rank = 6;
    } else if (old.includes(q)) {
      // Priority 7: Substring in old name
      rank = 7;
    }

    if (rank < 999) {
      scoredItems.push({
        item,
        rank,
        cleanName: clean,
      });
    }
  }

  // Sort by Rank asc, then alphabetically by clean medicine name asc
  scoredItems.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    const comp = a.cleanName.localeCompare(b.cleanName, undefined, { sensitivity: "base" });
    if (comp !== 0) return comp;
    return a.item.label.localeCompare(b.item.label, undefined, { sensitivity: "base" });
  });

  return scoredItems.map((s) => s.item);
}
