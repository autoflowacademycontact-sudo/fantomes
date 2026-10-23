import Stripe from "stripe";

// Montant attendu pour l'audit : 19,00 € (en centimes)
const EXPECTED_AMOUNT_CENTS = 1900;

// Clé secrète lue depuis les variables d'environnement (.env.local en local, Vercel en ligne).
// Ne jamais l'écrire dans le code.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(key);
}

// Vrai seulement si la session a été payée pour le bon montant, en euros.
export async function isSessionPaid(sessionId: string): Promise<boolean> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return (
      session.payment_status === "paid" &&
      session.amount_total === EXPECTED_AMOUNT_CENTS &&
      session.currency === "eur"
    );
  } catch {
    return false;
  }
}
