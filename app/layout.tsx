import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const fontBenvi = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: "oikkkkkkkkkk",
  description: "Plataforma que conecta pessoas a profissionais confiáveis de forma rápida, simples e segura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${fontBenvi} h-full antialiased`}
    >
      <body>
        
        {children}
      </body>
    </html>
  );
}
