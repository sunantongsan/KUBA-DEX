import React, { useState, useEffect } from 'react';
import { Search, X, Download } from 'lucide-react';
import { Token } from '../types';
import { BlockchainService } from '../services/blockchain';
import { Card } from './Card';

interface TokenSelectModalProps {
  isOpen: boolean; onClose: () => void; onSelect: (token: Token) => void; selectedToken?: Token;
}

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({ isOpen, onClose, onSelect, selectedToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [importedToken, setImportedToken] = useState<Token | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { if (isOpen) { loadTokens(); setSearchQuery(''); setImportedToken(null); setIsSearching(false); } }, [isOpen]);
  const loadTokens = async () => { const all = await BlockchainService.getAvailableTokens(); setTokens(all); setFilteredTokens(all); };

  useEffect(() => {
      const filter = async () => {
          if (!searchQuery) { setFilteredTokens(tokens); setImportedToken(null); setIsSearching(false); return; }
          setIsSearching(true);
          const queryLower = searchQuery.toLowerCase().trim();
          const localMatch = tokens.filter(t => t.symbol.toLowerCase().includes(queryLower) || t.name.toLowerCase().includes(queryLower) || t.address === searchQuery.trim());
          if (localMatch.length > 0) { setFilteredTokens(localMatch); setImportedToken(null); setIsSearching(false); } 
          else {
              setFilteredTokens([]);
              if (searchQuery.trim().startsWith('EQ') || searchQuery.trim().startsWith('UQ')) {
                  const found = await BlockchainService.searchToken(searchQuery);
                  if (found) setImportedToken(found); else setImportedToken(null);
              } else setImportedToken(null);
              setIsSearching(false);
          }
      };
      const timeoutId = setTimeout(filter, 800); return () => clearTimeout(timeoutId);
  }, [searchQuery, tokens]);

  const handleSelect = async (token: Token) => {
      if (importedToken && token.address === importedToken.address) { await BlockchainService.importToken(token); await loadTokens(); }
      onSelect(token); onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-md h-[550px] flex flex-col p-0 border-kuba/20 shadow-2xl bg-dark-card">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20"><h3 className="text-lg font-bold text-white">Select Token</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" autoFocus placeholder="Search name or paste address" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-kuba focus:outline-none" /></div></div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {isSearching ? <div className="text-center py-12 text-gray-500"><div className="w-8 h-8 border-4 border-kuba border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>Searching...</div> : (
                <>
                    {filteredTokens.map(token => (
                        <button key={token.address} onClick={() => handleSelect(token)} className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 ${selectedToken?.address === token.address ? 'bg-kuba/10 border border-kuba/30' : 'hover:bg-white/5 border border-transparent'}`}>
                            <div className="flex items-center gap-3"><img src={token.logoURI} className="w-10 h-10 rounded-full bg-black/40" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}`}/><div className="text-left"><div className="font-bold text-white">{token.symbol}</div><div className="text-xs text-gray-500">{token.name}</div></div></div>
                            <div className="text-right"><div className="text-white text-sm font-medium">{token.balance ? token.balance.toFixed(4) : '0'}</div></div>
                        </button>
                    ))}
                    {importedToken && filteredTokens.length === 0 && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 m-2"><div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-kuba">{importedToken.symbol === 'UNVERIFIED' ? 'Unverified' : 'Found'}</span></div><div className="flex items-center gap-3 mb-4"><img src={importedToken.logoURI} className="w-12 h-12 rounded-full"/><div className="text-left"><div className="font-bold text-white text-lg">{importedToken.symbol}</div><div className="text-xs text-gray-400">{importedToken.address.slice(0, 8)}...</div></div></div><button onClick={() => handleSelect(importedToken)} className="w-full flex items-center justify-center gap-2 p-3 bg-kuba text-black font-bold rounded-xl"><Download size={18}/> Import Token</button></div>
                    )}
                </>
            )}
        </div>
      </Card>
    </div>
  );
};