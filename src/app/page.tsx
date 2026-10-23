"use client";

import Link from "next/link";

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

// Couleurs des pastilles d'abonnement
const AVATAR_COLORS = ["bg-violet-600", "bg-cyan-600", "bg-fuchsia-600", "bg-indigo-600", "bg-teal-600"];

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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* En-tête */}
      <header className="bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-serif text-xl font-bold">Fantômes</span>
          <span className="text-xs text-violet-200">par AutoFlow Academy</span>
        </div>
      </header>

      {/* Accroche */}
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-4 pb-24 pt-12 text-center text-white">
        <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
          Débusquez les abonnements que vous payez sans les utiliser
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-violet-200">
          Importez votre relevé bancaire : en quelques secondes, vous voyez combien vos abonnements oubliés vous
          coûtent chaque année.
        </p>
        <a
          href="#analyse"
          className="mt-8 inline-block rounded-full bg-cyan-300 px-6 py-3 font-semibold text-indigo-950 shadow-[0_0_30px_rgba(103,232,249,0.45)] hover:bg-cyan-200"
        >
          Analyser mon relevé
        </a>
      </section>

      {/* Comment ça marche */}
      <section className="-mt-14 px-4">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Importez votre relevé", d: "Un fichier CSV de votre banque. Il est analysé puis effacé, jamais conservé." },
            { n: "2", t: "Voyez le total", d: "Le nombre d'abonnements et leur coût annuel cumulé, gratuitement." },
            { n: "3", t: "Préparez vos résiliations", d: "Débloquez le détail et générez une lettre de résiliation prête à envoyer." },
          ].map((step, i) => (
            <div key={step.n} className="rounded-2xl bg-white p-6 shadow-md">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                  ["bg-violet-600", "bg-cyan-600", "bg-fuchsia-600"][i]
                }`}
              >
                {step.n}
              </div>
              <h2 className="mt-4 font-semibold text-slate-900">{step.t}</h2>
              <p className="mt-1 text-sm text-slate-600">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analyse */}
      <section id="analyse" className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        {/* Étape 1 : import */}
        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              1
            </span>
            Importez votre relevé CSV
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Le fichier est envoyé à notre serveur pour être analysé, puis n&apos;est ni enregistré ni conservé.
          </p>

          <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-8 text-center transition hover:border-violet-500 hover:bg-violet-100">
            <span className="block text-base font-semibold text-violet-800">Choisir mon fichier CSV</span>
            <span className="mt-1 block text-sm text-slate-500">Cliquez ici pour sélectionner votre relevé</span>
            <input type="file" accept=".csv" onChange={handleFile} className="sr-only" />
          </label>

          {loading && <p className="mt-4 text-sm font-medium text-violet-700">Analyse en cours…</p>}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}
        </div>

        {/* Étape 2 : résultats */}
        {summary && (
          <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white">
                2
              </span>
              Vos abonnements
            </h2>

            {/* Coordonnées pour la lettre */}
            <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-700">
                Pour générer les lettres, indiquez vos coordonnées (non enregistrées) :
              </p>
              <label className="text-sm">
                <span className="font-medium text-slate-700">Votre nom et prénom</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
                />
              </label>
              <label className="text-sm">
                <span className="font-medium text-slate-700">Votre adresse</span>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Numéro, rue, code postal, ville"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
                />
                {customerAddress.trim() && !addressLooksComplete(customerAddress) && (
                  <span className="mt-1 block text-xs text-amber-700">
                    Ajoutez le code postal et la ville (ex. 69008 Lyon) pour une lettre complète.
                  </span>
                )}
              </label>
              <label className="text-sm">
                <span className="font-medium text-slate-700">Numéro de client (facultatif)</span>
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="Indiqué dans votre espace client ou sur vos factures"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
                />
              </label>
            </div>

            {summary.count === 0 ? (
              <p className="mt-6 rounded-xl bg-violet-50 p-5 text-violet-800">
                Aucun abonnement à résilier détecté sur cette période.
              </p>
            ) : !unlocked ? (
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-700 p-6 text-white shadow-lg">
                <p className="text-lg">
                  <span className="text-2xl font-bold">{summary.count}</span> abonnement(s) à résilier détecté(s)
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.total.toFixed(2)} € <span className="text-lg font-medium">par an</span>
                </p>
                <p className="mt-3 text-sm text-violet-100">
                  Pour voir le détail de chaque abonnement et générer les lettres de résiliation, débloquez l&apos;analyse
                  complète.
                </p>
                <button
                  onClick={startCheckout}
                  disabled={paying}
                  className="mt-5 rounded-full bg-white px-6 py-3 font-semibold text-violet-800 shadow hover:bg-violet-50 disabled:opacity-60"
                >
                  {paying ? "Redirection…" : "Voir le détail — 19 €"}
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-6 space-y-3">
                  {cancellable.map((s, index) => {
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
                      <li key={s.label} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                                AVATAR_COLORS[index % AVATAR_COLORS.length]
                              }`}
                            >
                              {name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{name}</p>
                              <p className="text-sm text-slate-500">
                                {s.averageAmount.toFixed(2)} € par {s.periodicity === "mensuel" ? "mois" : "an"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-800">
                              {s.annualCost.toFixed(2)} € / an
                            </span>
                            <button
                              onClick={() => setOpenLetter(isOpen ? null : s.label)}
                              className="rounded-full border border-violet-300 px-4 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
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
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm"
                            />
                            <button
                              onClick={() => copyLetter(letter)}
                              className="mt-2 rounded-full bg-violet-700 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-800"
                            >
                              {copied ? "Copié !" : "Copier la lettre"}
                            </button>
                            <p className="mt-2 text-xs text-slate-500">
                              Beaucoup de services proposent désormais la résiliation directement dans leur espace
                              client : vérifiez-le avant d&apos;envoyer une lettre.
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-700 p-5 text-white">
                  <span className="font-medium">Total à résilier</span>
                  <span className="text-2xl font-bold">{summary.total.toFixed(2)} € / an</span>
                </div>
              </>
            )}

            {unlocked && transport.length > 0 && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">À garder (transport)</p>
                {transport.map((s) => (
                  <p key={s.label} className="mt-1 text-sm text-amber-900">
                    {DISPLAY_NAMES[s.label] ?? s.label} : {s.averageAmount.toFixed(2)} € par mois. La résiliation se
                    fait auprès du transporteur, pas par lettre.
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pied de page */}
      <footer className="bg-slate-900 px-4 py-8 text-sm text-slate-300">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© 2026 AutoFlow Academy · Fantômes</p>
          <nav className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-white">CGV</Link>
            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
