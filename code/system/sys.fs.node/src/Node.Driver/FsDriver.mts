import { t, PathResolverFactory, Path, Hash } from '../common/index.mjs';
import { NodeFs } from '../node/NodeFs/index.mjs';

/**
 * A filesystem driver running against the "node-js" POSIX interface.
 */
export function FsDriver(options: { dir?: string } = {}): t.FsDriver {
  const dir = formatRootDir(options.dir ?? '/');
  const root = dir;

  const resolve = PathResolverFactory({ dir });

  const unpackUri = (uri: string) => {
    uri = (uri || '').trim();
    const fullpath = resolve(uri);
    const location = Path.toAbsoluteLocation({ path: fullpath, root });
    const path = fullpath.substring(dir.length - 1); // NB: hide full path up to root of driver scope.
    return { uri, fullpath, path, location };
  };

  const driver: t.FsDriver = {
    /**
     * Root directory of the file system (scope).
     */
    dir,

    /**
     * Convert the given string to an absolute path.
     */
    resolve,

    /**
     * Retrieve meta-data of a local file.
     */
    async info(address) {
      const { uri, fullpath, path, location } = unpackUri(address);

      type T = t.FsDriverInfo;
      let kind: T['kind'] = 'unknown';
      let hash: T['hash'] = '';
      let bytes: T['bytes'] = -1;

      const exists = await NodeFs.pathExists(fullpath);

      if (exists) {
        const stats = await NodeFs.stat(fullpath);
        if (kind === 'unknown' && stats.isFile()) kind = 'file';
        if (kind === 'unknown' && stats.isDirectory()) kind = 'dir';
        if (kind !== 'unknown') bytes = stats.size;
        if (kind === 'file') {
          const data = await NodeFs.readFile(fullpath);
          hash = Hash.sha256(data);
        }
      }

      return { uri, exists, kind, path, location, hash, bytes };
    },

    /**
     * Read from the local file-system.
     */
    async read(address) {
      const { uri, fullpath, path, location } = unpackUri(address);

      try {
        const exists = await NodeFs.pathExists(fullpath);
        const status = exists ? 200 : 404;
        const ok = status.toString().startsWith('2');
        const res: t.FsDriverRead = { ok, status, uri };

        if (exists) {
          const buffer = await NodeFs.readFile(fullpath);
          const data = new Uint8Array(buffer);
          const hash = Hash.sha256(data);
          const bytes = data.byteLength;
          res.file = { path, location, data, hash, bytes };
        }

        return res;
      } catch (err: any) {
        const error: t.FsError = { code: 'fs:read', message: err.message, path };
        return { ok: false, status: 500, uri, error };
      }
    },

    /**
     * Write to the local file-system.
     */
    async write(address, input) {
      const { uri, fullpath, path, location } = unpackUri(address);
      throw new Error('not implemented');
    },

    /**
     * Delete from the local file-system.
     */
    async delete(uri) {
      throw new Error('not implemented');
    },

    /**
     * Copy a file.
     */
    async copy(sourceUri, targetUri) {
      throw new Error('not implemented');
    },
  };

  return driver;
}

/**
 * Helpers
 */
function formatRootDir(path: string) {
  path = Path.trim(path);
  path = Path.ensureSlashStart(path);
  path = Path.ensureSlashEnd(path);
  return path;
}
