import { readFileSync } from "node:fs";
import { parseCsv, detectSubscriptions } from "../src/lib/detect";

const path = process.argv[2];
if (!path) {
  console.log('Usage : npx tsx scripts/test-detect.ts "C:\\chemin\\releve.csv"');
  process.exit(1);
}

const transactions = parseCsv(readFileSync(path, "utf-8"));
console.log(`${transactions.length} opérations lues`);

const subs = detectSubscriptions(transactions);
console.log(`${subs.length} abonnement(s) détecté(s) :\n`);
for (const s of subs) {
  console.log(`- ${s.label} | ${s.periodicity} | ${s.averageAmount} € | ${s.occurrences} fois | ${s.annualCost} €/an`);
}