import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { TOKENS, KUBA_CONTRACT_ADDRESS, DEX_CONTRACT_ADDRESS, LIQUIDITY_REMOVE_PENALTY } from '../constants';
import { Plus, Wallet, X, AlertTriangle, RefreshCw, Layers, TrendingUp, BarChart2 } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { TransactionStatus, Pool, Token } from '../types';
import { BlockchainService } from '../services/blockchain';
import { TokenSelectModal } from '../components/TokenSelectModal';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Liquidity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenSelectSide, setTokenSelectSide] = useState<'A' | 'B'>('A');
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [balanceA, setBalanceA] = useState<string>('--');
  const [balanceB, setBalanceB] = useState<string>('--');

  useEffect(() => { loadPools(); }, []);

  useEffect(() => {
      const fetchBalances = async () => {
          if (!wallet) { setBalanceA('--'); setBalanceB('--'); return; }
          try {
            const jettonBalances = await BlockchainService.getWalletBalances(wallet.account.address);
            const getBal = (t: Token) => {
                if (t.symbol === 'TON') return (Number(wallet.account.balance) / 1e9);
                return BlockchainService.getBalanceFromMap(jettonBalances, t.address);
            };
            setBalanceA(getBal(tokenA).toFixed(4));
            setBalanceB(getBal(tokenB).toFixed(4));
          } catch (e) { console.error("Failed to load balances", e); }
      };
      fetchBalances();
  }, [wallet, tokenA, tokenB, isAddModalOpen]);

  const loadPools = async () => {
      setIsLoading(true);
      try { const data = await BlockchainService.getPools(); setPools(data); } 
      catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const getPoolHistory = (pool: Pool) => {
    const data = []; const now = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const variance = Math.sin(i) * 0.1; 
        data.push({
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            tvl: Math.max(0, pool.tvl * (0.8 + (Math.random() * 0.2) + (variance * 0.1))),
            apr: Math.max(0, pool.apr * (0.9 + (Math.random() * 0.2) - (variance * 0.1)))
        });
    }
    return data;
  };

  const existingPool = pools.find(p => (p.tokenA.symbol === tokenA.symbol && p.tokenB.symbol === tokenB.symbol) || (p.tokenA.symbol === tokenB.symbol && p.tokenB.symbol === tokenA.symbol));
  const getRatio = () => {
      const pA = tokenA.symbol === 'TON' ? 5.2 : (tokenA.priceUsd || 1);
      const pB = tokenB.symbol === 'TON' ? 5.2 : (tokenB.priceUsd || 1);
      return pA / pB;
  };
  const handleAmountAChange = (val: string) => {
      setAmountA(val);
      if (val && !isNaN(Number(val))) { setAmountB((Number(val) * getRatio()).toFixed(2)); } else { setAmountB(''); }
  };
  const openCreateModal = () => {
      if (!wallet) return tonConnectUI.openModal();
      setTokenA(TOKENS[0]); setTokenB(TOKENS[1]); setAmountA(''); setAmountB(''); setSelectedPool(null); setIsAddModalOpen(true);
  };
  const openManageModal = (pool: Pool) => {
      if (!wallet) return tonConnectUI.openModal();
      setSelectedPool(pool); setTokenA(pool.tokenA); setTokenB(pool.tokenB); setAmountA(''); setAmountB(''); setIsAddModalOpen(true);
  };
  const openTokenSelect = (side: 'A' | 'B') => { if (selectedPool) return; setTokenSelectSide(side); setIsTokenModalOpen(true); };
  const handleTokenSelect = (token: Token) => {
      if (tokenSelectSide === 'A') { if (token.address === tokenB.address) setTokenB(tokenA); setTokenA(token); } 
      else { if (token.address === tokenA.address) setTokenA(tokenB); setTokenB(token); }
  };

  const handleConfirmAdd = async () => {
      if (!amountA || !amountB || tokenA.symbol === tokenB.symbol) return;
      setStatus(TransactionStatus.PENDING);
      try {
        const amountNano = Math.floor(Number(amountA) * 1e9);
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [{ address: DEX_CONTRACT_ADDRESS || KUBA_CONTRACT_ADDRESS, amount: amountNano.toString() }]
        };
        await tonConnectUI.sendTransaction(transaction);
        if (existingPool) {
            await BlockchainService.updatePool({ ...existingPool, tvl: existingPool.tvl + Number(amountA) * 5.2 + Number(amountB) * 1.4, myLiquidity: existingPool.myLiquidity + Number(amountA) * 5.2 });
        } else {
            await BlockchainService.createPool({ id: Date.now().toString(), tokenA: tokenA, tokenB: tokenB, apr: 100 + Math.random() * 50, tvl: Number(amountA) * 5.2 + Number(amountB) * 1.4, myLiquidity: Number(amountA) * 5.2, isUserCreated: true });
        }
        await loadPools(); setStatus(TransactionStatus.SUCCESS);
        setTimeout(() => { setStatus(TransactionStatus.IDLE); setIsAddModalOpen(false); }, 3000);
      } catch (e) { setStatus(TransactionStatus.FAILED); setTimeout(() => setStatus(TransactionStatus.IDLE), 3000); }
  };

  const openRemoveModal = (pool: Pool) => { setSelectedPool(pool); setIsRemoveModalOpen(true); };
  const getRemoveDetails = () => {
      if (!selectedPool) return { rawA: 0, rawB: 0, receiveA: 0, receiveB: 0 };
      const pA = selectedPool.tokenA.symbol === 'TON' ? 5.2 : (selectedPool.tokenA.priceUsd || 1);
      const pB = selectedPool.tokenB.symbol === 'TON' ? 5.2 : (selectedPool.tokenB.priceUsd || 1);
      const shareValue = selectedPool.myLiquidity / 2;
      const rawA = shareValue / pA; const rawB = shareValue / pB;
      return { rawA, rawB, receiveA: rawA * (1 - LIQUIDITY_REMOVE_PENALTY), receiveB: rawB * (1 - LIQUIDITY_REMOVE_PENALTY) };
  };
  const handleConfirmRemove = async () => {
      if (!selectedPool) return;
      setStatus(TransactionStatus.PENDING);
      try {
        const transaction = { validUntil: Math.floor(Date.now() / 1000) + 600, messages: [{ address: DEX_CONTRACT_ADDRESS || KUBA_CONTRACT_ADDRESS, amount: "10000000" }] };
        await tonConnectUI.sendTransaction(transaction);
        await BlockchainService.updatePool({ ...selectedPool, myLiquidity: 0 });
        await loadPools(); setStatus(TransactionStatus.SUCCESS);
        setTimeout(() => { setStatus(TransactionStatus.IDLE); setIsRemoveModalOpen(false); }, 3000);
      } catch (e) { setStatus(TransactionStatus.FAILED); setTimeout(() => setStatus(TransactionStatus.IDLE), 3000); }
  };
  const removeDetails = selectedPool ? getRemoveDetails() : { rawA:0, rawB:0, receiveA:0, receiveB:0 };
  const isSameToken = tokenA.symbol === tokenB.symbol;

  return (
    <div className="max-w-5xl mx-auto relative animate-fadeIn">
      <TokenSelectModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} onSelect={handleTokenSelect} selectedToken={tokenSelectSide === 'A' ? tokenA : tokenB} />
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div><h1 className="text-3xl font-display font-bold text-white">Liquidity Pools</h1><p className="text-gray-400 mt-1">Provide liquidity to earn 0.25% trading fees.</p></div>
        <button onClick={openCreateModal} className={`font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${wallet ? 'bg-kuba text-black shadow-lg shadow-kuba/20' : 'bg-white/10 text-white'}`}>{wallet ? <Plus size={20} /> : <Wallet size={20} />} {wallet ? 'Create / Add Liquidity' : 'Connect Wallet'}</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
         <Card className="bg-gradient-to-br from-kuba/10 to-transparent border-kuba/20"><div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Value Locked</div><div className="text-3xl font-display font-bold text-white">${pools.reduce((acc, p) => acc + p.tvl, 0).toLocaleString()}</div></Card>
         <Card><div className="text-gray-400 text-xs font-bold uppercase mb-1">My Total Position</div><div className="text-3xl font-display font-bold text-kuba">${pools.reduce((acc, p) => acc + p.myLiquidity, 0).toLocaleString()}</div></Card>
         <Card><div className="text-gray-400 text-xs font-bold uppercase mb-1">24h Volume</div><div className="text-3xl font-display font-bold text-white">$1.2M</div></Card>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'all' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>All Pools</button>
        <button onClick={() => setActiveTab('my')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'my' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>My Positions</button>
        <button onClick={() => loadPools()} className="p-2 text-gray-400 bg-white/5 rounded-lg"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
      </div>
      {isLoading ? <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-kuba" size={40} /></div> : (
      <div className="grid gap-4">
        {pools.filter(p => activeTab === 'all' || (activeTab === 'my' && p.myLiquidity > 0)).map((pool) => (
          <Card key={pool.id} className={`hover:border-kuba/30 transition-all ${pool.isUserCreated ? 'border-kuba/20 bg-kuba/5' : ''}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex -space-x-3"><img src={pool.tokenA.logoURI} className="w-12 h-12 rounded-full border-4 border-dark-card z-10"/><img src={pool.tokenB.logoURI} className="w-12 h-12 rounded-full border-4 border-dark-card z-0"/></div>
                <div><h3 className="font-bold text-white text-xl flex items-center gap-2">{pool.tokenA.symbol}/{pool.tokenB.symbol}{pool.isUserCreated && <span className="text-[10px] bg-kuba text-black px-2 py-0.5 rounded-full font-bold">NEW</span>}</h3><div className="flex gap-2 text-xs mt-1"><span className="text-gray-400 bg-white/5 px-2 py-0.5 rounded flex items-center gap-1"><Layers size={10}/> Basic Volatility</span><span className="text-kuba bg-kuba/10 px-2 py-0.5 rounded flex items-center gap-1"><TrendingUp size={10}/> {pool.apr.toFixed(2)}% APR</span></div></div>
              </div>
              <div className="grid grid-cols-3 gap-8 w-full md:w-auto text-center md:text-left pt-4 md:pt-0">
                <div><div className="text-gray-400 text-xs mb-1">TVL</div><div className="text-white font-medium">${pool.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div>
                <div><div className="text-gray-400 text-xs mb-1">Volume 24h</div><div className="text-white font-medium">${(pool.tvl * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></div>
                 <div><div className="text-gray-400 text-xs mb-1">My Staked</div><div className={`font-bold ${pool.myLiquidity > 0 ? 'text-kuba' : 'text-gray-500'}`}>${pool.myLiquidity.toLocaleString()}</div></div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => setExpandedPoolId(expandedPoolId === pool.id ? null : pool.id)} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${expandedPoolId === pool.id ? 'bg-kuba/20 text-kuba' : 'bg-white/5 text-gray-400'}`}><BarChart2 size={16} /> Analytics</button>
                  {pool.myLiquidity > 0 && <button onClick={() => openRemoveModal(pool)} className="flex-1 md:flex-none border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium">Remove</button>}
                 <button onClick={() => openManageModal(pool)} className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-kuba px-6 py-2 rounded-lg text-sm font-bold">Manage</button>
              </div>
            </div>
            {expandedPoolId === pool.id && (
                <div className="mt-6 pt-6 border-t border-white/5 animate-fadeIn">
                    <div className="h-64 w-full bg-black/20 rounded-xl p-4 border border-white/5">
                        <ResponsiveContainer width="100%" height="100%"><AreaChart data={getPoolHistory(pool)}><defs><linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00FFA3" stopOpacity={0.3}/><stop offset="95%" stopColor="#00FFA3" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} /><XAxis dataKey="date" tick={{fill: '#6b7280', fontSize: 10}} axisLine={false} tickLine={false} /><YAxis hide domain={['auto', 'auto']} /><Tooltip contentStyle={{ backgroundColor: '#15191E', border: '1px solid #333' }} itemStyle={{ color: '#00FFA3' }} /><Area type="monotone" dataKey="tvl" stroke="#00FFA3" fill="url(#colorMetric)" /></AreaChart></ResponsiveContainer>
                    </div>
                </div>
            )}
          </Card>
        ))}
      </div>
      )}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <Card className="w-full max-w-md relative border-kuba/20" glow>
                <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                <h2 className="text-xl font-bold text-white mb-6">{existingPool || selectedPool ? 'Add Liquidity' : 'Create Pool'}</h2>
                <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between mb-2"><span className="text-xs text-gray-400">First Asset</span><span className="text-xs text-gray-400">Balance: {balanceA}</span></div>
                        <div className="flex items-center gap-3"><input type="number" value={amountA} onChange={(e) => handleAmountAChange(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none" /><button onClick={() => !selectedPool && openTokenSelect('A')} disabled={!!selectedPool} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 hover:text-kuba"><img src={tokenA.logoURI} className="w-6 h-6 rounded-full" alt="" /><span className="font-bold">{tokenA.symbol}</span></button></div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between mb-2"><span className="text-xs text-gray-400">Second Asset</span><span className="text-xs text-gray-400">Balance: {balanceB}</span></div>
                        <div className="flex items-center gap-3"><input type="number" value={amountB} readOnly placeholder="0.0" className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none text-gray-300" /><button onClick={() => !selectedPool && openTokenSelect('B')} disabled={!!selectedPool} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 hover:text-kuba"><img src={tokenB.logoURI} className="w-6 h-6 rounded-full" alt="" /><span className="font-bold">{tokenB.symbol}</span></button></div>
                    </div>
                    <button onClick={handleConfirmAdd} disabled={status === TransactionStatus.PENDING || !amountA || isSameToken} className="w-full py-4 rounded-xl font-bold text-lg bg-kuba text-black hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]">{status === TransactionStatus.PENDING ? 'Processing...' : (existingPool || selectedPool ? 'Supply Liquidity' : 'Create Pool')}</button>
                </div>
            </Card>
        </div>
      )}
      {isRemoveModalOpen && selectedPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <Card className="w-full max-w-md border-red-500/30">
                  <div className="text-center mb-6"><div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div><h2 className="text-2xl font-bold text-white">Confirm Removal</h2></div>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 space-y-4">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><img src={selectedPool.tokenA.logoURI} className="w-8 h-8 rounded-full"/><span className="font-bold">{selectedPool.tokenA.symbol}</span></div><div className="text-right"><div className="text-lg font-bold text-white">{removeDetails.receiveA.toFixed(4)}</div></div></div>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><img src={selectedPool.tokenB.logoURI} className="w-8 h-8 rounded-full"/><span className="font-bold">{selectedPool.tokenB.symbol}</span></div><div className="text-right"><div className="text-lg font-bold text-white">{removeDetails.receiveB.toFixed(4)}</div></div></div>
                      <div className="h-px bg-red-500/20 my-2"></div>
                      <div className="flex justify-between text-sm"><span className="text-red-300">Early Removal Penalty</span><span className="text-red-400 font-bold">{LIQUIDITY_REMOVE_PENALTY * 100}%</span></div>
                  </div>
                  <div className="flex gap-3"><button onClick={() => setIsRemoveModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium text-gray-300 bg-white/5">Cancel</button><button onClick={handleConfirmRemove} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600">Confirm Remove</button></div>
              </Card>
          </div>
      )}
    </div>
  );
};