import { MEDICINES_CATALOG, filterAndRankMedicines, getCleanMedicineName } from '../lib/medicines-catalog';

console.log(`Total medicines in catalog: ${MEDICINES_CATALOG.length}`);

// Convert catalog to Autocomplete options format
const options = MEDICINES_CATALOG.map((m) => ({
  label: m.name,
  value: m.name,
  availableStock: m.availableStock,
  oldName: m.oldName,
}));

console.log("\n--- TEST 1: Default Empty Query (Pure Alphabetical by Clean Name) ---");
const defaultSorted = filterAndRankMedicines("", options);
console.log("Top 15 medicines when dropdown opens (no search query):");
defaultSorted.slice(0, 15).forEach((item, i) => {
  console.log(`  ${i + 1}. [${getCleanMedicineName(item.label)}] -> ${item.label} (Old: ${item.oldName})`);
});

console.log("\n--- TEST 2: Typing 'a' (Should prioritize drugs starting with 'A') ---");
const aResults = filterAndRankMedicines("a", options);
console.log(`Total matches for 'a': ${aResults.length}`);
console.log("Top 15 matches for 'a':");
aResults.slice(0, 15).forEach((item, i) => {
  console.log(`  ${i + 1}. [${getCleanMedicineName(item.label)}] -> ${item.label} (Old: ${item.oldName})`);
});

// Check if any Betasolic is in top 10 for 'a'
const hasBetasolicInTop10 = aResults.slice(0, 10).some((item) => item.label.includes("BETASOLIC"));
console.log(`Betasolic in top 10 for 'a'? ${hasBetasolicInTop10 ? "FAIL (should not be in top 10)" : "PASS (correctly ranked lower!)"}`);

console.log("\n--- TEST 3: Typing Old Name 'alegra' ---");
const alegraResults = filterAndRankMedicines("alegra", options);
console.log("Results for 'alegra':");
alegraResults.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.label} (Old: ${item.oldName})`);
});

console.log("\n--- TEST 4: Typing Old Name 'dolo' ---");
const doloResults = filterAndRankMedicines("dolo", options);
console.log("Results for 'dolo':");
doloResults.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.label} (Old: ${item.oldName})`);
});

console.log("\n--- TEST 5: Typing 'mode' (Word match e.g. REST MODE) ---");
const modeResults = filterAndRankMedicines("mode", options);
console.log("Results for 'mode':");
modeResults.forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.label}`);
});
