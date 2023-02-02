import { t, rx, Time, Dev, cuid, expect } from '../test.ui';
import { WebRTC } from '.';

const host = 'rtc.cellfs.com';

export default Dev.describe('WebRTC', (e) => {
  e.timeout(10 * 10000);

  e.describe('initial state (self)', (e) => {
    e.it('trims HTTP from host', async (e) => {
      const peer1 = await WebRTC.peer(`  http://${host}  `);
      const peer2 = await WebRTC.peer(`  https://${host}  `);

      expect(peer1.host).to.eql(host);
      expect(peer2.host).to.eql(host);

      peer1.dispose();
      peer2.dispose();
    });

    e.it('generates peer id', async (e) => {
      const peer = await WebRTC.peer(host);
      expect(peer.id).to.be.a('string');
      expect(peer.id.length).to.greaterThan(10);
      peer.dispose();
    });

    e.it('specify peer id', async (e) => {
      const id1 = cuid();
      const id2 = cuid();
      const peer1 = await WebRTC.peer(host, { id: id1 });
      const peer2 = await WebRTC.peer(host, { id: `peer:${id2}` });

      expect(peer1.id).to.eql(id1);
      expect(peer2.id).to.eql(id2); // NB: Trims the "peer:" URI prefix.

      peer1.dispose();
      peer2.dispose();
    });

    e.it('immutable connections list', async (e) => {
      const peer = await WebRTC.peer(host);
      expect(peer.connections).to.eql([]);
      expect(peer.dataConnections).to.eql([]);
      expect(peer.mediaConnections).to.eql([]);
      expect(peer.connections).to.not.equal(peer.connections);
      expect(peer.dataConnections).to.not.equal(peer.dataConnections);
      expect(peer.mediaConnections).to.not.equal(peer.mediaConnections);
      peer.dispose();
    });
  });

  e.describe('data', async (e) => {
    const peerA = await WebRTC.peer(host);
    const peerB = await WebRTC.peer(host);

    e.it('establish data connection between peers', async (e) => {
      const { dispose, dispose$ } = rx.disposable();

      const firedA: t.PeerConnectionChange[] = [];
      const firedB: t.PeerConnectionChange[] = [];

      peerA.connections$.pipe(rx.takeUntil(dispose$)).subscribe((e) => {
        firedA.push(e);
      });
      peerB.connections$.pipe(rx.takeUntil(dispose$)).subscribe((e) => {
        firedB.push(e);
      });

      expect(peerA.connections).to.eql([]);
      expect(peerB.connections).to.eql([]);

      // Establish the connection.
      const connA = await peerA.data(peerB.id);
      expect(connA.kind).to.eql('data');
      expect(connA.peer.local).to.eql(peerA.id);
      expect(connA.peer.remote).to.eql(peerB.id);
      expect(connA).to.eql(peerA.dataConnections[0]);

      expect(peerA.connections.length).to.eql(1);
      await Time.wait(500);
      expect(peerB.connections.length).to.eql(1);
      expect(peerA.dataConnections.length).to.eql(1);
      expect(peerB.dataConnections.length).to.eql(1);

      expect(peerA.dataConnections[0].open).to.eql(true);
      expect(peerB.dataConnections[0].open).to.eql(true);

      expect(firedA.length).to.eql(1);
      expect(firedB.length).to.eql(1);
      expect(firedA[0].action).to.eql('added');
      expect(firedB[0].action).to.eql('added');

      // Send data between peers.
      type E = { type: 'foo'; payload: { msg: string } };
      const connB = peerB.dataConnections[0];

      const incomingA: t.PeerDataPayload[] = [];
      const incomingB: t.PeerDataPayload[] = [];
      connA.in$.pipe(rx.takeUntil(dispose$)).subscribe((e) => incomingA.push(e));
      connB.in$.pipe(rx.takeUntil(dispose$)).subscribe((e) => incomingB.push(e));

      connA.send<E>({ type: 'foo', payload: { msg: 'from-A' } });
      connB.send<E>({ type: 'foo', payload: { msg: 'from-B' } });

      await Time.wait(500);

      expect(incomingA.length).to.eql(1, 'message received by A');
      expect(incomingB.length).to.eql(1, 'message received by B');

      expect(incomingA[0].event.payload.msg).to.eql('from-B');
      expect(incomingB[0].event.payload.msg).to.eql('from-A');

      // Close the connection on the initiating (A) side.
      connA.dispose();
      expect(connA.disposed).to.eql(true);
      await Time.wait(500);

      expect(firedA.length).to.eql(2);
      expect(firedB.length).to.eql(2);
      expect(firedA[1].action).to.eql('removed');
      expect(firedB[1].action).to.eql('removed');
      expect(peerA.connections.length).to.eql(0);
      expect(peerB.connections.length).to.eql(0);

      // Will no-longer transmit data after being disposed.
      connA.send<E>({ type: 'foo', payload: { msg: 'from-A' } });
      await Time.wait(300);
      expect(incomingB.length).to.eql(1, 'no longer transmits data');

      dispose();
    });
  });
});
