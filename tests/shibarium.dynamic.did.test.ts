import { describe, it, expect } from 'vitest';
import { buildDIDType, DidMethod, DID } from '@iden3/js-iden3-core';

describe('Dynamic DIDs — Shibarium Puppynet', () => {
  it('registers Shibarium as an independent blockchain and creates DID', async () => {
    // Network already registered in setup file
    // Shibarium uses blockchain='shibarium' and network='testnet' for Puppynet
    // Using Iden3 method since Shibarium is an independent blockchain
    const blockchain = 'shibarium';
    const network = 'testnet';

    // Verify we can build a DID type with the registered network
    const didType = buildDIDType(DidMethod.Iden3, blockchain, network);
    expect(didType).toBeDefined();
    expect(didType.length).toBe(2);

    // Create a DID from identity state
    const state = BigInt('0x' + '1'.repeat(64));
    const did = DID.newFromIdenState(didType, state);

    // DID format will be: did:iden3:shibarium:testnet:...
    const didString = did.string();
    expect(didString.startsWith(`did:iden3:${blockchain}:${network}:`)).toBe(true);

    console.log('✅ Shibarium Puppynet DID created:', didString);
  });
});
