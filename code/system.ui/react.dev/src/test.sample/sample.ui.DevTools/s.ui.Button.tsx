import { useState } from 'react';
import { Color, COLORS, css, t } from '../common';

export type ButtonSampleClickHandler = (e: ButtonSampleClickHandlerArgs) => void;
export type ButtonSampleClickHandlerArgs = { ctx: t.DevCtx; label: string };

export type ButtonProps = {
  ctx: t.DevCtx;
  label?: string;
  style?: t.CssValue;
  onClick?: ButtonSampleClickHandler;
};

let _renderCount = 0;

export const ButtonSample: React.FC<ButtonProps> = (props) => {
  const { ctx, label = 'Unnamed' } = props;

  const [isDown, setDown] = useState(false);
  const down = (isDown: boolean) => () => setDown(isDown);

  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => {
    setOver(isOver);
    if (isOver === false) setDown(false);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      color: COLORS.DARK,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      userSelect: 'none',
      transform: `translateY(${isDown ? 1 : 0}px)`,
      cursor: 'pointer',
      display: 'inline-grid',
      gridTemplateColumns: 'auto 1fr',
      columnGap: 4,
    }),
    icon: {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        display: 'grid',
        justifyContent: 'center',
        alignContent: 'start',
      }),
      image: css({
        Size: 22,
        backgroundColor: Color.alpha(COLORS.MAGENTA, 0.2),
        border: `dashed 1px ${Color.format(-0.3)}`,
        borderRadius: 3,
        margin: 2,
      }),
    },
    body: css({
      margin: 1,
      color: isOver ? COLORS.BLUE : COLORS.DARK,
      display: 'grid',
      alignContent: 'center',
      justifyContent: 'start',
    }),
    render: css({
      Absolute: [2, 4, null, null],
      fontSize: 11,
      opacity: 0.6,
    }),
  };

  return (
    <div
      {...css(styles.base, props.style)}
      onClick={() => props.onClick?.({ ctx, label })}
      onMouseDown={down(true)}
      onMouseUp={down(false)}
      onMouseEnter={over(true)}
      onMouseLeave={over(false)}
    >
      <div {...styles.icon.base}>
        <div {...styles.icon.image} />
      </div>
      <div {...styles.body}>{label}</div>
      <div {...styles.render}>render-{_renderCount++}</div>
    </div>
  );
};
