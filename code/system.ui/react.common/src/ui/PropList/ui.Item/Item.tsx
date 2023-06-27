import { Color, css, DEFAULTS, Wrangle, type t } from './common';
import { PropListLabel } from './Label';
import { PropListValue } from './Value';

export type PropListItemProps = {
  data: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults: t.PropListDefaults;
  theme?: t.PropListTheme;
  style?: t.CssValue;
};

export const PropListItem: React.FC<PropListItemProps> = (props) => {
  const { data, isFirst, isLast, defaults } = props;
  const theme = Wrangle.theme(props.theme);
  const hasValue = Boolean(data.label);
  const selected = Wrangle.selected(data, theme.is.dark);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: selected ? Color.format(selected.color) : undefined,
      Flex: 'horizontal-start-spaceBetween',
      PaddingY: 4,
      minHeight: 16,
      fontSize: DEFAULTS.fontSize,
      borderBottom: `solid 1px ${theme.color.alpha(isLast ? 0 : 0.1)}`,
      ':first-child': { paddingTop: 2 },
      ':last-child': { border: 'none', paddingBottom: 2 },
    }),
  };

  return (
    <div {...styles.base} title={data.tooltip}>
      {hasValue && <PropListLabel data={data} defaults={defaults} theme={props.theme} />}
      <PropListValue
        item={data}
        isFirst={isFirst}
        isLast={isLast}
        defaults={defaults}
        theme={props.theme}
      />
    </div>
  );
};
