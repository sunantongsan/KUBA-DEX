import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Upload, Zap, Shield, Image as ImageIcon, Rocket } from 'lucide-react';
import { TransactionStatus } from '../types';

export const TokenManager: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', symbol: '', decimals: '9', supply: '' });
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(TransactionStatus.PENDING);
    // Simulate deployment
    setTimeout(() => {
        setStatus(TransactionStatus.SUCCESS);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Token Minter</h1>
        <p className="text-gray-400">Deploy your own Jetton (Token) on TON blockchain in seconds.</p>
      </div>

      <Card glow className="border-ton-blue/30">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Token Name</label>
                    <input type="text" placeholder="e.g. Kuba Token" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ton-blue focus:outline-none focus:ring-1 focus:ring-ton-blue/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Symbol</label>
                    <input type="text" placeholder="e.g. KUBA" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ton-blue focus:outline-none focus:ring-1 focus:ring-ton-blue/50" value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Initial Supply</label>
                    <input type="number" placeholder="1000000" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ton-blue focus:outline-none focus:ring-1 focus:ring-ton-blue/50" value={formData.supply} onChange={e => setFormData({...formData, supply: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Decimals</label>
                    <input type="number" placeholder="9" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ton-blue focus:outline-none focus:ring-1 focus:ring-ton-blue/50" value={formData.decimals} onChange={e => setFormData({...formData, decimals: e.target.value})} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Logo Image</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-ton-blue/50 hover:bg-white/5 transition-all cursor-pointer">
                    <ImageIcon className="mb-2" />
                    <span className="text-sm">Click to upload or drag and drop</span>
                    <input type="file" className="hidden" />
                </div>
            </div>

            <div className="bg-ton-blue/10 border border-ton-blue/20 rounded-xl p-4 flex items-start gap-3">
                <Zap className="text-ton-blue shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-gray-300">
                    <span className="text-white font-bold block mb-1">Instant Deployment</span>
                    Cost is approximately 0.25 TON. Your wallet must be connected to deploy.
                </div>
            </div>

            <button type="submit" className="w-full bg-ton-blue hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                {status === TransactionStatus.PENDING ? 'Deploying...' : <><Rocket size={20} /> Deploy Jetton</>}
            </button>
        </form>
      </Card>
    </div>
  );
};