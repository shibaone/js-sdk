/**
 * Generate a Verifier DID for Shibarium Puppynet
 *
 * This script creates an Ethereum-based DID that is deterministically tied to your Ethereum address.
 * The same Ethereum address will always generate the same DID.
 *
 * Usage:
 *   WALLET_KEY=0xYourPrivateKey npm run generate:verifier-did
 *
 * Or set it in a .env file in the js-sdk directory.
 */

import { Wallet, JsonRpcProvider } from 'ethers';
import { sha256 } from '@iden3/js-crypto';
import { registerDidMethodNetwork, DidMethod } from '@iden3/js-iden3-core';
import {
  IdentityWallet,
  CredentialWallet,
  InMemoryPrivateKeyStore,
  KMS,
  KmsKeyType,
  BjjProvider,
  Sec256k1Provider,
  IdentityStorage,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  CredentialStorage,
  CredentialStatusType,
  EthStateStorage
} from '@0xpolygonid/js-sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const addrs = JSON.parse(readFileSync(join(__dirname, '../../addresses.puppynet.json'), 'utf8'));

async function generateVerifierDID() {
  console.log('🚀 Generating Verifier DID for Shibarium Puppynet...\n');

  // Register Shibarium network
  registerDidMethodNetwork({
    method: DidMethod.Iden3,
    blockchain: 'shibarium',
    chainId: 157,
    network: 'testnet',
    networkFlag: 0x82 // Shibarium Puppynet
  });

  console.log('✅ Shibarium Puppynet network registered');
  console.log(`   RPC: ${addrs.rpcUrl}`);
  console.log(`   State Contract: ${addrs.state}\n`);

  // Get private key from environment
  const WALLET_KEY = process.env.WALLET_KEY;
  if (!WALLET_KEY) {
    console.error('❌ Error: WALLET_KEY environment variable not set');
    console.error('Usage: WALLET_KEY=0xYourPrivateKey npm run generate:verifier-did');
    process.exit(1);
  }

  // Validate private key format
  if (!WALLET_KEY.startsWith('0x') || WALLET_KEY.length !== 66) {
    console.error('❌ Error: Invalid private key format');
    console.error('Private key must be 64 hex characters with 0x prefix (66 chars total)');
    process.exit(1);
  }

  // Setup Ethereum provider and signer
  const provider = new JsonRpcProvider(addrs.rpcUrl);
  const ethSigner = new Wallet(WALLET_KEY, provider);

  console.log('📝 Ethereum Wallet Info:');
  console.log(`   Address: ${ethSigner.address}\n`);

  // Setup KMS with both BJJ and Secp256k1 providers
  const keyStore = new InMemoryPrivateKeyStore();
  const kms = new KMS();
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, new BjjProvider(KmsKeyType.BabyJubJub, keyStore));
  kms.registerKeyProvider(
    KmsKeyType.Secp256k1,
    new Sec256k1Provider(KmsKeyType.Secp256k1, keyStore)
  );

  // Setup state storage with actual blockchain connection
  const stateStorage = new EthStateStorage({
    url: addrs.rpcUrl,
    contractAddress: addrs.state,
    defaultGasLimit: 600000,
    confirmationBlockCount: 5,
    confirmationTimeout: 600000,
    receiptTimeout: 600000,
    rpcResponseTimeout: 5000,
    waitReceiptCycleTime: 30000,
    waitBlockCycleTime: 3000,
    chainId: 157
  });

  // Setup storage
  const dataStorage = {
    identity: new IdentityStorage(
      new InMemoryDataSource(),
      new InMemoryDataSource()
    ),
    mt: new InMemoryMerkleTreeStorage(40),
    credential: new CredentialStorage(new InMemoryDataSource()),
    states: stateStorage
  };

  // Create credential wallet
  const credentialWallet = new CredentialWallet(dataStorage, null);

  // Create identity wallet
  const identityWallet = new IdentityWallet(kms, dataStorage, credentialWallet);
  console.log('✅ Identity wallet initialized\n');

  // Generate deterministic seed from private key
  // This ensures the same private key always generates the same auth credential
  const seedBytes = sha256(Buffer.from(WALLET_KEY.slice(2), 'hex'));

  console.log('🔑 Creating Ethereum-based DID...');
  console.log('   This will take a few seconds...\n');

  // Create Ethereum-based identity
  // The DID is deterministically derived from the Ethereum address
  const { did, credential } = await identityWallet.createEthereumBasedIdentity({
    method: DidMethod.Iden3,
    blockchain: 'shibarium',
    networkId: 'testnet', // Puppynet
    seed: seedBytes,
    ethSigner: ethSigner,
    createBjjCredential: true, // Create BJJ auth credential for ZK proofs
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: 'https://rhs-staging.polygonid.me' // Default RHS, can be changed
    }
  });

  console.log('✅ DID Generated Successfully!\n');
  console.log('='.repeat(80));
  console.log('📋 VERIFIER DID INFORMATION');
  console.log('='.repeat(80));
  console.log(`Ethereum Address:  ${ethSigner.address}`);
  console.log(`DID:               ${did.string()}`);
  console.log(`Auth Credential:   ${credential?.id || 'N/A'}`);
  console.log('='.repeat(80));

  console.log('\n📝 Add this to your verifier-backend .env file:\n');
  console.log(`VERIFIER_BACKEND_SHIB_TESTNET_SENDER_DID=${did.string()}`);

  console.log('\n💡 Notes:');
  console.log('   • This DID is deterministically tied to your Ethereum address');
  console.log('   • The same address will always generate the same DID');
  console.log('   • You can regenerate this DID anytime using the same private key');
  console.log('   • The identity state has been published to the Shibarium blockchain');
  console.log('   • DID format: did:iden3:shibarium:testnet:...');

  console.log('\n✨ Done! Your verifier DID is ready to use.\n');
}

// Run the script
generateVerifierDID().catch((error) => {
  console.error('\n❌ Error generating verifier DID:', error.message);
  console.error(error);
  process.exit(1);
});
