/**
 * @external
 */
export type { CSSProperties } from 'react';
export type { Observable, Subject } from 'rxjs';

/**
 * @system
 */
export type {
  Disposable,
  DomRect,
  EventBus,
  IgnoredResponse,
  Immutable,
  ImmutableNext,
  JsonMapU,
  JsonU,
  ModuleDef,
  Pos,
  Position,
  PositionInput,
  Size,
} from 'sys.types/src/types.mjs';

export type { PatchChange, PatchChangeHandler } from 'sys.data.json/src/types.mjs';
export type {
  BundleImport,
  SpecImport,
  SpecImports,
  TestHandlerArgs,
  TestRunResponse,
  TestSuiteModel,
  TestSuiteRunResponse,
  TestSuiteRunStats,
} from 'sys.test.spec/src/types.mjs';
export type { TextCharDiff } from 'sys.text/src/types.mjs';
export type { CellAddress, TimeDelayPromise } from 'sys.util/src/types.mjs';

/**
 * @system → UI
 */
export type {
  KeyMatchSubscriberHandler,
  KeyMatchSubscriberHandlerArgs,
  KeyboardKeypress,
  KeyboardKeypressProps,
  KeyboardModifierEdges,
  KeyboardModifierFlags,
  KeyboardState,
  LocalStorage,
  UIEventBase,
  UIModifierKeys,
} from 'sys.ui.dom/src/types.mjs';
export type { CssEdgesInput, CssShadow, CssValue } from 'sys.ui.react.css/src/types.mjs';
export type {
  DevCtx,
  DevCtxDebug,
  DevCtxEdge,
  DevCtxInput,
  DevCtxState,
  DevEvents,
  DevInfo,
  DevRedrawTarget,
  DevRenderProps,
  DevRenderRef,
  DevRenderer,
  DevTheme,
  DevValueHandler,
  SpecListBadge,
  SpecListChildVisibility,
  SpecListChildVisibilityHandler,
  SpecListScrollTarget,
} from 'sys.ui.react.dev/src/types.mjs';

/**
 * @local
 */
export type * from '../types.mjs';
export type UrlInput = string | URL | Location;
export type MarginInput = number | [number] | [number, number] | [number, number, number, number];
export type Margin = [number, number, number, number];
