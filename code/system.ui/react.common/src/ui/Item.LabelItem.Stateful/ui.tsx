import { DEFAULTS, type t } from './common';

import { LabelItem } from '../Item.LabelItem/Root';
import { useItemController } from './use';

/**
 * Sample of using the behavior controller hooks.
 */
export const View: React.FC<t.LabelItemStatefulProps> = (props) => {
  const { list, item, onChange, useBehaviors = DEFAULTS.useBehaviors.defaults } = props;
  const isSelected = item && list && item.instance === list.current.selected;
  const isFocused = isSelected && list?.current.focused;

  /**
   * Roll-up controller.
   */
  const controller = useItemController({
    item,
    list,
    onChange,
    useBehaviors,
  });

  const { data, handlers } = controller;

  /**
   * Render
   */
  return (
    <LabelItem
      {...handlers}
      style={props.style}
      label={data.label}
      placeholder={data.placeholder}
      left={data.left}
      right={data.right}
      enabled={data.enabled}
      editing={data.editing}
      selected={isSelected}
      focused={isFocused}
      focusOnEdit={true}
      renderCount={props.renderCount}
    />
  );
};
