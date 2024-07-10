/**
 * 💦 THIS IS AN AUTOGENERATED FILE. DO NOT EDIT DIRECTLY 💦
 *
 *    This file is generated on each build.
 *    It reflects basic meta-data about the module and it's dependencies
 *    Use it via a standard `import` statement
 *
 *    - DO NOT manually edit.
 *    - DO commit to source-control.
 */

export const Pkg: ModuleDef = {
  name: 'ext.lib.automerge',
  version: '0.0.0',
  dependencies: {
    '@automerge/automerge': '2.2.4',
    '@automerge/automerge-repo': '1.2.0',
    '@automerge/automerge-repo-network-broadcastchannel': '1.2.0',
    '@automerge/automerge-repo-storage-indexeddb': '1.2.0',
    '@onsetsoftware/automerge-patcher': '0.13.0',
    'ext.lib.immer': '0.0.0',
    'react': '18.3.1',
    'react-dom': '18.3.1',
    'sys.cmd': '0.0.0',
    'sys.data.indexeddb': '0.0.0',
    'sys.util': '0.0.0',
    'sys.ui.react.common': '0.0.0',
    'sys.ui.react.common.list': '0.0.0',
    'uuid': '10.0.0',
  },
  toString() {
    return `${Pkg.name}@${Pkg.version}`;
  },
};

export type ModuleDef = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  toString(): string;
};
