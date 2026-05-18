import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "ListaSync",
  description: "Controle inteligente de compras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
