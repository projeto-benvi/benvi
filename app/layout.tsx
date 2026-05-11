import { Inter } from "next/font/google";
import "./globals.css";
import { metadata } from "./metadata"; // Importando do arquivo que você criou
import ClientLayout from "./ClientLayout"; 

const fontBenvi = Inter({ subsets: ["latin"] });

// Exportamos os metadados para o Next.js (SEO)
export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="h-full antialiased">
    
      <body className={`${fontBenvi.className} h-full`}>
        
        
        <ClientLayout>
          {children}
        </ClientLayout>

      </body>
    </html>
  );
}