import Link from "next/link";

export const metadata = {
  title: "Conditions générales de vente — Fantômes",
};

export default function Cgv() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-gray-800">
      <Link href="/" className="text-sm text-blue-800 hover:underline">
        ← Retour à Fantômes
      </Link>

      <h1 className="mt-6 font-serif text-3xl font-bold text-blue-800">Conditions générales de vente</h1>
      <p className="mt-2 text-sm text-gray-500">Version en vigueur au 23 octobre 2026.</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">1. Éditeur et objet</h2>
        <p>
          Les présentes conditions régissent les ventes du service Fantômes, édité par Mégane M&apos;Sallek,
          entrepreneur individuel (SIRET 899 953 756 00066). Fantômes permet d&apos;analyser un relevé bancaire au format
          CSV afin d&apos;identifier des abonnements récurrents, d&apos;en estimer le coût annuel et de générer des lettres
          de résiliation à compléter et envoyer par l&apos;utilisateur.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">2. Services et prix</h2>
        <p>
          L&apos;affichage du nombre d&apos;abonnements détectés et de leur coût annuel total est gratuit. L&apos;accès au
          détail de chaque abonnement et à la génération des lettres de résiliation est proposé en paiement unique
          de <strong>19,00 € TTC</strong>. Il n&apos;existe aucun abonnement récurrent.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">3. Commande et paiement</h2>
        <p>
          Le paiement est effectué par carte bancaire via la plateforme sécurisée Stripe. La commande est validée
          une fois le paiement accepté. Un reçu est envoyé par Stripe à l&apos;adresse e-mail renseignée.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">4. Accès au service</h2>
        <p>
          L&apos;accès au détail est activé immédiatement après paiement, dans le navigateur utilisé pour payer. Le
          code d&apos;accès est délivré une seule fois pour chaque paiement et n&apos;est conservé que dans ce navigateur.
          Si vous effacez les données de navigation de ce navigateur ou changez d&apos;appareil, l&apos;accès ne peut pas
          être restauré sans un nouveau paiement. Le relevé bancaire n&apos;est ni enregistré ni conservé par Fantômes :
          il doit être réimporté à chaque analyse.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">5. Droit de rétractation</h2>
        <p>
          Le service étant un contenu numérique fourni immédiatement après paiement, le droit de rétractation de
          14 jours ne s&apos;applique qu&apos;avec votre accord exprès. En validant votre commande, vous demandez
          l&apos;exécution immédiate du service et reconnaissez qu&apos;une fois le service pleinement exécuté, vous ne
          bénéficierez plus de ce droit.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">6. Remboursement</h2>
        <p>
          Si l&apos;accès au détail ne fonctionne pas après un paiement réussi, contactez-nous à l&apos;adresse
          autoflowacademy.contact@gmail.com dans les 14 jours : nous rétablirons l&apos;accès ou procéderons à un remboursement intégral.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">7. Limites du service</h2>
        <p>
          La détection repose sur les libellés de votre relevé et peut comporter des erreurs (abonnement manqué,
          dépense à tort identifiée comme un abonnement). Vérifiez chaque résultat avant d&apos;agir. Les lettres sont
          des modèles : elles ne constituent pas un conseil juridique. Fantômes ne garantit pas l&apos;issue d&apos;une
          résiliation, qui dépend du prestataire concerné. Certains services proposent la résiliation directement
          dans leur espace client : vérifiez-le avant d&apos;envoyer une lettre.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">8. Responsabilité</h2>
        <p>
          La responsabilité de l&apos;éditeur est limitée au montant payé par le client pour la commande concernée.
          L&apos;éditeur n&apos;est pas responsable des dommages indirects, notamment pertes financières liées à une
          résiliation tardive ou à un abonnement non détecté.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">9. Données personnelles</h2>
        <p>
          Le traitement des données est décrit dans la{" "}
          <Link href="/confidentialite" className="text-blue-800 hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">10. Médiation et droit applicable</h2>
        <p>
          En cas de litige, le client peut recourir gratuitement au médiateur de la consommation indiqué dans les
          mentions légales. À défaut d&apos;accord amiable, les présentes conditions sont soumises au droit français et
          relèvent de la compétence des tribunaux français.
        </p>
      </section>
    </main>
  );
}
