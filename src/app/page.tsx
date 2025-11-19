'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import Image from 'next/image';

const KUBA = "EQDCCMpdq2lab20fVNcXTx44TrGfAnNDvWiFWt9wDfDUY5YT";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <Image src="/kuba-logo.png" alt="$KUBA" width={150} height={150} className="rounded-full mb-8" />
      <h1 className="text-6xl font-bold mb-4">KUBA SWAP</h1>
      <p className="text-2xl mb-8">Multi-Chain DEX • Fee 0.17%</p>

      <TonConnectButton className="mb-12" />

      <div className="bg-gray-900 p-10 rounded-2xl max-w-lg w-full">
        <p className="text-xl mb-6">Swap & Create Token on TON</p>
        <button className="w-full p-4 bg-yellow-400 text-black font-bold text-xl rounded-lg">SWAP SOON</button>
      </div>

      <p className="mt-12">
        $KUBA: {KUBA.slice(0,8)}...{KUBA.slice(-6)}<br/>
        <a href="https://t.me/+gzmYsT0sBjRmMzg1" target="_blank" className="text-yellow-400 underline">Telegram Group</a>
      </p>
    </main>
  );
}
