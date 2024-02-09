import { type t } from './common';

export * from '../common';
export { Flip } from '../Flip';
export { CommandBar } from '../Command.Bar';

/**
 * Constants
 */

const command: t.ModuleLoaderCommandProps = {
  visible: true,
};

export const DEFAULTS = {
  displayName: 'ModuleLoader',
  command,
} as const;