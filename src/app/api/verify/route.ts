import { getStripe } from "@/lib/stripe";

// Vérifie auprès de Stripe qu'une session de paiement a bien été payée.
// Aucune donnée personnelle n'est envoyée ici : seulement l'identifiant de session.
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return Response.json({ paid: false });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return Response.json({ paid: session.payment_status === "paid" });
  } catch {
    return Response.json({ paid: false });
  }
}
