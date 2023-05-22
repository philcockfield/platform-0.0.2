import { Color, COLORS, css, t } from '../common';

export type ChipProps = {
  text?: string;
  style?: t.CssValue;
};

export const Chip: React.FC<ChipProps> = (props) => {
  const { text = '' } = props;
  const isEmpty = !Boolean(text);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontFamily: 'monospace',
      fontWeight: 600,
      fontSize: 10,
      color: Color.alpha(COLORS.DARK, 0.8),
      borderRadius: 3,
      border: `solid 1px ${Color.alpha(COLORS.DARK, 0.1)}`,
      backgroundColor: Color.alpha(COLORS.DARK, 0.08),
      boxSizing: 'border-box',
      PaddingX: 2,
    }),
    empty: css({ opacity: 0.3 }),
    label: css({}),
  };

  const elEmpty = isEmpty && <div {...styles.empty}>{`(empty)`}</div>;
  const elLabel = !isEmpty && <div {...styles.label}>{text}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      {elEmpty}
      {elLabel}
    </div>
  );
};
