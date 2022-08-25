import { ViteConfig } from '../../../config.mjs';
import pkg from './package.json';
export default ViteConfig.default(__dirname, pkg.name, async (e) => {
  e.addExternalDependency(['sys.util', 'sys.test', 'sys.fs']);
});
