import { claimSession } from "@/lib/stripe";

// Attribue un jeton d'accès à la session payée, une seule fois.
export async function POST(request: Request) {
  let body: { sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const token = sessionId ? await claimSession(sessionId) : null;
  if (!token) {
    return Response.json({ error: "Ce paiement est invalide ou a déjà été utilisé." }, { status: 403 });
  }
  return Response.json({ token });
}
