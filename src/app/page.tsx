"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { parseCsv, detectSubscriptions, type Subscription } from "@/lib/detect";
import { buildCancellationLetter } from "@/lib/letters";

// Noms affichés pour les libellés détectés (clé = libellé normalisé en majuscules)
const DISPLAY_NAMES: Record<string, string> = {
  PROTONVPN: "ProtonVPN",
  YOUTUBE: "YouTube",
  "AMAZON PRIME": "Amazon Prime",
  SPL: "TCL (transports en commun)",
};

// Abonnements qui ne se résilient pas par lettre : on les affiche à part
const TRANSPORT_LABELS = ["SPL"];

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [openLetter, setOpenLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setOpenLetter(null);
    setLoading(true);
    try {
      const text = await file.text();
      const transactions = parseCsv(text);
      setSubscriptions(detectSubscriptions(transactions));
    } catch (e) {
      setSubscriptions(null);
      setError(e instanceof Error ? e.message : "Impossible de lire ce fichier.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLetter(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const transport = subscriptions?.filter((s) => TRANSPORT_LABELS.includes(s.label)) ?? [];
  const cancellable = subscriptions?.filter((s) => !TRANSPORT_LABELS.includes(s.label)) ?? [];
  const total = cancellable.reduce((sum, s) => sum + s.annualCost, 0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-blue-800">Fantômes</h1>
      <p className="mt-2 text-gray-600">
        Débusquez les abonnements que vous payez sans les utiliser.
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">1. Importez votre relevé CSV</h2>
        <p className="mt-1 text-sm text-gray-500">
          Le fichier est lu dans votre navigateur. Rien n'est envoyé ni stocké.
        </p>
        <input type="file" accept=".csv" onChange={handleFile} className="mt-4 block text-sm" />
        {loading && <p className="mt-4 text-sm text-gray-500">Lecture en cours…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      {subscriptions && (
        <section className="mt-8 rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">2. Abonnements détectés</h2>

          <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-4">
            <label className="text-sm">
              <span className="font-medium text-gray-700">Votre nom et prénom</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Prénom Nom"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-gray-700">Votre adresse</span>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Numéro, rue, code postal, ville"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <p className="text-xs text-gray-500">
              Ces informations servent uniquement à remplir la lettre. Elles ne sont pas enregistrées.
            </p>
          </div>

          {cancellable.length === 0 ? (
            <p className="mt-4 text-gray-600">Aucun abonnement à résilier détecté sur cette période.</p>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-gray-100">
                {cancellable.map((s) => {
                  const name = DISPLAY_NAMES[s.label] ?? s.label;
                  const isOpen = openLetter === s.label;
                  const letter = buildCancellationLetter({
                    provider: name,
                    amount: s.averageAmount,
                    periodicity: s.periodicity,
                    customerName: customerName.trim() || "[Votre nom et prénom]",
                    customerAddress: customerAddress.trim() || "[Votre adresse]",
                  });

                  return (
                    <li key={s.label} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-gray-500">
                            {s.averageAmount.toFixed(2)} € par {s.periodicity === "mensuel" ? "mois" : "an"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-green-700">{s.annualCost.toFixed(2)} € / an</p>
                          <button
                            onClick={() => setOpenLetter(isOpen ? null : s.label)}
                            className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                          >
                            {isOpen ? "Fermer" : "Générer la lettre"}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-4">
                          <textarea
                            readOnly
                            value={letter}
                            rows={14}
                            className="w-full rounded-lg border border-gray-200 p-3 font-mono text-sm"
                          />
                          <button
                            onClick={() => copyLetter(letter)}
                            className="mt-2 rounded-lg bg-blue-800 px-4 py-2 text-sm text-white"
                          >
                            {copied ? "Copié !" : "Copier la lettre"}
                          </button>
                          <p className="mt-2 text-xs text-gray-500">
                            Beaucoup de services proposent désormais la résiliation directement dans leur espace
                            client : vérifiez-le avant d'envoyer une lettre.
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-6 border-t border-gray-100 pt-4 text-right text-lg">
                Total à résilier : <span className="font-bold text-green-700">{total.toFixed(2)} € / an</span>
              </p>
            </>
          )}

          {transport.length > 0 && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">À garder (transport)</p>
              {transport.map((s) => (
                <p key={s.label} className="mt-1 text-sm text-gray-600">
                  {DISPLAY_NAMES[s.label] ?? s.label} : {s.averageAmount.toFixed(2)} € par mois.
                  La résiliation se fait auprès du transporteur, pas par lettre.
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}