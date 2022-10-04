import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, t, rx, FC } from '../../common/index.mjs';
import { Filesystem } from '../../main/Filesystem.mjs';

import iconLogoUrl from '../../assets/favicon.png?url';

export type AppBodyProps = { style?: t.CssValue };

export const AppBody: React.FC<AppBodyProps> = (props) => {
  /**
   * Handlers
   */
  const onSampleFilesystemClick = async () => {
    await Filesystem.tmpSample();
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      color: COLORS.DARK,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
    }),
    logoCellIcon: css({
      width: 189,
      height: 189,
      pointerEvents: 'none',
      marginBottom: 50,
    }),
    logoCellFlat: css({
      position: 'absolute',
      top: 20,
      right: 25,
      width: 50,
      height: 50,
      pointerEvents: 'none',
      opacity: 0.2,
    }),
    titleCell: css({
      position: 'absolute',
      bottom: 20,
      left: 25,
      fontSize: 50,
      fontWeight: 'bold',
      letterSpacing: '-0.03em',
      pointerEvents: 'none',
    }),
    titleRuntime: css({
      position: 'absolute',
      bottom: 20,
      right: 25,
      fontSize: 22,
    }),
    divider: css({
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 90,
      height: 10,
      backgroundColor: COLORS.DARK,
      opacity: 0.0,
    }),
    tmp: css({
      Absolute: [20, null, null, 20],
      cursor: 'pointer',
      ':hover': { color: COLORS.BLUE },
    }),
  };

  return (
    <div {...css(styles.base, props.style)} data-tauri-drag-region>
      <img src={iconLogoUrl} {...styles.logoCellIcon} />
      <div {...styles.divider} />
      <div {...styles.titleCell}>cell</div>
      <div {...styles.titleRuntime}>
        <span style={{ opacity: 0.2 }}>system.</span>runtime
      </div>
      <div {...styles.tmp}>
        <div onClick={onSampleFilesystemClick}>run: fs sample</div>
      </div>
    </div>
  );
};
