import { Button } from './ui.Button';
import { Spec } from '../../test.ui';

export default Spec.describe('Button', (e) => {
  e.it('init', async (e) => {
    const ctx = Spec.ctx(e);
    ctx.component
      .display('grid')
      .size(250, undefined)
      .render((e) => {
        const right = <div>123</div>;
        return (
          <Button label={'My Button'} right={right} onClick={() => console.info(`⚡️ onClick`)} />
        );
      });
  });
});
