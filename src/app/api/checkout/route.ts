import { getStripe } from "@/lib/stripe";

// Crée une session Stripe Checkout (paiement unique) et renvoie l'URL de paiement.
export async function POST(request: Request) {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return Response.json({ error: "Configuration de paiement manquante." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });
    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "Impossible de lancer le paiement pour le moment." }, { status: 500 });
  }
}
