import { ViteConfig } from '../../../config.mjs';
export default ViteConfig.default(__dirname, (e) => {
  e.lib();
  e.environment('web');
  e.addExternalDependency(e.ctx.deps.map((d) => d.name));
});
