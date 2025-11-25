export enum TransactionStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  balance?: number; 
  priceUsd: number; 
}

export interface Pool {
  id: string;
  tokenA: Token;
  tokenB: Token;
  apr: number;
  tvl: number;
  myLiquidity: number;
  isUserCreated?: boolean;
}

export interface LaunchpadProject {
  id: string;
  name: string;
  ticker: string;
  description: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  raiseGoal: number;
  softCap: number;
  raisedAmount: number;
  logo: string;
  banner?: string;
  price: number;
  minBuy: number;
  maxBuy: number;
  startTime: string;
  endTime: string;
  vesting: string;
  liquidityLock: number;
  socials: {
    website?: string;
    telegram?: string;
    twitter?: string;
    discord?: string;
  };
  platformFee?: number;
}