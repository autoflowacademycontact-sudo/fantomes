import { createHash, randomBytes } from "crypto";
import Stripe from "stripe";

// Montant attendu pour l'audit : 19,00 € (en centimes)
const EXPECTED_AMOUNT_CENTS = 1900;
// Clé de métadonnée du paiement qui contient l'empreinte du jeton d'accès
const CLAIM_KEY = "claim_hash";

// Clé secrète lue depuis les variables d'environnement (.env.local en local, Vercel en ligne).
// Ne jamais l'écrire dans le code.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(key);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Retrouve le paiement de la session, seulement s'il est payé, à 19 € et en euros
async function getValidPaymentIntent(sessionId: string): Promise<Stripe.PaymentIntent | null> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (
    session.payment_status !== "paid" ||
    session.amount_total !== EXPECTED_AMOUNT_CENTS ||
    session.currency !== "eur"
  ) {
    return null;
  }
  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!piId) return null;
  return stripe.paymentIntents.retrieve(piId);
}

// Première utilisation seulement : renvoie un jeton d'accès, ou null si la session est déjà attribuée
export async function claimSession(sessionId: string): Promise<string | null> {
  try {
    const pi = await getValidPaymentIntent(sessionId);
    if (!pi || pi.metadata[CLAIM_KEY]) return null;
    const token = randomBytes(32).toString("hex");
    await getStripe().paymentIntents.update(pi.id, {
      metadata: { ...pi.metadata, [CLAIM_KEY]: hashToken(token) },
    });
    return token;
  } catch {
    return null;
  }
}

// Vrai seulement si le jeton correspond à la session attribuée
export async function isTokenValid(sessionId: string, token: string): Promise<boolean> {
  try {
    const pi = await getValidPaymentIntent(sessionId);
    const stored = pi?.metadata[CLAIM_KEY];
    return Boolean(stored) && stored === hashToken(token);
  } catch {
    return false;
  }
}
