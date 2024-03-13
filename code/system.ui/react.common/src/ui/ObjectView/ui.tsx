import { ObjectInspector } from 'react-inspector';
import { css, DEFAULTS, type t } from './common';
import { Wrangle } from './u.Wrangle';
import { renderer } from './ui.Renderer';

export const View: React.FC<t.ObjectViewProps> = (props) => {
  const {
    name,
    sortObjectKeys,
    showNonenumerable = DEFAULTS.showNonenumerable,
    showRootSummary = DEFAULTS.showRootSummary,
    fontSize = DEFAULTS.font.size,
  } = props;
  const data = Wrangle.data(props);
  const { expandLevel, expandPaths } = Wrangle.expand(props);

  const styles = {
    base: css({
      position: 'relative',
      fontSize,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <ObjectInspector
        name={name}
        data={data}
        fontsize={fontSize}
        showNonenumerable={showNonenumerable}
        nodeRenderer={renderer({ showRootSummary })}
        sortObjectKeys={sortObjectKeys}
        theme={Wrangle.theme(props) as any}
        expandLevel={expandLevel}
        expandPaths={expandPaths}
      />
    </div>
  );
};