import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../context/ToastContext";

import { ConfirmProvider } from "../context/ConfirmContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: 'Ethical Data - Plateforme de Formation & Certification Tech',
    template: '%s | Ethical Data Security',
  },
  description: 'Préparez vos certifications Microsoft Azure, AWS, Data, IA et Cybersécurité avec des tests blancs, une correction assistée par IA et du coaching individuel.',
  keywords: ['Certification Microsoft', 'Azure AZ-104', 'Examen blanc IA', 'Coaching IT', 'Ethical Data', 'Cybersécurité', 'Data AI'],
  icons: {
    icon: [
      { url: '/favicon_ethical_data.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon_ethical_data.png', type: 'image/png', sizes: '64x64' },
      { url: '/favicon_ethical_data.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon_ethical_data.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon_ethical_data.png',
  },
  authors: [{ name: 'Ethical Data Security' }],
  openGraph: {
    title: 'Ethical Data - Formation & Certification Cloud, IA et Sécurité',
    description: 'Préparez et réussissez vos examens de certification officielle grâce à nos simulations et notre correction intelligente par IA.',
    url: 'https://ethicaldatasecurity.ma',
    siteName: 'Ethical Data',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethical Data - Formation & Certification Cloud, IA et Sécurité',
    description: 'Préparez et réussissez vos examens de certification officielle grâce à nos simulations et notre correction intelligente par IA.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} font-sans h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}