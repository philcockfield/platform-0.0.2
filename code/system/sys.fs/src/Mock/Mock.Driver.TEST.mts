import { describe, it, expect } from '../TEST/index.mjs';
import { FsMockDriver, FsMock } from './index.mjs';
import { Path } from './common.mjs';

describe('Mock: FsDriver', () => {
  describe('driver.resolve', () => {
    it('default root directory', () => {
      const mock = FsMockDriver();
      const resolve = mock.driver.resolve;
      const res = resolve('path:.');
      expect(res).to.eql('/mock/');
    });

    it('custom root directory', () => {
      const mock = FsMockDriver({ dir: '  foo/bar  ' });
      const resolve = mock.driver.resolve;

      const res1 = resolve('path:.');
      const res2 = resolve('path:dir/file.txt');
      expect(res1).to.eql('/foo/bar/');
      expect(res2).to.eql('/foo/bar/dir/file.txt');
    });
  });

  describe('info', () => {
    it('no handler', async () => {
      const uri = '  path:foo/bar.txt  ';
      const mock = FsMockDriver();
      const res = await mock.driver.info(uri);

      expect(mock.count.info).to.eql(1);

      expect(res.uri).to.eql(uri.trim());
      expect(res.exists).to.eql(false);
      expect(res.kind).to.eql('unknown');
      expect(res.path).to.eql('foo/bar.txt');
      expect(res.location).to.eql('file:///mock/foo/bar.txt');
      expect(res.hash).to.eql('');
      expect(res.bytes).to.eql(-1);
    });

    it('override info', async () => {
      const mock = FsMockDriver({}).onInfo((e) => {
        e.info.hash = 'sha256-abc';
        e.info.exists = true;
        e.info.kind = 'file';
        e.info.bytes = 1234;
      });

      const uri = '  path:foo/bar.txt  ';
      const res = await mock.driver.info(uri);

      expect(mock.count.info).to.eql(1);

      expect(res.uri).to.eql(uri.trim());
      expect(res.exists).to.eql(true);
      expect(res.kind).to.eql('file');
      expect(res.path).to.eql('foo/bar.txt');
      expect(res.location).to.eql('file:///mock/foo/bar.txt');
      expect(res.hash).to.eql('sha256-abc');
      expect(res.bytes).to.eql(1234);
    });
  });

  describe('read/write', () => {
    it('write', async () => {
      const mock = FsMockDriver();
      const path = '  foo/bar.png  ';
      const png = FsMock.randomFile();

      const res = await mock.driver.write(path, png.data);
      expect(mock.count.write).to.eql(1);

      expect(res.uri).to.eql('path:foo/bar.png');
      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.file.data).to.eql(png.data);
      expect(res.file.hash).to.eql(png.hash);
      expect(res.file.path).to.eql('foo/bar.png');
      expect(res.file.location).to.eql('file:///mock/foo/bar.png');
      expect(res.error).to.eql(undefined);
    });

    it('read: not found (404)', async () => {
      const mock = FsMockDriver();
      const path = '  foo/bar.png  ';
      const uri = Path.Uri.ensurePrefix(path);

      const res = await mock.driver.read(uri);
      expect(mock.count.read).to.eql(1);

      expect(res.uri).to.eql(uri);
      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);
      expect(res.file).to.eql(undefined);
      expect(res.error?.type).to.eql('FS/read');
      expect(res.error?.path).to.eql('foo/bar.png');
    });

    it('read (200)', async () => {
      const mock = FsMockDriver();
      const path = 'foo/bar.png';
      const png = FsMock.randomFile();

      await mock.driver.write(path, png.data);
      expect(mock.count.write).to.eql(1);

      const uri = Path.Uri.ensurePrefix(path);
      const res = await mock.driver.read(uri);

      expect(res.uri).to.eql(uri);
      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.file?.data).to.eql(png.data);
      expect(res.file?.hash).to.eql(png.hash);
      expect(res.file?.path).to.eql('foo/bar.png');
      expect(res.file?.location).to.eql('file:///mock/foo/bar.png');
      expect(res.error).to.eql(undefined);
    });
  });

  describe('delete', () => {
    it('nothing to delete', async () => {
      const mock = FsMockDriver();
      const uri = 'path:foo/bar.png';

      const res = await mock.driver.delete(uri);
      expect(mock.count.delete).to.eql(1);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.uris).to.eql([]);
      expect(res.locations).to.eql([]);
    });

    it('single file', async () => {
      const mock = FsMockDriver();

      const path = '  foo/bar.png  ';
      const png = FsMock.randomFile();
      await mock.driver.write(path, png.data);

      const res = await mock.driver.delete(path);
      expect(mock.count.delete).to.eql(1);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.uris).to.eql(['path:foo/bar.png']);
      expect(res.locations).to.eql(['file:///mock/foo/bar.png']);
    });

    it('many files', async () => {
      const mock = FsMockDriver();

      const file1 = FsMock.randomFile();
      const file2 = FsMock.randomFile(500);
      await mock.driver.write('foo/bar.png', file1.data);
      await mock.driver.write('thing.pdf', file2.data);

      const res = await mock.driver.delete(['path:foo/bar.png', 'path:404', 'path:thing.pdf']);
      expect(mock.count.delete).to.eql(1);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.uris).to.eql(['path:foo/bar.png', 'path:thing.pdf']);
      expect(res.locations).to.eql(['file:///mock/foo/bar.png', 'file:///mock/thing.pdf']);
    });
  });

  describe('copy', () => {
    it('copy file', async () => {
      const mock = FsMockDriver();

      const png = FsMock.randomFile();
      await mock.driver.write('path:foo.png', png.data);

      const res = await mock.driver.copy('path:foo.png', 'path:images/bird.png');
      expect(mock.count.copy).to.eql(1);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.source).to.eql('path:foo.png');
      expect(res.target).to.eql('path:images/bird.png');
      expect(res.error).to.eql(undefined);

      // Ensure the file is copied.
      const from = await mock.driver.read('path:foo.png');
      const to = await mock.driver.read('path:images/bird.png');
      expect(from.status).to.eql(404);
      expect(to.status).to.eql(200);
    });

    it('404 - source not found', async () => {
      const mock = FsMockDriver();
      const res = await mock.driver.copy('path:foo.png', 'path:images/bird.png');

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);
      expect(res.source).to.eql('path:foo.png');
      expect(res.target).to.eql('path:images/bird.png');
      expect(res.error?.type).to.eql('FS/copy');
      expect(res.error?.path).to.eql('foo.png');
    });
  });
});
