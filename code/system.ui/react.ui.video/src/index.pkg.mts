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
  name: 'sys.ui.react.video',
  version: '0.0.0',
  dependencies: {
    '@vimeo/player': '2.18.0',
    'framer-motion': '8.5.2',
    'react': '18.2.0',
    'react-dom': '18.2.0',
    'sys.fs': '0.0.0',
    'sys.types': '0.0.0',
    'sys.ui.react.common': '0.0.0',
    'sys.util': '0.0.0',
    'sys.ui.react.css': '0.0.0',
    'sys.ui.react.util': '0.0.0',
  },
  toString() {
    return `💦 module: ${Pkg.name} (v${Pkg.version})`;
  },
};

export type ModuleDef = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  toString(): string;
};
