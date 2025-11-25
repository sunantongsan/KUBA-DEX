import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Swap } from './pages/Swap';
import { Liquidity } from './pages/Liquidity';
import { Launchpad } from './pages/Launchpad';
import { LaunchpadDetail } from './pages/LaunchpadDetail';
import { TokenManager } from './pages/TokenManager';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-kuba selection:text-black">
        {/* Ambient Background Glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-kuba/5 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>
        
        <Navbar />
        
        <main className="relative z-10 px-4 py-8 md:py-12">
            <Routes>
                <Route path="/" element={<Swap />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/launchpad" element={<Launchpad />} />
                <Route path="/launchpad/:id" element={<LaunchpadDetail />} />
                <Route path="/manage" element={<TokenManager />} />
            </Routes>
        </main>
        
        <footer className="relative z-10 border-t border-white/5 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
                <p>&copy; 2024 KubaDEX. Built on The Open Network.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <a href="#" className="hover:text-kuba transition-colors">Telegram</a>
                    <a href="#" className="hover:text-kuba transition-colors">Twitter</a>
                    <a href="#" className="hover:text-kuba transition-colors">Docs</a>
                </div>
            </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;