import addrs from '../../addresses.puppynet.json';
import { registerShibariumDynamicDIDs } from './config/register-shibarium';

export function bootstrapNetworks() {
  registerShibariumDynamicDIDs({
    puppynet: { rpcUrl: addrs.rpcUrl, state: addrs.state }
  });
}
