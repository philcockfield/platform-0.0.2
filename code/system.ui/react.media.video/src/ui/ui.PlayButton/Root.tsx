import { css, DEFAULTS, FC, Spinner, useMouseState, type t } from './common';
import { Wrangle } from './Wrangle.mjs';

const View: React.FC<t.PlayButtonProps> = (props) => {
  const {
    status = DEFAULTS.status,
    enabled = DEFAULTS.enabled,
    spinning = DEFAULTS.spinning,
  } = props;
  const Icon = Wrangle.icon(status);

  const mouse = useMouseState({
    onDown(e) {
      if (!enabled) return;
      const play = status === 'Play';
      const pause = status === 'Pause';
      const replay = status === 'Replay';
      const playing = (play || replay) && !pause;
      const is = { playing, paused: !playing };
      props.onClick?.({ status, play, pause, replay, is });
    },
  });
  const { isOver, isDown } = mouse;

  /**
   * [Render]
   */
  const { backgroundColor, borderColor, iconColor } = Wrangle.buttonColors(props, { isOver });
  const styles = {
    base: css({
      backgroundColor,
      transition: 'background-color 0.15s',
      border: `solid 1px ${borderColor}`,
      borderRadius: 4,
      boxSizing: 'border-box',
      width: DEFAULTS.width,
      height: DEFAULTS.height,
      PaddingY: 3,
      cursor: enabled ? 'pointer' : 'default',
      display: 'grid',
    }),
    body: css({
      display: 'grid',
      placeItems: 'center',
      transform: isDown && enabled ? 'translateY(1px)' : undefined,
      opacity: enabled ? 1 : 0.5,
      transition: 'opacity 0.15s',
    }),
  };

  const elIcon = Icon && !spinning && <Icon size={22} color={iconColor} />;
  const elSpinner = spinning && <Spinner.Bar color={iconColor} width={20} />;

  return (
    <div {...css(styles.base, props.style)} {...mouse.handlers}>
      <div {...styles.body}>
        {elIcon}
        {elSpinner}
      </div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULTS: typeof DEFAULTS;
};
export const PlayButton = FC.decorate<t.PlayButtonProps, Fields>(
  View,
  { DEFAULTS },
  { displayName: 'PlayButton' },
);
