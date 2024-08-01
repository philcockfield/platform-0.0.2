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
  name: 'dev.000',
  version: '0.6.195',
  dependencies: {
    '@automerge/automerge': '2.2.7',
    '@automerge/automerge-repo': '1.2.1',
    '@automerge/automerge-repo-network-messagechannel': '1.2.1',
    '@automerge/automerge-repo-storage-indexeddb': '1.2.1',
    '@privy-io/react-auth': '1.76.5',
    '@standard-crypto/farcaster-js': '7.4.0',
    'automerge-repo-network-peerjs': '1.2.1',
    'buffer': '6.0.3',
    'ext.lib.ai.openai': '0.0.0',
    'ext.lib.automerge': '0.0.0',
    'ext.lib.automerge.webrtc': '0.0.0',
    'ext.lib.deno': '0.0.0',
    'ext.lib.monaco': '0.0.0',
    'ext.lib.monaco.crdt': '0.0.0',
    'ext.lib.peerjs': '0.0.0',
    'ext.lib.privy': '0.0.0',
    'ext.lib.reactflow': '0.0.0',
    'ext.lib.stripe': '0.0.0',
    'ext.lib.vimeo': '0.0.0',
    'ext.lib.wasmer': '0.0.0',
    'react': '18.3.1',
    'react-dom': '18.3.1',
    'slc.000': '0.0.0',
    'sys.cmd': '0.0.0',
    'sys.data.indexeddb': '0.0.0',
    'sys.data.text': '0.0.0',
    'sys.ui.react.common': '0.0.0',
    'sys.ui.react.common.list': '0.0.0',
    'sys.ui.react.dev': '0.0.0',
    'sys.ui.react.media': '0.0.0',
    'sys.ui.react.media.image': '0.0.0',
    'sys.ui.react.media.video': '0.0.0',
    'sys.util': '0.0.0',
    'yaml': '2.5.0',
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
