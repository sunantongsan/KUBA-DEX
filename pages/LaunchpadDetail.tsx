import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { BlockchainService } from '../services/blockchain';
import { LaunchpadProject, TransactionStatus } from '../types';
import { ArrowLeft, Globe, Send, Twitter, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

export const LaunchpadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<LaunchpadProject | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (id) {
        // In a real app, define a getById method or filter from getAll
        BlockchainService.getProjects().then(projs => {
            const found = projs.find(p => p.id === id);
            setProject(found || null);
        });
    }
  }, [id]);

  if (!project) return <div className="text-center py-20">Loading...</div>;

  const handleBuy = async () => {
      if (!wallet) return tonConnectUI.openModal();
      setStatus(TransactionStatus.PENDING);
      try {
          const transaction = {
              validUntil: Math.floor(Date.now() / 1000) + 600,
              messages: [{ address: 'EQAIYlrr3UiMJ9fqI-B4j2nJdiiD7WzyaNL1MX_wiONc4OUi', amount: (Number(amount) * 1e9).toString() }]
          };
          await tonConnectUI.sendTransaction(transaction);
          setStatus(TransactionStatus.SUCCESS);
      } catch (e) {
          setStatus(TransactionStatus.FAILED);
      } finally {
          setTimeout(() => setStatus(TransactionStatus.IDLE), 3000);
      }
  };

  const progress = Math.min((project.raisedAmount / project.raiseGoal) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
      <Link to="/launchpad" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Projects
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Project Info */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-visible">
                 <div className="h-48 w-full rounded-xl overflow-hidden mb-6 relative">
                     <img src={project.banner} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40"></div>
                     <img src={project.logo} className="absolute -bottom-8 left-8 w-24 h-24 rounded-2xl border-4 border-dark-card" />
                 </div>
                 <div className="mt-8 px-2">
                     <div className="flex justify-between items-start mb-4">
                         <div>
                            <h1 className="text-3xl font-display font-bold text-white mb-1">{project.name}</h1>
                            <span className="text-kuba font-mono font-bold bg-kuba/10 px-2 py-0.5 rounded">${project.ticker}</span>
                         </div>
                         <div className="flex gap-3">
                             {project.socials.website && <a href={project.socials.website} target="_blank" className="p-2 bg-white/5 rounded-lg hover:text-kuba"><Globe size={20}/></a>}
                             {project.socials.twitter && <a href={project.socials.twitter} target="_blank" className="p-2 bg-white/5 rounded-lg hover:text-kuba"><Twitter size={20}/></a>}
                             {project.socials.telegram && <a href={project.socials.telegram} target="_blank" className="p-2 bg-white/5 rounded-lg hover:text-kuba"><Send size={20}/></a>}
                         </div>
                     </div>
                     <p className="text-gray-300 leading-relaxed mb-6">{project.description}</p>
                     
                     <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                        <div><div className="text-gray-500 text-xs">Access Type</div><div className="font-medium text-white">Public</div></div>
                        <div><div className="text-gray-500 text-xs">Vesting</div><div className="font-medium text-white">{project.vesting}</div></div>
                        <div><div className="text-gray-500 text-xs">Liquidity Lock</div><div className="font-medium text-white">{project.liquidityLock} Days</div></div>
                        <div><div className="text-gray-500 text-xs">Platform Fee</div><div className="font-medium text-white">{project.platformFee}%</div></div>
                     </div>
                 </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Tokenomics</h3>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Total Supply</span><span className="font-mono text-gray-300">100,000,000 {project.ticker}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Tokens for Presale</span><span className="font-mono text-gray-300">20,000,000 {project.ticker}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Tokens for Liquidity</span><span className="font-mono text-gray-300">10,000,000 {project.ticker}</span></div>
                </div>
            </Card>
        </div>

        {/* Right Column: Interaction */}
        <div className="space-y-6">
            <Card glow className="border-kuba/30">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${project.status === 'LIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="font-bold uppercase tracking-wider text-sm">{project.status === 'LIVE' ? 'Sale Live' : 'Sale Ended'}</span>
                </div>
                
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Progress</span><span className="text-kuba font-bold">{progress.toFixed(1)}%</span></div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                        <div className="bg-gradient-to-r from-kuba to-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{project.raisedAmount} TON</span>
                        <span>{project.raiseGoal} TON</span>
                    </div>
                </div>

                {project.status === 'LIVE' ? (
                    <div className="space-y-4">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                            <label className="text-xs text-gray-500 block mb-1">Amount (TON)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min ${project.minBuy} TON`} className="w-full bg-transparent text-white font-bold text-xl focus:outline-none" />
                        </div>
                        <div className="text-xs text-gray-500 text-right">Balance: {wallet ? '124.50' : '0'} TON</div>
                        <button 
                            onClick={handleBuy}
                            disabled={status === TransactionStatus.PENDING || !amount}
                            className="w-full py-3 rounded-xl bg-kuba text-black font-bold hover:bg-emerald-400 transition-colors"
                        >
                            {status === TransactionStatus.PENDING ? 'Confirming...' : 'Buy Tokens'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <Clock className="mx-auto text-gray-500 mb-2" />
                        <span className="text-gray-400">This sale has ended.</span>
                    </div>
                )}
            </Card>

            <Card>
                <h3 className="font-bold text-white mb-4">Audit & Safety</h3>
                <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="text-kuba" />
                    <div>
                        <div className="text-sm font-bold text-white">Audited by CertiK</div>
                        <div className="text-xs text-gray-500">Score: 92/100</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle className="text-ton-blue" />
                    <div>
                        <div className="text-sm font-bold text-white">KYC Verified</div>
                        <div className="text-xs text-gray-500">Team identity verified</div>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};