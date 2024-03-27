import { useEffect, useRef } from 'react';
import { RepoListRef } from './Ref';

import { Renderers } from './Renderers';
import { DEFAULTS, LabelItem, RenderCount, css, type t } from './common';
import { Wrangle } from './u.Wrangle';

export const View: React.FC<t.RepoListProps> = (props) => {
  const { tabIndex = DEFAULTS.tabIndex } = props;
  const list = Wrangle.listState(props.model);
  const behaviors = Wrangle.listBehaviors(props);

  const readyRef = useRef(false);
  const renderers = Renderers.init(props);
  const List = LabelItem.Stateful.useListController({ list, behaviors });

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (props.model && !readyRef.current) {
      const ref = RepoListRef(props.model);
      readyRef.current = true;
      props.onReady?.({ ref });
    }
  }, [!!props.model]);

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const elements = LabelItem.Model.List.map(list, (item, i) => {
    return (
      <LabelItem.Stateful
        {...List.item.handlers}
        key={item.instance}
        index={i}
        list={list}
        item={item}
        renderers={renderers}
        behaviors={List.item.behaviors}
      />
    );
  });

  return (
    <List.Provider>
      <div ref={List.ref} {...css(styles.base, props.style)} tabIndex={tabIndex}>
        {props.renderCount && <RenderCount {...props.renderCount} />}
        <div>{elements}</div>
      </div>
    </List.Provider>
  );
};
