import { rx, type t } from './common';
import { Data } from './Data';

/**
 * Behavior for handling name edits.
 */
export function renameBehavior(args: { ctx: t.RepoListCtxGet; item: t.RepoItemCtx }) {
  const { ctx, item } = args;
  const { index } = ctx();

  /**
   * Update the name in the index.
   */
  const rename = async (name: string) => {
    const uri = Data.item(item.state).uri;
    index.doc.change((d) => {
      const item = d.docs.find((doc) => doc.uri === uri);
      if (item) item.name = name;
    });
  };

  /**
   * (Trigger) Listener
   */
  const mode = () => Data.item(item.state).mode;
  item.events.cmd.edited$
    .pipe(
      rx.filter((e) => e.action === 'accepted'),
      rx.filter((e) => mode() === 'Doc'), // NB: defensive guard.
    )
    .subscribe((e) => rename(e.label));
}
