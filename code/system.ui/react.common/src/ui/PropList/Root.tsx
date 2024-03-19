import { Chip, DEFAULTS, FC, THEMES, type t } from './common';
import { Wrangle } from './u';

import { FieldSelector } from '../PropList.FieldSelector';
import { FieldBuilder } from './FieldBuilder';
import { View } from './ui';
import { Hash } from './ui.Item';

type Fields = {
  THEMES: typeof THEMES;
  DEFAULTS: typeof DEFAULTS;
  Wrangle: {
    title: typeof Wrangle.title;
    fields: typeof Wrangle.fields;
    toggleField: typeof Wrangle.toggleField;
  };
  builder<F extends string>(): t.PropListFieldBuilder<F>;
  FieldBuilder: typeof FieldBuilder;
  FieldSelector: typeof FieldSelector;
  Hash: typeof Hash;
  Chip: typeof Chip;
};

export const PropList = FC.decorate<t.PropListProps, Fields>(
  View,
  {
    THEMES,
    DEFAULTS,
    builder: FieldBuilder,
    FieldBuilder,
    FieldSelector,
    Hash,
    Chip,
    Wrangle: {
      title: Wrangle.title,
      fields: Wrangle.fields,
      toggleField: Wrangle.toggleField,
    },
  },
  { displayName: 'PropList' },
);
