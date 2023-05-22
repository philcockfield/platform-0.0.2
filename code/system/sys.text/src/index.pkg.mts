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
  name: 'sys.text',
  version: '0.0.0',
  dependencies: {
    'approx-string-match': '2.0.0',
    'diff': '5.1.0',
    'rehype-sanitize': '5.0.1',
    'rehype-stringify': '9.0.3',
    'rehype-format': '4.0.1',
    'remark-frontmatter': '4.0.1',
    'remark-gfm': '3.0.1',
    'remark-rehype': '10.1.0',
    'remark-parse': '10.0.2',
    'remark-stringify': '10.0.3',
    'retext-english': '4.1.0',
    'retext-stringify': '3.1.0',
    'sys.types': '0.0.0',
    'sys.util': '0.0.0',
    'unified': '10.1.2',
    'unist-util-select': '4.0.3',
    'yaml': '2.2.2',
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
