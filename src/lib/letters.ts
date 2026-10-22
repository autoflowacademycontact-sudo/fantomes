export type LetterInput = {
  provider: string;
  amount: number;
  periodicity: "mensuel" | "annuel";
  customerName: string;
  customerAddress: string;
  customerNumber?: string;
  today?: Date;
};

export function buildCancellationLetter(input: LetterInput): string {
  const date = (input.today ?? new Date()).toLocaleDateString("fr-FR");
  const amount = input.amount.toFixed(2).replace(".", ",");
  const frequency = input.periodicity === "mensuel" ? "par mois" : "par an";
  const customerLine = input.customerNumber ? `\nNuméro de client : ${input.customerNumber}` : "";

  return `${input.customerName}
${input.customerAddress}

Service client
${input.provider}

Fait le ${date}

Objet : demande de résiliation de mon abonnement${customerLine}

Madame, Monsieur,

Je souhaite résilier mon abonnement ${input.provider}, facturé ${amount} € ${frequency}.

Je vous demande de prendre en compte cette résiliation à la prochaine échéance possible, et de ne plus effectuer aucun prélèvement à compter de la date de fin de mon contrat.

Merci de me confirmer par écrit la date de fin de mon abonnement.

Cordialement,

${input.customerName}`;
}