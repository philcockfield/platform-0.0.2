import { Path, Filesize, Bus } from 'sys.fs';
import { NodeDriver as Node } from './Node.Fs.Driver/index.mjs';

export const Filesystem = {
  Bus,
  Path,
  Filesize,
  Driver: { kind: 'Node', Node },
};
