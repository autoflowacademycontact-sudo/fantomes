import Stripe from "stripe";

// Clé secrète lue depuis les variables d'environnement (.env.local en local, Vercel en ligne).
// Ne jamais l'écrire dans le code.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(key);
}
