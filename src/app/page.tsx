"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Subscription } from "@/lib/detect";
import { addressLooksComplete, buildCancellationLetter } from "@/lib/letters";

// Accès au détail (identifiant de session + jeton), gardé dans ce navigateur uniquement
const PAYMENT_STORAGE_KEY = "fantomes_access";

// Noms affichés pour les libellés détectés (clé = libellé normalisé en majuscules)
const DISPLAY_NAMES: Record<string, string> = {
  PROTONVPN: "ProtonVPN",
  YOUTUBE: "YouTube",
  "AMAZON PRIME": "Amazon Prime",
  SPL: "TCL (transports en commun)",
};

// Abonnements qui ne se résilient pas par lettre : on les affiche à part
const TRANSPORT_LABELS = ["SPL"];

type Summary = { count: number; total: number };

type AnalyzeResponse = {
  paid: boolean;
  count: number;
  total: number;
  subscriptions?: Subscription[]; // présent seulement si le paiement est vérifié
  error?: string;
};

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  // Détail des abonnements : rempli seulement après paiement vérifié par le serveur
  const [details, setDetails] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [openLetter, setOpenLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);

  const unlocked = details !== null;
  const transport = details?.filter((s) => TRANSPORT_LABELS.includes(s.label)) ?? [];
  const cancellable = details?.filter((s) => !TRANSPORT_LABELS.includes(s.label)) ?? [];

  // Au retour de Stripe : le serveur attribue un jeton, une seule fois par paiement
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromStripe = url.searchParams.get("session_id");
    if (!fromStripe) return;
    window.history.replaceState({}, "", url.pathname);

    fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: fromStripe }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          setError(data.error ?? "Ce paiement est invalide ou a déjà été utilisé.");
          return;
        }
        try {
          localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify({ sessionId: fromStripe, token: data.token }));
        } catch {
          setError("Votre navigateur bloque le stockage : le détail ne pourra pas s'afficher.");
        }
      })
      .catch(() => setError("Impossible de valider le paiement. Réessayez."));
  }, []);

  async function startCheckout() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Paiement indisponible.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Paiement indisponible.");
      setPaying(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setOpenLetter(null);
    setSummary(null);
    setDetails(null);
    setLoading(true);
    try {
      const csv = await file.text();
      let sessionId = "";
      let token = "";
      try {
        const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { sessionId?: string; token?: string };
          sessionId = parsed.sessionId ?? "";
          token = parsed.token ?? "";
        }
      } catch {
        // accès illisible : le détail restera masqué
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, sessionId, token }),
      });
      const data = (await res.json()) as AnalyzeResponse;
      if (!res.ok) throw new Error(data.error ?? "Analyse impossible.");

      setSummary({ count: data.count, total: data.total });
      setDetails(data.paid ? (data.subscriptions ?? []) : null);
    } catch (e) {
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-blue-800">Fantômes</h1>
      <p className="mt-2 text-gray-600">
        Débusquez les abonnements que vous payez sans les utiliser.
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">1. Importez votre relevé CSV</h2>
        <p className="mt-1 text-sm text-gray-500">
          Le fichier est envoyé à notre serveur pour être analysé, puis n&apos;est ni enregistré ni conservé.
        </p>
        <input type="file" accept=".csv" onChange={handleFile} className="mt-4 block text-sm" />
        {loading && <p className="mt-4 text-sm text-gray-500">Analyse en cours…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      {summary && (
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
              {customerAddress.trim() && !addressLooksComplete(customerAddress) && (
                <span className="mt-1 block text-xs text-amber-700">
                  Ajoutez le code postal et la ville (ex. 69008 Lyon) pour une lettre complète.
                </span>
              )}
            </label>
            <label className="text-sm">
              <span className="font-medium text-gray-700">Numéro de client (facultatif)</span>
              <input
                type="text"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                placeholder="Indiqué dans votre espace client ou sur vos factures"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <p className="text-xs text-gray-500">
              Ces informations servent uniquement à remplir la lettre. Elles ne sont pas enregistrées.
            </p>
          </div>

          {summary.count === 0 ? (
            <p className="mt-4 text-gray-600">Aucun abonnement à résilier détecté sur cette période.</p>
          ) : !unlocked ? (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="text-lg">
                <span className="font-bold">{summary.count}</span> abonnement(s) à résilier détecté(s) :
                environ <span className="font-bold text-green-700">{summary.total.toFixed(2)} € par an</span>.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Pour voir le détail de chaque abonnement et générer les lettres de résiliation, débloquez l&apos;analyse complète.
              </p>
              <button
                onClick={startCheckout}
                disabled={paying}
                className="mt-4 rounded-lg bg-blue-800 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {paying ? "Redirection…" : "Voir le détail — 19 €"}
              </button>
            </div>
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
                    customerNumber: customerNumber.trim() || undefined,
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
                            client : vérifiez-le avant d&apos;envoyer une lettre.
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-6 border-t border-gray-100 pt-4 text-right text-lg">
                Total à résilier : <span className="font-bold text-green-700">{summary.total.toFixed(2)} € / an</span>
              </p>
            </>
          )}

          {unlocked && transport.length > 0 && (
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
