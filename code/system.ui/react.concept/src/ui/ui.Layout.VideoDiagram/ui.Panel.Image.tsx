import { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, DEFAULTS, FC, rx, type t } from './common';

export type ImagePanelProps = {
  style?: t.CssValue;
};

export const ImagePanel: React.FC<ImagePanelProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      padding: 5,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>{`🐷 ImagePanel`}</div>
    </div>
  );
};
