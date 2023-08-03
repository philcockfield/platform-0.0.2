export { Pkg } from '../index.pkg.mjs';

export const Specs = {
  'sys.ui.concept.tests': () => import('./-TestRunner'),
  'sys.ui.concept.Info': () => import('../ui/ui.Info/-dev/-SPEC'),
  'sys.ui.concept.PlayBar': () => import('../ui/ui.PlayBar/-SPEC'),
  'sys.ui.concept.ScreenLayout': () => import('../ui/ui.Layout.Screen/-dev/-SPEC'),
  'sys.ui.concept.Layout.SplitHorizon': () => import('../ui/ui.Layout.SplitHorizon/-SPEC'),
  'sys.ui.concept.TooSmall': () => import('../ui/ui.TooSmall/-SPEC'),

  '__sys.ui.concept.VideoDiagram': () => import('../ui/ui.VideoDiagram__/-SPEC'),
  '__sys.ui.concept.VideoLayout': () => import('../ui/ui.VideoLayout__/-SPEC'),
};

export default Specs;
