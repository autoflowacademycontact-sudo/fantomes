export type LetterInput = {
  provider: string; // nom affiché, par exemple "ProtonVPN"
  amount: number; // montant moyen, en euros
  periodicity: "mensuel" | "annuel";
  customerName: string;
  customerAddress: string;
  today?: Date;
};

export function buildCancellationLetter(input: LetterInput): string {
  const date = (input.today ?? new Date()).toLocaleDateString("fr-FR");
  const amount = input.amount.toFixed(2).replace(".", ",");
  const periodicity = input.periodicity === "mensuel" ? "mensuel" : "annuel";

  return `${input.customerName}
${input.customerAddress}

${input.provider}
Service client / Résiliation

Fait le ${date}

Objet : demande de résiliation de mon abonnement ${input.provider}

Madame, Monsieur,

Je vous demande de résilier mon abonnement ${input.provider}, facturé ${amount} € ${periodicity}, à la prochaine échéance possible.

Merci de me confirmer par écrit la prise en compte de cette résiliation, ainsi que l'absence de tout prélèvement après la date d'effet.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${input.customerName}`;
}