import { Inter } from "next/font/google";
import "./globals.css";
import { metadata } from "./metadata"; 
import ClientLayout from "./ClientLayout"; 

const fontBenvi = Inter({ subsets: ["latin"] });

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