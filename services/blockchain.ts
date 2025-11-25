import { LAUNCHPAD_PROJECTS, TOKENS, KUBA_CONTRACT_ADDRESS } from '../constants';
import { LaunchpadProject, Pool, Token } from '../types';

const STORAGE_KEY_PROJECTS = 'kubadex_launchpad_projects_v1';
const STORAGE_KEY_POOLS = 'kubadex_liquidity_pools_v1';
const STORAGE_KEY_IMPORTED_TOKENS = 'kubadex_imported_tokens_v1';
const TONAPI_ENDPOINT = 'https://tonapi.io/v2';

const normalizeAddr = (addr: string) => {
    if (!addr) return '';
    if (addr.includes(':')) return addr.split(':')[1].toLowerCase();
    return addr.replace(/^0:/, '').replace(/^(EQ|UQ)/, '').toLowerCase().slice(-10); 
};

export const BlockchainService = {
  getAvailableTokens: async (): Promise<Token[]> => {
      const stored = localStorage.getItem(STORAGE_KEY_IMPORTED_TOKENS);
      const importedTokens: Token[] = stored ? JSON.parse(stored) : [];
      const allTokens = [...TOKENS, ...importedTokens];
      return Array.from(new Map(allTokens.map(t => [t.address, t])).values());
  },

  searchToken: async (query: string): Promise<Token | null> => {
      const cleanQuery = query.trim();
      const allTokens = await BlockchainService.getAvailableTokens();
      const found = allTokens.find(t => t.symbol.toLowerCase() === cleanQuery.toLowerCase() || t.address === cleanQuery);
      if (found) return found;
      if (cleanQuery === KUBA_CONTRACT_ADDRESS) return TOKENS.find(t => t.symbol === 'KUBA') || null;

      const isAddress = (cleanQuery.startsWith('EQ') || cleanQuery.startsWith('UQ')) && cleanQuery.length > 40; 
      if (isAddress) {
          try {
              const response = await fetch(`${TONAPI_ENDPOINT}/jettons/${cleanQuery}`);
              if (response.ok) {
                  const data = await response.json();
                  const metadata = data.metadata;
                  return {
                      symbol: metadata.symbol || 'UNK',
                      name: metadata.name || 'Unknown Token',
                      address: cleanQuery,
                      decimals: Number(metadata.decimals || 9),
                      logoURI: metadata.image || `https://ui-avatars.com/api/?name=${metadata.symbol || '?'}&background=random`,
                      priceUsd: 0,
                      balance: 0
                  };
              }
          } catch (e) { console.warn("API Fetch failed", e); }
          return {
              symbol: 'UNVERIFIED',
              name: `Unverified Token`,
              address: cleanQuery,
              decimals: 9,
              logoURI: 'https://ui-avatars.com/api/?name=?&background=333&color=fff',
              priceUsd: 0,
              balance: 0
          };
      }
      return null;
  },

  importToken: async (token: Token): Promise<void> => {
      const stored = localStorage.getItem(STORAGE_KEY_IMPORTED_TOKENS);
      const currentImported: Token[] = stored ? JSON.parse(stored) : [];
      if (!currentImported.find(t => t.address === token.address)) {
          const updated = [...currentImported, token];
          localStorage.setItem(STORAGE_KEY_IMPORTED_TOKENS, JSON.stringify(updated));
      }
      return Promise.resolve();
  },

  getWalletBalances: async (walletAddress: string): Promise<Map<string, number>> => {
      const balances = new Map<string, number>();
      if (!walletAddress) return balances;
      try {
          const response = await fetch(`${TONAPI_ENDPOINT}/accounts/${walletAddress}/jettons?currencies=usd`);
          if (response.ok) {
              const data = await response.json();
              const balancesList = data.balances || [];
              balancesList.forEach((item: any) => {
                  const jettonAddress = item.jetton.address;
                  const rawBalance = Number(item.balance);
                  const decimals = item.jetton.decimals || 9;
                  const normalized = rawBalance / Math.pow(10, decimals);
                  balances.set(jettonAddress, normalized);
                  balances.set(normalizeAddr(jettonAddress), normalized);
              });
          }
      } catch (e) { console.error("Failed to fetch balances", e); }
      return balances;
  },

  getBalanceFromMap: (map: Map<string, number>, tokenAddress: string): number => {
      if (map.has(tokenAddress)) return map.get(tokenAddress)!;
      const norm = normalizeAddr(tokenAddress);
      if (map.has(norm)) return map.get(norm)!;
      return 0;
  },

  getProjects: async (): Promise<LaunchpadProject[]> => {
    const officialProjects = LAUNCHPAD_PROJECTS;
    const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
    const userProjects: LaunchpadProject[] = stored ? JSON.parse(stored) : [];
    return Array.from(new Map([...userProjects, ...officialProjects].map(item => [item.id, item])).values());
  },

  getProjectById: async (id: string): Promise<LaunchpadProject | undefined> => {
    const projects = await BlockchainService.getProjects();
    return projects.find(p => p.id === id);
  },

  createProject: async (project: LaunchpadProject): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
    const currentProjects: LaunchpadProject[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify([project, ...currentProjects]));
    return Promise.resolve();
  },

  getPools: async (): Promise<Pool[]> => {
    const stored = localStorage.getItem(STORAGE_KEY_POOLS);
    let savedPools: Pool[] = stored ? JSON.parse(stored) : [];
    if (savedPools.length === 0) {
        savedPools = [{ id: 'official-ton-kuba', tokenA: TOKENS[0], tokenB: TOKENS[1], apr: 125.5, tvl: 0, myLiquidity: 0, isUserCreated: false }];
        localStorage.setItem(STORAGE_KEY_POOLS, JSON.stringify(savedPools));
    }
    // Simulate updating TVL with real data or mock if fetch fails
    try {
        const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${KUBA_CONTRACT_ADDRESS}`); 
        if (response.ok) {
            const res = await response.json();
            if (res.ok) {
                const balanceTon = Number(res.result) / 1e9;
                if (savedPools.length > 0) savedPools[0].tvl = Math.max(balanceTon * 5.2, 50000); // Mock minimum TVL for visual
            }
        }
    } catch (e) {}
    return savedPools;
  },

  updatePool: async (updatedPool: Pool): Promise<void> => {
      const stored = localStorage.getItem(STORAGE_KEY_POOLS);
      let currentPools: Pool[] = stored ? JSON.parse(stored) : [];
      const index = currentPools.findIndex(p => p.id === updatedPool.id);
      if (index !== -1) currentPools[index] = updatedPool;
      else currentPools.push({ ...updatedPool, isUserCreated: true });
      localStorage.setItem(STORAGE_KEY_POOLS, JSON.stringify(currentPools));
      return Promise.resolve();
  },

  createPool: async (newPool: Pool): Promise<void> => {
      const stored = localStorage.getItem(STORAGE_KEY_POOLS);
      let currentPools: Pool[] = stored ? JSON.parse(stored) : [];
      const exists = currentPools.find(p => (p.tokenA.symbol === newPool.tokenA.symbol && p.tokenB.symbol === newPool.tokenB.symbol) || (p.tokenA.symbol === newPool.tokenB.symbol && p.tokenB.symbol === newPool.tokenA.symbol));
      if (!exists) {
          currentPools.unshift(newPool);
          localStorage.setItem(STORAGE_KEY_POOLS, JSON.stringify(currentPools));
      }
      return Promise.resolve();
  },
  
  getTonPrice: async (): Promise<number> => {
    try {
         const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
         if (res.ok) {
             const data = await res.json();
             return data['the-open-network']?.usd || 0;
         }
    } catch (err) {}
    return 5.20; 
  }
};