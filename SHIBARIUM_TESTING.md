# Shibarium Identity Stack - JS SDK Testing Guide

This guide explains how to test the Polygon ID JS SDK with your deployed Shibarium contracts on Puppynet.

## Prerequisites

1. ✅ Identity contracts deployed on Puppynet (chain ID 157)
2. ✅ Reverse Hash Service (RHS) running locally or accessible
3. ✅ Node.js >= 20.11.0
4. ✅ Test wallet with Puppynet BONE tokens

## Deployed Contracts (Puppynet)

From `iden3-contracts/ignition/deployments/chain-157/deployed_addresses.json`:

```
State Contract:         0xBF2E9797ae55e66Ac6BdbF04859365C6F2155Fc0
UniversalVerifier:      0xbbe69e23e8579b69D7e73e77Ac250e183CA7779e
IdentityTreeStore:      0xD8c3C751dfB270A77B2023791c818B40E8Aaf578
```

## Step 1: Configure Environment

```bash
cd js-sdk
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Shibarium Puppynet
RPC_URL=https://puppynet.shibrpc.com
STATE_CONTRACT_ADDRESS=0xBF2E9797ae55e66Ac6BdbF04859365C6F2155Fc0
IDENTITY_TREE_STORE_ADDRESS=0xD8c3C751dfB270A77B2023791c818B40E8Aaf578
UNIVERSAL_VERIFIER_ADDRESS=0xbbe69e23e8579b69D7e73e77Ac250e183CA7779e

# RHS Configuration
# If running locally from reverse-hash-service:
RHS_URL=http://localhost:8080

# OR if using deployed RHS:
# RHS_URL=https://your-rhs-domain.com

# Wallet (get from MetaMask or create new test wallet)
WALLET_KEY=0xyour_private_key_here

# IPFS
IPFS_URL=https://ipfs.io/ipfs/

# Chain
CHAIN_ID=157
NETWORK_FLAG=0x8001
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run Basic Shibarium Test

Test that the Shibarium network registration works:

```bash
npm run test:shibarium
```

Expected output:
```
✓ registers and creates a did:polygonid:shibarium:testnet DID
```

## Step 4: Run Full Test Suite

```bash
npm test
```

This will run all tests including:
- DID creation and registration
- Credential issuance
- Proof generation
- Verification
- State transitions

## Test Scenarios

### Scenario 1: DID Registration (✅ Already Working)

The basic test in `tests/shibarium.dynamic.did.test.ts` verifies:
- Network registration with chain ID 157
- DID format: `did:polygonid:shibarium:testnet:...`
- DID creation from identity state

```bash
npm run test:shibarium
```

### Scenario 2: Identity Creation with Shibarium Contracts

Test identity creation using deployed State contract:

```typescript
import { registerDidMethodNetwork, DidMethod, Blockchain, NetworkId } from '@iden3/js-iden3-core';

// Register Shibarium
registerDidMethodNetwork({
  method: DidMethod.PolygonId,
  blockchain: 'shibarium',
  chainId: 157,
  network: 'testnet',
  networkFlag: 0x8001
});

// Create identity wallet with Shibarium config
const { did } = await identityWallet.createIdentity({
  method: DidMethod.PolygonId,
  blockchain: 'shibarium' as Blockchain,
  networkId: 'testnet' as NetworkId,
  seed: seedPhrase,
  revocationOpts: {
    type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    id: process.env.RHS_URL
  }
});
```

### Scenario 3: State Publishing

Publish identity state to Puppynet State contract:

```typescript
const txId = await identityWallet.publishState(did, {
  rpcUrl: process.env.RPC_URL,
  contractAddress: process.env.STATE_CONTRACT_ADDRESS,
  privateKey: process.env.WALLET_KEY
});
```

### Scenario 4: Credential Issuance

Issue a verifiable credential:

```typescript
const credential = await identityWallet.issueCredential({
  issuerDID: issuerDid,
  subjectDID: userDid,
  schema: credentialSchema,
  type: 'KYCAgeCredential',
  credentialSubject: {
    id: userDid.string(),
    birthday: 19960424,
    documentType: 99
  },
  revocationOpts: {
    type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    id: process.env.RHS_URL
  }
});
```

### Scenario 5: Proof Generation & Verification

Generate and verify ZK proofs:

```typescript
// Generate proof
const zkProof = await proofService.generateProof({
  credential,
  request: authRequest,
  did: userDid
});

// Verify proof on-chain
const isValid = await verifier.verifyProof({
  proof: zkProof,
  query: verificationQuery,
  verifierAddress: process.env.UNIVERSAL_VERIFIER_ADDRESS
});
```

## Test Files to Create

### 1. Identity Lifecycle Test
**File**: `tests/shibarium/identity.lifecycle.test.ts`

Tests:
- Identity creation on Shibarium
- State publishing to Puppynet
- State retrieval from State contract
- Identity updates

### 2. Credential Issuance Test
**File**: `tests/shibarium/credential.issuance.test.ts`

Tests:
- Credential schema registration
- Credential issuance
- Credential storage
- Revocation status check via RHS

### 3. Proof Generation Test
**File**: `tests/shibarium/proof.generation.test.ts`

Tests:
- ZK proof generation for age verification
- ZK proof generation for country verification
- Proof verification locally
- Proof verification on-chain (UniversalVerifier)

### 4. Integration Test
**File**: `tests/shibarium/integration.test.ts`

End-to-end flow:
1. Create issuer identity
2. Create user identity
3. Issue credential
4. Generate proof request
5. User generates proof
6. Verify proof on-chain

## Running Specific Tests

```bash
# Run only Shibarium tests
npm run test:shibarium

# Run all tests
npm test

# Run with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test tests/shibarium/identity.lifecycle.test.ts

# Run tests matching a pattern
npm test -- -t "identity creation"
```

## Debugging

### Enable Debug Logs

```typescript
import { setLogLevel } from '@0xpolygonid/js-sdk';

// In your test setup
setLogLevel('debug');
```

### Check Contract Deployment

Verify contracts are accessible:

```bash
# Check State contract
cast call $STATE_CONTRACT_ADDRESS "getGISTRoot()" --rpc-url https://puppynet.shibrpc.com

# Check UniversalVerifier
cast call $UNIVERSAL_VERIFIER_ADDRESS "version()" --rpc-url https://puppynet.shibrpc.com
```

### Common Issues

**1. "Identity does not exist" error**
- State not published yet
- Wrong State contract address
- Network mismatch

**2. RHS connection failures**
- RHS not running
- Wrong RHS_URL in .env
- Firewall blocking localhost:8080

**3. Transaction failures**
- Insufficient BONE tokens
- Wrong WALLET_KEY
- Network congestion

**4. Proof verification failures**
- Query mismatch
- Credential revoked
- Wrong validator address

## Next Steps

After basic tests pass:

1. **Create Integration Tests**: Test full identity lifecycle
2. **Test with Real RHS**: Deploy RHS and update RHS_URL
3. **Test Revocation**: Revoke credentials and verify it works
4. **Stress Testing**: Create multiple identities, issue many credentials
5. **Frontend Integration**: Integrate with wallet UI

## Example: Complete Integration Test

```typescript
import { describe, it, before, expect } from 'vitest';
import { registerDidMethodNetwork, DidMethod } from '@iden3/js-iden3-core';
import { IdentityWallet, CredentialStorage, ... } from '@0xpolygonid/js-sdk';

describe('Shibarium Integration - Complete Flow', () => {
  let issuerWallet, userWallet;

  before(async () => {
    // Register Shibarium network
    registerDidMethodNetwork({
      method: DidMethod.PolygonId,
      blockchain: 'shibarium',
      chainId: 157,
      network: 'testnet',
      networkFlag: 0x8001
    });

    // Initialize wallets
    issuerWallet = await createWallet();
    userWallet = await createWallet();
  });

  it('should complete full identity flow', async () => {
    // 1. Create identities
    const issuerDid = await issuerWallet.createIdentity({...});
    const userDid = await userWallet.createIdentity({...});

    // 2. Publish states
    await issuerWallet.publishState(issuerDid, {...});
    await userWallet.publishState(userDid, {...});

    // 3. Issue credential
    const credential = await issuerWallet.issueCredential({...});

    // 4. Generate proof
    const proof = await userWallet.generateProof({...});

    // 5. Verify on-chain
    const isValid = await verifyOnChain(proof);

    expect(isValid).toBe(true);
  });
});
```

## Resources

- **Polygon ID Docs**: https://docs.polygon.technology/polygon-id/
- **JS SDK Repo**: https://github.com/0xPolygonID/js-sdk
- **iden3 Protocol**: https://docs.iden3.io/
- **Shibarium Docs**: https://docs.shibarium.org/

## Support

For issues specific to Shibarium integration:
- Check RHS logs: `docker compose logs -f` in reverse-hash-service
- Verify contract addresses in deployment JSON
- Test RPC connectivity: `curl https://puppynet.shibrpc.com`
- Check wallet balance on Puppynet explorer

---

**Last Updated**: 2025-11-03
**Network**: Shibarium Puppynet (Chain ID 157)
**Status**: Ready for testing
