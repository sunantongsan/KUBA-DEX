import React from 'react';
import { NavLink } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { LayoutDashboard, ArrowLeftRight, Coins, Rocket, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Swap', icon: ArrowLeftRight },
    { to: '/liquidity', label: 'Pools', icon: Coins },
    { to: '/launchpad', label: 'Launchpad', icon: Rocket },
    { to: '/manage', label: 'Manager', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-dark-bg/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kuba to-emerald-600 flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(0,255,163,0.4)]">
                K
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight">
                Kuba<span className="text-kuba">DEX</span>
              </span>
            </NavLink>
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/10 text-kuba shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TonConnectButton className="custom-ton-connect" />
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-dark-card border-t border-white/10 p-4 flex justify-around items-center">
         {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                  isActive ? 'text-kuba' : 'text-gray-500'
                }`
              }
            >
              <item.icon size={24} />
              {item.label}
            </NavLink>
          ))}
      </div>
    </nav>
  );
};