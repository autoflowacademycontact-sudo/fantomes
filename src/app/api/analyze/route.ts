import { detectSubscriptions, parseCsv } from "@/lib/detect";
import { isSessionPaid } from "@/lib/stripe";

// Abonnements qui ne se résilient pas par lettre (transport)
const TRANSPORT_LABELS = ["SPL"];

// Taille maximale acceptée pour un relevé (2 Mo)
const MAX_CHARS = 2 * 1024 * 1024;

// Analyse le relevé sur le serveur, en mémoire, sans rien enregistrer.
// Sans paiement vérifié : seulement le nombre et le total.
// Avec paiement vérifié : en plus, le détail de chaque abonnement.
export async function POST(request: Request) {
  let body: { csv?: unknown; sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const csv = typeof body.csv === "string" ? body.csv : "";
  if (!csv) return Response.json({ error: "Fichier vide." }, { status: 400 });
  if (csv.length > MAX_CHARS) {
    return Response.json({ error: "Fichier trop volumineux." }, { status: 413 });
  }

  let subscriptions;
  try {
    subscriptions = detectSubscriptions(parseCsv(csv));
  } catch {
    return Response.json({ error: "Ce fichier n'est pas un relevé CSV lisible." }, { status: 400 });
  }

  const cancellable = subscriptions.filter((s) => !TRANSPORT_LABELS.includes(s.label));
  const total = Math.round(cancellable.reduce((sum, s) => sum + s.annualCost, 0) * 100) / 100;

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const paid = sessionId ? await isSessionPaid(sessionId) : false;

  return Response.json({
    paid,
    count: cancellable.length,
    total,
    ...(paid ? { subscriptions } : {}),
  });
}
