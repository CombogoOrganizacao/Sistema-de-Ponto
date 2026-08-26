import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Combogó Ponto - Sistema de Ponto Eletrônico",
  description: "Sistema de Ponto Integrado com Firebase Auth e Cloud Firestore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}

