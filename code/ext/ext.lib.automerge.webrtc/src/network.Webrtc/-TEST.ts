import { WebrtcStore } from '.';
import { Test, Time, WebStore, Webrtc, expect, type t } from '../test.ui';

type D = { count: number };

export default Test.describe('WebrtcStore | WebrtcNetworkAdapter', (e) => {
  e.timeout(9999);

  const testSetup = () => {
    const peer = Webrtc.peer();
    const events = peer.events();
    const store = WebStore.init({ network: [] });
    const generator = store.doc.factory<D>((d) => (d.count = 0));
    const manager = WebrtcStore.init(peer, store);

    const added: t.WebrtcStoreAdapterAdded[] = [];
    manager.added$.subscribe((e) => added.push(e));

    const dispose = () => {
      peer.dispose();
      store.dispose();
      manager.dispose();
    };
    return { peer, events, store, added, generator, manager, dispose } as const;
  };

  e.describe('Integration (Live)', (e) => {
    e.it('connects and sync douments over WebRTC', async (e) => {
      const wait = (msecs = 400) => Time.wait(msecs);
      const self = testSetup();
      await wait();
      const remote = testSetup();
      await wait();

      const res = await self.peer.connect.data(remote.peer.id);
      expect(res.error).to.eql(undefined);
      expect(self.manager.total.added).to.eql(1);
      expect(remote.manager.total.added).to.eql(1);

      expect(self.added.length).to.eql(1);
      expect(remote.added.length).to.eql(1);
      expect(self.added[0].conn.id).to.eql(res.id);
      expect(self.added[0].peer).to.eql(self.peer.id);

      expect(remote.added[0].conn.id).to.eql(res.id);
      expect(remote.added[0].peer).to.eql(remote.peer.id);

      const bytesBefore = {
        self: self.manager.total.bytes,
        remote: remote.manager.total.bytes,
      } as const;

      /**
       * Create a new document.
       */
      const docSelf = await self.generator();
      await wait();
      const docRemote = await remote.generator(docSelf.uri); // NB: knowledge of remote document URI.
      await wait();
      expect(docSelf.current).to.eql({ count: 0 });
      expect(docRemote.current).to.eql({ count: 0 });

      /**
       * Change the document, and ensure it syncs over the network connection.
       */
      docRemote.change((d) => (d.count = 123));
      await wait(500);
      expect(docSelf.current).to.eql({ count: 123 });
      expect(docRemote.current).to.eql({ count: 123 });

      expect(self.manager.total.bytes).to.greaterThan(bytesBefore.self);
      expect(remote.manager.total.bytes).to.greaterThan(bytesBefore.remote);
    });
  });

  e.describe('WebrtcStore (Manager)', (e) => {
    e.it('initialize', async (e) => {
      const { dispose, manager, store, peer } = testSetup();
      expect(manager.total.added).to.eql(0);
      expect(manager.store).to.equal(store);
      expect(manager.peer).to.equal(peer);
      dispose();
    });

    e.it('dispose: when Peer disposes', async (e) => {
      const { peer, dispose, manager } = testSetup();
      expect(manager.disposed).to.eql(false);
      peer.dispose();
      expect(manager.disposed).to.eql(true);
      dispose();
    });

    e.it('dispose: when Store disposes', async (e) => {
      const { store, dispose, manager } = testSetup();
      expect(manager.disposed).to.eql(false);
      store.dispose();
      expect(manager.disposed).to.eql(true);
      dispose();
    });
  });
});
