import { Store } from '.';
import { type t, Is, Test, expect, A } from '../test.ui';

export type D = { count?: t.A.Counter };

export default Test.describe('Store', (e) => {
  const store = Store.init();

  e.it('has repo', (e) => {
    expect(Is.repo(store.repo)).to.eql(true);
  });

  e.describe('docRef', (e) => {
    const initial: t.DocChange<D> = (d) => (d.count = new A.Counter(0));

    e.it('create (initial)', async (e) => {
      const doc1 = await store.docRef<D>({ initial });
      const doc2 = await store.docRef<D>({ initial });

      expect(doc1.handle.state).to.eql('ready');
      expect(doc1.uri).to.eql(doc1.handle.url);
      expect(doc1.current.count?.value).to.eql(0);

      expect(doc1.uri).to.not.eql(doc2.uri); // NB: A new document retrieved.
      expect(doc1.current).to.not.equal(doc2.current);
      expect(doc1.current).to.eql(doc2.current);
    });

    e.it('retrieve (from URI)', async (e) => {
      const doc1 = await store.docRef<D>({ initial });
      const doc2 = await store.docRef<D>({ initial, uri: doc1.uri });
      expect(doc1.uri).to.eql(doc2.uri);
      expect(doc1.current).to.equal(doc2.current);
    });

    e.it('change', async (e) => {
      const doc = await store.docRef<D>({ initial });
      expect(doc.current.count?.value).to.eql(0);

      doc.change((d) => d.count?.increment(5));
      expect(doc.current.count?.value).to.eql(5);
    });
  });
});
