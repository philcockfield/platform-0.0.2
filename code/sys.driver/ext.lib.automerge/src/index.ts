/**
 * Module (Meta)
 */
export { Pkg } from './index.pkg';

/**
 * Library
 */
export { A, Cmd, Data, Is, toObject } from './common';
export { Store, StoreIndex };

import { Doc, Store, StoreIndex } from './crdt';
import { Sync } from './crdt.sync';
export { Doc, Sync };

import { StoreIndexDb, WebStore, WebStoreIndex } from './crdt.web';
export { StoreIndexDb, WebStore, WebStoreIndex };

export const Crdt = {
  Doc,
  Sync,
  Store,
  WebStore,
} as const;

/**
 * Library: UI
 */
export { DocUri } from './ui/ui.DocUri';
export { Info, InfoField } from './ui/ui.Info';
export { RepoList } from './ui/ui.RepoList';
export { Redraw, useDoc, useDocs, useRedrawOnChange } from './ui/ui.use';

/**
 * Dev
 */
export { Specs } from './test.ui/entry.Specs';
export { TestDb } from './test.ui/TestDb';
export { SampleCrdt } from './test.ui/SampleCrdt';
