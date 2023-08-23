import { Switch } from '../../Button.Switch';
import { Color, css, type t } from './common';

export type SwitchValueProps = {
  value: t.PropListValue;
  onClick: () => void;
};

export const SwitchValue: React.FC<SwitchValueProps> = (props) => {
  const item = props.value as t.PropListValueSwitch;
  if (item.kind !== 'Switch') return null;

  const styles = {
    base: css({ marginTop: 1 }),
  };

  const value = item.data;
  const isEnabled = typeof item.enabled === 'boolean' ? item.enabled : value !== undefined;

  return (
    <Switch
      height={12}
      value={value}
      enabled={isEnabled}
      track={Wrangle.track(item)}
      style={styles.base}
      onMouseDown={props.onClick}
    />
  );
};

/**
 * Helpers
 */
export const Wrangle = {
  track(item: t.PropListValueSwitch): Partial<t.SwitchTrack> | undefined {
    if (!item.color) return undefined;
    const color = {
      ...Switch.Theme.light.blue.trackColor,
      on: Color.format(item.color)!,
    };
    return { color };
  },
} as const;
