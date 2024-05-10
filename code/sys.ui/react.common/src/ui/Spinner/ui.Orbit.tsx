import { css, type t } from './common';
import { Wrangle } from './u';
import { useImporter } from './use.Importer';

export type SpinnerOrbitProps = {
  size?: number;
  color?: string | number;
  theme?: t.CommonTheme;
  style?: t.CssValue;
};

type P = {
  loading?: boolean;
  size?: number;
  color?: string;
  cssOverride?: t.CSSProperties;
};

export const SpinnerOrbit: React.FC<SpinnerOrbitProps> = (props) => {
  const { size = 32 } = props;
  const { Spinner } = useImporter<P>(import('react-spinners/MoonLoader'));
  if (!Spinner) return null;

  /**
   * [Render]
   */
  const color = Wrangle.color(props);
  const override: t.CSSProperties = {};
  const styles = { base: css({ position: 'relative' }) };

  return (
    <div {...css(styles.base, props.style)}>
      <Spinner color={color} loading={true} size={size} cssOverride={override} />
    </div>
  );
};