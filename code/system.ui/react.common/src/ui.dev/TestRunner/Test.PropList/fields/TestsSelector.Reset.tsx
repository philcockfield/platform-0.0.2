import { type t } from '../common';
import { Util } from '../u';
import { SpecsReset } from '../ui/Specs.Reset';

/**
 * Reset row.
 */
export function FieldTestsSelectorReset(args: {
  fields: t.TestRunnerField[];
  data: t.TestPropListData;
  groups: t.TestSuiteGroup[];
  enabled: boolean;
  theme?: t.CommonTheme;
}): t.PropListItem | undefined {
  if (!Util.isSelectable(args.data)) return;

  const el = (
    <SpecsReset data={args.data} groups={args.groups} enabled={args.enabled} theme={args.theme} />
  );

  return { value: el };
}
