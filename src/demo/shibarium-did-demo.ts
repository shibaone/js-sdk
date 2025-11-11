import { bootstrapNetworks } from '../bootstrap';
import {
  core,
  IdentityWallet,
  InMemoryPrivateKeyStore,
  KMS,
  KmsKeyType,
  BjjProvider,
  IdentityStorage,
  InMemoryDataSource,
  Identity,
  Profile
} from '../index';

async function main() {
  bootstrapNetworks();

  const idStore = new IdentityStorage(
    new InMemoryDataSource<Identity>(),
    new InMemoryDataSource<Profile>()
  );
  const ks = new InMemoryPrivateKeyStore();
  const kms = new KMS();
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, new BjjProvider(KmsKeyType.BabyJubJub, ks));
  const iw = new IdentityWallet(kms, { identity: idStore } as any, {} as any, {} as any);

  const { did } = await iw.createIdentity({
    method: core.DidMethod.PolygonId,
    blockchain: 'shibarium',
    network: 'testnet',
    seed: core.getRandomBytes(32)
  });
  console.log('Created DID:', did);

  const doc = await core.did.resolve(did);
  console.log('Resolved DID document:', JSON.stringify(doc, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
