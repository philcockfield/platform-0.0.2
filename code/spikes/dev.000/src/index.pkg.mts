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
  name: 'sys.dev',
  version: '0.0.393',
  dependencies: {
    '@rainbow-me/rainbowkit': '1.0.4',
    'react': '18.2.0',
    'react-dom': '18.2.0',
    'sys.data.crdt': '0.0.0',
    'sys.fs': '0.0.0',
    'sys.fs.indexeddb': '0.0.0',
    'sys.net.webrtc': '0.0.0',
    'sys.text': '0.0.0',
    'sys.ui.react.common': '0.0.0',
    'sys.ui.react.dev': '0.0.0',
    'sys.ui.react.media': '0.0.0',
    'sys.ui.react.media.image': '0.0.0',
    'sys.ui.react.monaco': '0.0.0',
    'sys.util': '0.0.0',
    'vendor.stripe': '0.0.0',
    'vendor.wallet.rainbow': '0.0.0',
    'viem': '1.2.9',
    'wagmi': '1.3.3',
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
