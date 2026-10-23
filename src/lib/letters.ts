export type LetterInput = {
  provider: string;
  amount: number;
  periodicity: "mensuel" | "annuel";
  customerName: string;
  customerAddress: string;
  customerNumber?: string;
  today?: Date;
};

// Petits mots qui restent en minuscules au milieu d'une adresse ou d'un nom
const LOWERCASE_WORDS = new Set(["de", "des", "du", "d'", "la", "le", "les", "et", "en", "sur", "sous"]);

// Met en forme un nom ou une adresse saisis à la main : espaces nettoyés,
// majuscule au début de chaque mot. Ne corrige pas l'orthographe.
export function formatFreeText(value: string): string {
  const words = value.trim().replace(/\s+/g, " ").split(" ");
  return words
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word.toLowerCase())) return word.toLowerCase();
      return word
        .split(/([-'’])/)
        .map((part) => (/^[-'’]$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
        .join("");
    })
    .join(" ");
}

export function buildCancellationLetter(input: LetterInput): string {
  const date = (input.today ?? new Date()).toLocaleDateString("fr-FR");
  const amount = input.amount.toFixed(2).replace(".", ",");
  const frequency = input.periodicity === "mensuel" ? "par mois" : "par an";
  const customerLine = input.customerNumber ? `\nNuméro de client : ${input.customerNumber}` : "";
  const name = formatFreeText(input.customerName);
  const address = formatFreeText(input.customerAddress);

  return `${name}
${address}

Service client
${input.provider}

Fait le ${date}

Objet : demande de résiliation de mon abonnement${customerLine}

Madame, Monsieur,

Je souhaite résilier mon abonnement ${input.provider}, facturé ${amount} € ${frequency}.

Je vous demande de prendre en compte cette résiliation à la prochaine échéance possible, et de ne plus effectuer aucun prélèvement à compter de la date de fin de mon contrat.

Merci de me confirmer par écrit la date de fin de mon abonnement.

Cordialement,

${name}`;
}