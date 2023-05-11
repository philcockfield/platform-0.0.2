import { COLORS, Color, DEFAULTS, Icons, css, t } from './common';
import { PeerControls, PeerControlsClickHandler } from './ui.PeerControls';

export type PeerRowClickHandler = (e: PeerRowClickHandlerArgs) => void;
export type PeerRowClickHandlerArgs = { peerid: t.PeerId };

export type PeerRowProps = {
  peerid: t.PeerId;
  isSelf?: boolean;
  isSelected?: boolean;
  style?: t.CssValue;
  onSelect?: PeerRowClickHandler;
  onControlClick?: PeerControlsClickHandler;
};

export const PeerRow: React.FC<PeerRowProps> = (props) => {
  const { peerid, isSelected, isSelf = false } = props;

  /**
   * [Render]
   */
  const icoColor = Color.alpha(COLORS.DARK, 0.8);
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      userSelect: 'none',
      fontSize: DEFAULTS.fontSize,
      minHeight: DEFAULTS.minRowHeight,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
    }),
    icoPerson: css({
      transform: isSelf ? `scaleX(-1)` : undefined,
    }),
    left: css({
      display: 'grid',
      placeItems: 'center',
      gridTemplateColumns: 'auto auto auto 1fr',
      columnGap: 5,
    }),
    label: css({ opacity: 0.3 }),
    selected: css({
      Size: 5,
      borderRadius: 5,
      backgroundColor: COLORS.BLUE,
      opacity: isSelected ? 1 : 0,
    }),
  };

  const elLeft = (
    <div {...styles.left} onClick={() => props.onSelect?.({ peerid })}>
      <div {...styles.selected} />
      <Icons.Person size={15} color={icoColor} style={styles.icoPerson} />
      <div {...styles.label}>{isSelf ? 'me' : ''}</div>
      <div />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elLeft}
      <PeerControls peerid={peerid} onClick={props.onControlClick} />
    </div>
  );
};
