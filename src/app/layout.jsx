import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export const metadata = {
  title: "KUBA SWAP",
  description: "DEX on TON • Powered by $KUBA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/sunantongsan/KUBA-DEX/main/public/tonconnect-manifest.json">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
