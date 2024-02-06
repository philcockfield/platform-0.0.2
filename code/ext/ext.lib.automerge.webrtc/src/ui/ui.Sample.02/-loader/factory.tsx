import { type t } from '../common';

/**
 * A factory for code-split (dynamicly loaded) ESM module.
 */
export const loadFactory: t.LoadFactory<t.SampleFactoryTypename> = async (e) => {
  const { typename, store, docuri, shared } = e;

  if (typename === 'CodeEditor') {
    const { CodeEditorLoader } = await import('./CodeEditor'); // NB: dynamic code-splitting here.
    return <CodeEditorLoader store={store} docuri={docuri} />;
  }

  if (typename === 'DiagramEditor') {
    // @ts-ignore
    await import('@tldraw/tldraw/tldraw.css');
    const { Canvas } = await import('ext.lib.tldraw');
    return <Canvas style={{ opacity: 0.9 }} />;
  }

  if (typename === 'Auth') {
    const { AuthLoader } = await import('./Auth');
    return <AuthLoader store={store} docuri={docuri} />;
  }

  if (typename === 'CmdHost') {
    const { CmdHost } = await import('./CmdHost');
    return <CmdHost store={store} shared={shared} />;
  }

  return;
};