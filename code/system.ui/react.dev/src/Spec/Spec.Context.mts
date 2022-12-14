import { Margin, slug, t } from '../common';
import { BusEvents } from '../ui.Bus/Bus.Events.mjs';
import { State } from './Spec.Context.State.mjs';

type O = Record<string, unknown>;

const DEFAULT = {
  get props(): t.SpecRenderProps {
    return {
      id: `render.${slug()}`,
      host: {},
      component: {},
      debug: { main: { elements: [] } },
    };
  },
};

/**
 * Information object passed as the {ctx} to tests.
 */
export const SpecContext = {
  /**
   * Generate a new set of arguments used to render a spec/component.
   */
  create(
    instance: t.DevInstance,
    options: { dispose$?: t.Observable<any> } = {},
  ): t.SpecCtxWrapper {
    const id = `dev.ctx.${slug()}`;
    const events = BusEvents({ instance, dispose$: options.dispose$ });
    const { dispose, dispose$ } = events;

    let _props = DEFAULT.props;

    /**
     * The component subject (being controlled by the spec).
     */
    const component: t.SpecCtxComponent = {
      render(el) {
        _props.component.element = el;
        return component;
      },

      size(...args) {
        _props.component.size = undefined;

        if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
          _props.component.size = { mode: 'center', width: args[0], height: args[1] };
        }

        if (args[0] === 'fill' || args[0] === 'fill-x' || args[0] === 'fill-y') {
          const margin = Margin.wrangle(args[1] ?? 50);
          _props.component.size = { mode: 'fill', margin, x: true, y: true };
          if (args[0] === 'fill-x') _props.component.size.y = false;
          if (args[0] === 'fill-y') _props.component.size.x = false;
        }

        return component;
      },

      display(value) {
        _props.component.display = value;
        return component;
      },

      backgroundColor(value) {
        _props.component.backgroundColor = value;
        return component;
      },
    };

    /**
     * The host container of the subject component.
     */
    const host: t.SpecCtxHost = {
      backgroundColor(color) {
        _props.host.backgroundColor = color;
        return host;
      },
    };

    /**
     * The debug panel containing UI reporting the state of the
     * component and controls for live manipulation of the compoonent.
     */
    const debug: t.SpecCtxDebug = {
      /**
       * TODO 🐷
       */
      TEMP(el) {
        _props.debug.main.elements.push(el);
        return debug;
      },
    };

    /**
     * The context object passed into the spec.
     */
    const ctx: t.SpecCtx = {
      component,
      host,
      debug,

      toObject() {
        return {
          instance,
          props: { ..._props },
        };
      },

      async run(options = {}) {
        const { only } = options;
        if (options.reset) await events.reset.fire();
        const res = await events.run.fire({ only });
        return res.info ?? (await events.info.get());
      },

      async reset() {
        const res = await events.reset.fire();
        return res.info ?? (await events.info.get());
      },

      state<T extends O>(initial: T) {
        return State.create<T>({ initial, events });
      },
    };

    /**
     * API.
     */
    return {
      id,
      instance,
      dispose,
      dispose$,
      ctx,
      get props() {
        return _props;
      },
    };
  },
};
