import { DEFAULTS, PropList, type t } from './common';

export type BehaviorSelectorHandler = (e: BehaviorSelectorHandlerArgs) => void;
export type BehaviorSelectorHandlerArgs = {
  previous?: t.LabelItemBehaviorKind[];
  next?: t.LabelItemBehaviorKind[];
};

export type BehaviorSelectorProps = {
  title?: string;
  selected?: t.LabelItemBehaviorKind[];
  style?: t.CssValue;
  onClick?: t.PropListFieldSelectorClickHandler;
  onChange?: BehaviorSelectorHandler;
};

export const BehaviorSelector: React.FC<BehaviorSelectorProps> = (props) => {
  const { title = 'Behavior Controllers' } = props;
  return (
    <PropList.FieldSelector
      style={props.style}
      title={title}
      all={DEFAULTS.useBehaviors.all}
      defaults={DEFAULTS.useBehaviors.defaults}
      selected={props.selected}
      indexes={true}
      resettable={true}
      indent={20}
      onClick={(e) => {
        const { previous, next } = e.as<t.LabelItemBehaviorKind>();
        props.onChange?.({ previous, next });
        props.onClick?.(e);
      }}
    />
  );
};
