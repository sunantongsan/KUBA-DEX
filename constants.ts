import { Token, LaunchpadProject, Pool } from './types';

// CONFIGURATION & CONTRACTS
export const KUBA_CONTRACT_ADDRESS = "EQAIYlrr3UiMJ9fqI-B4j2nJdiiD7WzyaNL1MX_wiONc4OUi";
export const DEX_CONTRACT_ADDRESS = "EQAIYlrr3UiMJ9fqI-B4j2nJdiiD7WzyaNL1MX_wiONc4OUi";
export const FEE_DESTINATION = KUBA_CONTRACT_ADDRESS; 
export const PLATFORM_OWNER_ADDRESS = "EQAIYlrr3UiMJ9fqI-B4j2nJdiiD7WzyaNL1MX_wiONc4OUi"; 

// FEES
export const SWAP_FEE_PERCENT = 0.0025; // 0.25%
export const PROTOCOL_FEE_PERCENT = 0.0010; // 0.10%
export const LIQUIDITY_REMOVE_PENALTY = 0.10; // 10%
export const LAUNCHPAD_CREATION_FEE = 10; // 10 TON
export const MIN_LAUNCHPAD_FEE_PERCENT = 3; 

export const createTextPayload = (text: string) => text;

export const TOKENS: Token[] = [
  {
    symbol: 'TON',
    name: 'Toncoin',
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    decimals: 9,
    logoURI: 'https://ton.org/download/ton_symbol.png',
    priceUsd: 5.20, 
    balance: 0
  },
  {
    symbol: 'KUBA',
    name: 'Kuba Token',
    address: KUBA_CONTRACT_ADDRESS,
    decimals: 9,
    logoURI: 'https://picsum.photos/seed/kuba/200',
    priceUsd: 0.50, 
    balance: 0
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixq7NrOA0rOnHl',
    decimals: 6,
    logoURI: 'https://tether.to/images/logoMark.png',
    priceUsd: 1.00,
    balance: 0
  },
  {
    symbol: 'NOT',
    name: 'Notcoin',
    address: 'EQAvlWFDxGF2lDLmFQCJXRnLGe_sVEVrUBq8PBYqBTGK33Ez',
    decimals: 9,
    logoURI: 'https://cdn.joincommunity.xyz/clicker/not_logo.png',
    priceUsd: 0.007,
    balance: 0
  }
];

export const MOCK_POOLS: Pool[] = []; 

export const LAUNCHPAD_PROJECTS: LaunchpadProject[] = [
  {
    id: 'kuba-genesis',
    name: 'Kuba Verse',
    ticker: 'KUBA',
    description: 'The ultimate metaverse experience on TON blockchain. Build, play, and earn in a decentralized world powered by Unreal Engine 5. Official Launchpad.',
    status: 'LIVE',
    raiseGoal: 10000,
    softCap: 2000,
    raisedAmount: 7500,
    price: 0.5,
    minBuy: 10,
    maxBuy: 1000,
    startTime: '2023-11-01',
    endTime: '2023-12-31',
    vesting: '40% TGE, 10% monthly',
    liquidityLock: 60,
    logo: 'https://picsum.photos/seed/kuba/200',
    banner: 'https://picsum.photos/seed/kubabg/800/300',
    socials: {
        website: 'https://kuba.network',
        telegram: 'https://t.me/kuba',
        twitter: 'https://x.com/kuba'
    },
    platformFee: 5
  },
  {
    id: 'meme-lord',
    name: 'Meme Lord',
    ticker: 'LORD',
    description: 'The King of Memes on TON. No utility, just vibes and community power. Join the revolution of laughter.',
    status: 'UPCOMING',
    raiseGoal: 5000,
    softCap: 1000,
    raisedAmount: 0,
    price: 0.01,
    minBuy: 5,
    maxBuy: 500,
    startTime: '2023-12-15',
    endTime: '2024-01-15',
    vesting: '100% TGE',
    liquidityLock: 180,
    logo: 'https://picsum.photos/seed/meme/200',
    banner: 'https://picsum.photos/seed/memebg/800/300',
    socials: {
        telegram: 'https://t.me/memelord'
    },
    platformFee: 3
  }
];