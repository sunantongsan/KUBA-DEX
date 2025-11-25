import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { TokenSelectModal } from '../components/TokenSelectModal';
import { TOKENS, SWAP_FEE_PERCENT, DEX_CONTRACT_ADDRESS } from '../constants';
import { Token, TransactionStatus } from '../types';
import { ArrowDown, Settings, RefreshCw, Wallet, ArrowDownUp } from 'lucide-react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { BlockchainService } from '../services/blockchain';

export const Swap: React.FC = () => {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenSelectSide, setTokenSelectSide] = useState<'A' | 'B'>('A');
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [priceImpact, setPriceImpact] = useState(0);
  
  // Balances
  const [balanceA, setBalanceA] = useState('0');
  const [balanceB, setBalanceB] = useState('0');

  useEffect(() => {
    updateBalances();
  }, [wallet, tokenA, tokenB]);

  const updateBalances = async () => {
    if (!wallet) {
      setBalanceA('0'); setBalanceB('0'); return;
    }
    const map = await BlockchainService.getWalletBalances(wallet.account.address);
    // Special handling for native TON
    if (tokenA.symbol === 'TON') {
       // @ts-ignore - explicit balance checking from wallet object if available or fallback
       const tonBal = Number(wallet.account.balance) / 1e9; // Wallet balance is in nanoton
       setBalanceA(tonBal.toFixed(4));
    } else {
       setBalanceA(BlockchainService.getBalanceFromMap(map, tokenA.address).toFixed(4));
    }

    if (tokenB.symbol === 'TON') {
       const tonBal = Number(wallet.account.balance) / 1e9;
       setBalanceB(tonBal.toFixed(4));
    } else {
       setBalanceB(BlockchainService.getBalanceFromMap(map, tokenB.address).toFixed(4));
    }
  };

  const calculateSwap = (val: string, side: 'A' | 'B') => {
    if (!val || isNaN(Number(val))) {
        setAmountA(side === 'A' ? val : '');
        setAmountB(side === 'B' ? val : '');
        return;
    }
    
    // Mock Price Logic based on hardcoded USD prices for now
    const priceA = tokenA.priceUsd || 1;
    const priceB = tokenB.priceUsd || 1;
    const rate = priceA / priceB;
    
    if (side === 'A') {
        setAmountA(val);
        const rawOut = Number(val) * rate;
        const fee = rawOut * SWAP_FEE_PERCENT;
        setAmountB((rawOut - fee).toFixed(6));
        setPriceImpact(Math.min(Number(val) * 0.05, 5)); // Mock impact
    } else {
        setAmountB(val);
        const rawIn = Number(val) / rate;
        setAmountA((rawIn / (1 - SWAP_FEE_PERCENT)).toFixed(6));
    }
  };

  const handleSwap = () => {
    const tempT = tokenA; setTokenA(tokenB); setTokenB(tempT);
    const tempA = amountA; setAmountA(amountB); setAmountB(tempA);
  };

  const openTokenSelect = (side: 'A' | 'B') => {
    setTokenSelectSide(side);
    setIsTokenModalOpen(true);
  };

  const handleTokenSelected = (token: Token) => {
    if (tokenSelectSide === 'A') {
        if (token.address === tokenB.address) setTokenB(tokenA);
        setTokenA(token);
    } else {
        if (token.address === tokenA.address) setTokenA(tokenB);
        setTokenB(token);
    }
    setAmountA(''); setAmountB('');
  };

  const executeSwap = async () => {
    if (!wallet) return tonConnectUI.openModal();
    setStatus(TransactionStatus.PENDING);
    try {
        // Construct TON transaction
        const amountNano = Math.floor(Number(amountA) * 1e9);
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
            messages: [
                {
                    address: DEX_CONTRACT_ADDRESS,
                    amount: amountNano.toString(), // Sending TON or Triggering Jetton Transfer
                    // payload: ... (would need BOC construction for Jettons)
                }
            ]
        };
        
        await tonConnectUI.sendTransaction(transaction);
        setStatus(TransactionStatus.SUCCESS);
        updateBalances();
        setTimeout(() => setStatus(TransactionStatus.IDLE), 3000);
    } catch (e) {
        console.error(e);
        setStatus(TransactionStatus.FAILED);
        setTimeout(() => setStatus(TransactionStatus.IDLE), 3000);
    }
  };

  return (
    <div className="flex justify-center items-start pt-10 min-h-[80vh] animate-fadeIn">
      <TokenSelectModal 
        isOpen={isTokenModalOpen} 
        onClose={() => setIsTokenModalOpen(false)} 
        onSelect={handleTokenSelected}
        selectedToken={tokenSelectSide === 'A' ? tokenA : tokenB}
      />
      
      <Card className="w-full max-w-md p-2 border-kuba/20" glow>
        <div className="flex justify-between items-center px-4 py-2 mb-2">
            <h2 className="text-xl font-display font-bold text-white">Swap</h2>
            <div className="flex gap-2 text-gray-400">
                <button className="hover:text-white transition-colors"><RefreshCw size={18} /></button>
                <button className="hover:text-white transition-colors"><Settings size={18} /></button>
            </div>
        </div>

        {/* Input A */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">You pay</span>
                <span className="text-xs text-gray-400">Balance: {balanceA}</span>
            </div>
            <div className="flex items-center gap-3">
                <input 
                    type="number" 
                    placeholder="0" 
                    value={amountA}
                    onChange={(e) => calculateSwap(e.target.value, 'A')}
                    className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none placeholder-gray-600" 
                />
                <button onClick={() => openTokenSelect('A')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all min-w-[110px]">
                    <img src={tokenA.logoURI} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-sm">{tokenA.symbol}</span>
                    <ArrowDown size={14} />
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                ≈ ${(Number(amountA) * (tokenA.priceUsd || 0)).toFixed(2)}
            </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-3 relative z-10">
            <button onClick={handleSwap} className="bg-dark-card border border-kuba/30 text-kuba p-2 rounded-xl hover:bg-kuba hover:text-black transition-all shadow-lg">
                <ArrowDownUp size={20} />
            </button>
        </div>

        {/* Input B */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">You receive</span>
                <span className="text-xs text-gray-400">Balance: {balanceB}</span>
            </div>
            <div className="flex items-center gap-3">
                <input 
                    type="number" 
                    placeholder="0" 
                    value={amountB}
                    onChange={(e) => calculateSwap(e.target.value, 'B')}
                    className="w-full bg-transparent text-3xl font-bold text-kuba focus:outline-none placeholder-gray-600" 
                />
                <button onClick={() => openTokenSelect('B')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all min-w-[110px]">
                    <img src={tokenB.logoURI} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-sm">{tokenB.symbol}</span>
                    <ArrowDown size={14} />
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                ≈ ${(Number(amountB) * (tokenB.priceUsd || 0)).toFixed(2)}
            </div>
        </div>

        {/* Info */}
        {Number(amountA) > 0 && (
            <div className="mt-4 px-2 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Rate</span>
                    <span className="text-white">1 {tokenA.symbol} ≈ {(tokenA.priceUsd/tokenB.priceUsd).toFixed(4)} {tokenB.symbol}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Price Impact</span>
                    <span className={priceImpact > 2 ? 'text-red-400' : 'text-green-400'}>
                        {priceImpact < 0.01 ? '<0.01' : priceImpact.toFixed(2)}%
                    </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Network Fee</span>
                    <span className="text-white">~0.05 TON</span>
                </div>
            </div>
        )}

        <button 
            onClick={executeSwap}
            disabled={status === TransactionStatus.PENDING || (wallet && !amountA)}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                status === TransactionStatus.PENDING ? 'bg-gray-600 cursor-not-allowed' :
                !wallet ? 'bg-ton-blue hover:bg-blue-500 text-white' :
                'bg-kuba hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(0,255,163,0.3)]'
            }`}
        >
            {status === TransactionStatus.PENDING ? <RefreshCw className="animate-spin" /> : null}
            {!wallet ? <><Wallet size={20} /> Connect Wallet</> : (Number(amountA) > Number(balanceA) ? 'Insufficient Balance' : 'Swap')}
        </button>
      </Card>
    </div>
  );
};