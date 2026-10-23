import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantômes : débusquez vos abonnements oubliés",
  description:
    "Importez votre relevé bancaire et voyez combien vos abonnements inutilisés vous coûtent par an. Relevé supprimé après analyse.",
  openGraph: {
    title: "Fantômes : débusquez vos abonnements oubliés",
    description:
      "Importez votre relevé bancaire et découvrez combien vos abonnements oubliés vous coûtent chaque année. Le relevé est analysé puis supprimé, jamais conservé.",
    url: "https://fantomes-five-xi.vercel.app/",
    siteName: "Fantômes",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fantômes : débusquez vos abonnements oubliés",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
