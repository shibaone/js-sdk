/**
 * Shibarium test setup
 * This file runs before any tests to register Shibarium as a custom network
 */
import { registerShibariumDynamicDIDs } from '../../src/config/register-shibarium';

console.log('🔧 Registering Shibarium Puppynet...');

try {
  // Use the official registration function which registers:
  // - blockchain: 'shibarium'
  // - network: 'testnet' (for Puppynet, chain ID 157)
  // - network: 'mainnet' (for Mainnet, chain ID 109)
  registerShibariumDynamicDIDs({
    puppynet: {
      rpcUrl: 'https://puppynet.shibrpc.com',
      state: '0xBF2E9797ae55e66Ac6BdbF04859365C6F2155Fc0'
    }
  });

  console.log(`✅ Shibarium networks registered:
  - Blockchain: shibarium
  - Testnet (Puppynet): Chain ID 157, Network Flag: 0x82
  - Mainnet: Chain ID 109, Network Flag: 0x81
`);
} catch (error) {
  console.error('❌ Failed to register Shibarium:', error);
  throw error;
}
