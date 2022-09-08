import type { ManifestFileImage } from 'sys.fs/src/types.mjs';

/**
 * @system
 */
export type { Disposable } from 'sys.types';
export type {
  FsDriver,
  FsIO,
  FsIndexer,
  FsDriverInfo,
  FsDriverFactory,
  FsDriverFile,
  FsError,
  Manifest,
  ManifestFile,
  DirManifest,
  DirManifestInfo,
} from 'sys.fs/src/types.mjs';

/**
 * @local
 */
export type { ManifestFileImage };
export * from '../types.mjs';

/**
 * IndexedDB table structures.
 */
type FilePath = string;
type FileDir = string;
type FileHash = string;
export type BinaryRecord = { hash: FileHash; data: Uint8Array };
export type PathRecord = {
  path: FilePath;
  dir: FileDir;
  hash: FileHash;
  bytes: number;
  image?: ManifestFileImage;
};
