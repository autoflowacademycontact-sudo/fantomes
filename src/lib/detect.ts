export type Transaction = {
  date: Date;
  label: string;
  amount: number; // négatif = débit
};

export type Subscription = {
  label: string;
  averageAmount: number; // montant moyen, positif
  occurrences: number;
  periodicity: "mensuel" | "annuel";
  annualCost: number;
};

// Mots courants des libellés bancaires, ignorés pour regrouper les prélèvements
const STOP_WORDS = new Set([
  "PRLV", "SEPA", "CB", "CARTE", "PAIEMENT", "VIREMENT", "PRELEVEMENT", "ACHAT", "DU", "LE", "DE",
]);

// Mots-clés qui ne sont pas des abonnements (dettes, crédits, loyers...)
// Vous pouvez ajouter un nom ici, par exemple "VAUBRY"
export const EXCLUDED_KEYWORDS = ["INTRUM", "CREDIT", "PRET", "LOYER", "VAUBRY"];

export function parseAmount(raw: string): number {
  const cleaned = raw.trim().replace(/\s/g, "").replace("€", "").replace(",", ".");
  return Number(cleaned);
}

// Découpe une ligne CSV en respectant les champs entre guillemets
function splitCsvLine(line: string, sep: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === sep && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseDate(raw: string): Date | null {
  const s = raw.trim();
  // Accepte 01/10/2026 ou 2026-10-01, avec ou sans heure
  const fr = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (fr) return new Date(Number(fr[3]), Number(fr[2]) - 1, Number(fr[1]));
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return null;
}

export function parseCsv(text: string): Transaction[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = splitCsvLine(lines[0], sep).map((h) => h.toLowerCase());

  const dateIdx = headers.findIndex((h) => h.includes("date"));
  const labelIdx = headers.findIndex(
    (h) => h.includes("libell") || h.includes("description") || h.includes("label"),
  );
  const amountIdx = headers.findIndex((h) => h.includes("montant") || h.includes("amount"));
  const typeIdx = headers.findIndex((h) => h === "type");
  const stateIdx = headers.findIndex((h) => h.startsWith("état") || h.startsWith("etat"));

  if (dateIdx < 0 || labelIdx < 0 || amountIdx < 0) {
    throw new Error("Colonnes date, libellé ou montant introuvables dans le CSV");
  }

  const transactions: Transaction[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line, sep);

    const type = (cols[typeIdx] ?? "").toLowerCase();
    if (type.includes("virement")) continue; // virements entre vos propres comptes

    const state = (cols[stateIdx] ?? "").toUpperCase();
    if (state && !state.includes("TERMIN")) continue; // ignore les opérations en attente

    const date = parseDate(cols[dateIdx] ?? "");
    const amount = parseAmount(cols[amountIdx] ?? "");
    if (!date || Number.isNaN(amount)) continue;

    transactions.push({ date, label: cols[labelIdx] ?? "", amount });
  }
  return transactions;
}

// "PRLV SEPA NETFLIX 4829103 15/10" -> "NETFLIX"
export function normalizeLabel(label: string): string {
  const words = label
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return words.slice(0, 2).join(" ");
}

export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    if (t.amount >= 0) continue; // on ne garde que les débits
    const key = normalizeLabel(t.label);
    if (!key) continue;
    if (EXCLUDED_KEYWORDS.some((word) => key.includes(word))) continue;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }

  const result: Subscription[] = [];

  for (const [label, list] of groups) {
    if (list.length < 2) continue;

    list.sort((a, b) => a.date.getTime() - b.date.getTime());

    const amounts = list.map((t) => Math.abs(t.amount));
    const average = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;

    // Montant stable : aucun écart supérieur à 10 % de la moyenne
    const stableAmount = amounts.every((a) => Math.abs(a - average) <= average * 0.1);
    if (!stableAmount) continue;

    // Intervalle moyen entre deux prélèvements, en jours
    const gaps: number[] = [];
    for (let i = 1; i < list.length; i++) {
      gaps.push((list[i].date.getTime() - list[i - 1].date.getTime()) / 86_400_000);
    }
    const gapAverage = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;

    let periodicity: "mensuel" | "annuel";
    if (gapAverage >= 26 && gapAverage <= 35) periodicity = "mensuel";
    else if (gapAverage >= 355 && gapAverage <= 375) periodicity = "annuel";
    else continue;

    result.push({
      label,
      averageAmount: Math.round(average * 100) / 100,
      occurrences: list.length,
      periodicity,
      annualCost: Math.round((periodicity === "mensuel" ? average * 12 : average) * 100) / 100,
    });
  }

  return result.sort((a, b) => b.annualCost - a.annualCost);
}