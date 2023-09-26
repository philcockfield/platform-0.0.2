/**
 * 💦 THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY 💦
 *
 *    This file is generated on each build.
 *    It reflects basic meta-data about the module and it's dependencies
 *    Use it via a standard `import` statement
 *
 *    - DO NOT manually edit.
 *    - DO commit to source-control.
 */

export const Pkg: ModuleDef = {
  name: 'spike.automerge-repo.000',
  version: '0.0.0',
  dependencies: {
    '@automerge/automerge': '2.1.3',
    '@automerge/automerge-repo': '1.0.2',
    '@automerge/automerge-repo-network-broadcastchannel': '1.0.2',
    '@automerge/automerge-repo-react-hooks': '1.0.2',
    '@automerge/automerge-repo-storage-indexeddb': '1.0.2',
    'ext.lib.peerjs': '0.0.0',
    'peerjs': '1.5.0',
    'react': '18.2.0',
    'react-dom': '18.2.0',
    'sys.util': '0.0.0',
    'sys.ui.react.common': '0.0.0',
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
