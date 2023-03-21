import { Color, css, t } from '../common';

export type MySampleProps = {
  text?: string;
  data?: t.Json;
  throwError?: boolean;
  style?: t.CssValue;
  onClick?: () => void;
};

let _count = 0;

export const MySample: React.FC<MySampleProps> = (props) => {
  if (props.throwError) {
    throw new Error('MySample: Intentional error');
  }

  const styles = {
    base: css({
      position: 'relative',
      fontFamily: 'sans-serif',
      display: 'grid',
      placeItems: 'center',
    }),
    body: css({
      position: 'relative',
      border: `solid 1px ${Color.format(-0.03)}`,
      boxSizing: 'border-box',
      padding: 8,
      minWidth: 300,
      minHeight: 200,
    }),
    render: css({ Absolute: [4, 5, null, null], fontSize: 11, opacity: 0.6 }),
    link: css({ Absolute: [null, 10, 10, null] }),
    data: css({ fontSize: 12 }),
  };

  _count++;
  const elRender = <div {...styles.render}>{`render-${_count}`}</div>;

  return (
    <div {...css(styles.base, props.style)} onClick={props.onClick}>
      <div {...styles.body}>
        <div>🐷 {props.text ?? 'MySample'}</div>
        <div {...styles.data}>
          <pre>state: {props.data ? JSON.stringify(props.data, null, '  ') : 'undefined'} </pre>
        </div>
        <a href={'?dev'} {...styles.link}>
          ?dev
        </a>
        {elRender}
      </div>
    </div>
  );
};
