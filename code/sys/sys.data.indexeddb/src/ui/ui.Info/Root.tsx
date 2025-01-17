import { DEFAULTS, FC, Pkg, PropList, type t } from './common';
import { fieldModuleVerify } from './field.Module.Verify';

/**
 * Component
 */
const View: React.FC<t.InfoProps> = (props) => {
  const { data = {} } = props;
  const fields = PropList.fields(props.fields, DEFAULTS.fields.default);

  const items = PropList.builder<t.InfoField>()
    .field('Module', { label: 'Module', value: `${Pkg.name}@${Pkg.version}` })
    .field('Module.Verify', () => fieldModuleVerify(data))
    .items(fields);

  return (
    <PropList
      title={PropList.Info.title(props)}
      items={items}
      width={PropList.Info.width(props)}
      margin={props.margin}
      style={props.style}
    />
  );
};

/**
 * Export
 */
type Fields = { DEFAULTS: typeof DEFAULTS };
export const Info = FC.decorate<t.InfoProps, Fields>(
  View,
  { DEFAULTS },
  { displayName: DEFAULTS.displayName },
);
