import { css, t, useRenderer } from '../common';
import { Wrangle } from './Wrangle.mjs';

export type DebugPanelBarProps = {
  instance: t.DevInstance;
  edge: 'Top' | 'Bottom';
  current?: t.DevRenderPropsDebugBar;
  style?: t.CssValue;
};

export const DebugPanelBar: React.FC<DebugPanelBarProps> = (props) => {
  const { instance, current, edge } = props;
  const renderer = current?.renderer;
  const { element } = useRenderer(instance, renderer);

  if (!renderer) return <div />;

  const styles = {
    base: css({
      boxSizing: 'border-box',
      padding: current?.padding,
      borderTop: edge === 'Bottom' && Wrangle.borderStyle(current),
      borderBottom: edge === 'Top' && Wrangle.borderStyle(current),
    }),
  };

  return <div {...css(styles.base, props.style)}>{element}</div>;
};

/**
 * Header
 */
export type DebugPanelHeaderProps = Omit<DebugPanelBarProps, 'edge'>;
export const DebugPanelHeader: React.FC<DebugPanelHeaderProps> = (props) => {
  return <DebugPanelBar {...props} edge={'Top'} />;
};

/**
 * Footer
 */
export type DebugPanelFooterProps = Omit<DebugPanelBarProps, 'edge'>;
export const DebugPanelFooter: React.FC<DebugPanelFooterProps> = (props) => {
  return <DebugPanelBar {...props} edge={'Bottom'} />;
};
