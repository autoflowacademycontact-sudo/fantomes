import Link from "next/link";

export const metadata = {
  title: "Mentions légales — Fantômes",
};

export default function MentionsLegales() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-gray-800">
      <Link href="/" className="text-sm text-blue-800 hover:underline">
        ← Retour à Fantômes
      </Link>

      <h1 className="mt-6 font-serif text-3xl font-bold text-blue-800">Mentions légales</h1>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Éditeur du site</h2>
        <p>
          Fantômes est édité par <strong>Mégane M&apos;Sallek</strong>, entrepreneur individuel (micro-entreprise) exploitée sous le nom commercial AutoFlow Academy,
          immatriculée au répertoire SIRENE sous le numéro SIRET 899 953 756 00066.
        </p>
        <p>
          Adresse de domiciliation : 47 galerie Vivienne, 75002 Paris.
        </p>
        <p>
          Contact : autoflowacademy.contact@gmail.com.
        </p>
        <p>
          Directrice de la publication : Mégane M&apos;Sallek.
        </p>
        <p>
          TVA non applicable, article 293 B du Code général des impôts.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Paiement</h2>
        <p>
          Les paiements sont traités par Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irlande.
          Fantômes ne voit ni ne conserve vos données de carte bancaire.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Médiation de la consommation</h2>
        <p>
          Conformément à l&apos;article L.612-1 du Code de la consommation, en cas de litige non résolu avec
          l&apos;éditeur, le consommateur peut recourir gratuitement à un médiateur de la consommation :
          CM2C (Centre de Médiation de la Consommation de Conciliateurs de Justice), 49 rue de Ponthieu, 75008 Paris, www.cm2c.net.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Propriété intellectuelle</h2>
        <p>
          Le nom Fantômes, le logo, les textes et le code du site sont la propriété de leur éditrice. Toute
          reproduction sans autorisation écrite est interdite.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Données personnelles</h2>
        <p>
          Le traitement de vos données est décrit sur cette page dédiée :{" "}
          <Link href="/confidentialite" className="text-blue-800 hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
