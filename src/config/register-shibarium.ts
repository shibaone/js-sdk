import { registerDidMethodNetwork, DidMethod } from '@iden3/js-iden3-core';

export const NETWORK_FLAG_SHIB_MAINNET = 0x81; // Changed from 0x8002
export const NETWORK_FLAG_SHIB_TESTNET = 0x82; // Changed from 0x8001

export interface ShibariumConfig {
  puppynet: { rpcUrl: string; state: string };
  mainnet?: { rpcUrl: string; state: string };
}

export function registerShibariumDynamicDIDs(_cfg: ShibariumConfig) {
  // Use Iden3 method for independent Shibarium blockchain
  // This will create DIDs like: did:iden3:shibarium:testnet:...
  registerDidMethodNetwork({
    method: DidMethod.Iden3,
    blockchain: 'shibarium',
    chainId: 157,
    network: 'testnet',
    networkFlag: NETWORK_FLAG_SHIB_TESTNET
  });

  registerDidMethodNetwork({
    method: DidMethod.Iden3,
    blockchain: 'shibarium',
    chainId: 109,
    network: 'mainnet',
    networkFlag: NETWORK_FLAG_SHIB_MAINNET
  });
}
