import Link from "next/link";

export const metadata = {
  title: "Confidentialité — Fantômes",
};

export default function Confidentialite() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-gray-800">
      <Link href="/" className="text-sm text-blue-800 hover:underline">
        ← Retour à Fantômes
      </Link>

      <h1 className="mt-6 font-serif text-3xl font-bold text-blue-800">Politique de confidentialité</h1>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Responsable du traitement</h2>
        <p>
          Mégane M&apos;Sallek, entrepreneur individuel, adresse de contact : autoflowacademy.contact@gmail.com.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Votre relevé bancaire</h2>
        <p>
          Le fichier CSV que vous importez est envoyé à notre serveur uniquement pour être analysé. Il est traité en
          mémoire et n&apos;est ni enregistré, ni conservé, ni transmis à un tiers. Une fois l&apos;analyse terminée, il
          n&apos;existe plus sur nos serveurs.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Vos informations pour les lettres</h2>
        <p>
          Votre nom, votre adresse et votre numéro de client servent uniquement à remplir la lettre dans votre
          navigateur. Ils ne sont ni envoyés à notre serveur, ni enregistrés.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Paiement</h2>
        <p>
          Lors du paiement, Stripe traite vos données de carte et votre adresse e-mail. Fantômes reçoit de Stripe
          uniquement la confirmation du paiement. Nous conservons, côté Stripe, une empreinte chiffrée du code
          d&apos;accès pour vérifier qu&apos;il n&apos;a été utilisé qu&apos;une fois.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Stockage dans votre navigateur</h2>
        <p>
          Après paiement, un code d&apos;accès est stocké dans le stockage local de votre navigateur. Il ne contient
          aucune donnée bancaire et ne sert à aucun suivi publicitaire. Vous pouvez le supprimer à tout moment depuis
          les paramètres de votre navigateur.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc. (États-Unis), qui peut traiter des données techniques de connexion
          (adresse IP, journaux de requêtes) pour assurer le fonctionnement du service.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Vos droits</h2>
        <p>
          Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition prévus par le RGPD.
          Pour les exercer, écrivez à autoflowacademy.contact@gmail.com. Vous pouvez également saisir la CNIL (cnil.fr).
        </p>
      </section>
    </main>
  );
}
