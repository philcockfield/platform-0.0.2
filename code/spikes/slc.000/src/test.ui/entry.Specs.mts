export { Pkg } from '../index.pkg.mjs';

const importCommon = async () => {
  const { dev } = await import('sys.ui.react.common');
  const { Specs } = await dev();
  return {
    'sys.ui.common.Grid': Specs['sys.ui.common.Grid'],
    'sys.ui.common.Item.LabelItem': Specs['sys.ui.common.Item.LabelItem'],
    'sys.ui.common.Position': Specs['sys.ui.common.Position'],
    'sys.ui.common.Position.Selector': Specs['sys.ui.common.Position.Selector'],
  };
};

const importConcept = async () => {
  const { dev } = await import('sys.ui.react.concept');
  const { Specs } = await dev();
  return Specs;
};

export const Specs = {
  // SLC ("Social Lean Canvas")
  'slc.tests': () => import('./-TestRunner'),
  'slc.ui.Info': () => import('../ui/ui.Info/-dev/-SPEC'),
  'slc.IFrameRef': () => import('../ui/ui.IFrameRef/-SPEC'),

  // System
  'ext.ui.Stripe.Payment': () => import('../ui/ui.Payment.Stripe/-SPEC'),

  // External (3rd party).
  'slc.ext.Ember': () => import('../ui/ext.Ember/-dev/-SPEC'),
  'slc.ext.Ember.Stateful': () => import('../ui/ext.Ember/-dev/-SPEC.Stateful'),

  // system
  ...(await importCommon()),
  ...(await importConcept()),
};

export default Specs;
