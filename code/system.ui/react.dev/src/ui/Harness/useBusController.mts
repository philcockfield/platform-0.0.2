import { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs/operators';

import { DevBus } from '../../ui.Bus';
import { rx, slug, t, Time, R } from '../common';

type Id = string;

/**
 * Hook: UI Controller setup and lifecycle.
 */
export function useBusController(
  options: { bus?: t.EventBus; id?: Id; bundle?: t.BundleImport; runOnLoad?: boolean } = {},
) {
  const id = options.id ?? useRef(`dev.instance.${slug()}`).current;
  const bus = options.bus ?? useRef(rx.bus()).current;
  const instance = { bus, id };
  const busid = rx.bus.instance(bus);
  const hasBundle = Boolean(options.bundle);

  const [info, setInfo] = useState<t.DevInfo>(DevBus.DEFAULT.INFO);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const controller = DevBus.Controller({ instance });
    controller.info.changed$.pipe(filter((e) => Boolean(e.info))).subscribe((e) => setInfo(e.info));

    /**
     * Initialize.
     */
    Time.delay(0, async () => {
      await controller.load.fire(options.bundle);
      if (options.runOnLoad) {
        controller.run.fire();
      }
    });

    return () => controller.dispose();
  }, [id, busid, hasBundle]);

  /**
   * API
   */
  return { instance, info };
}
