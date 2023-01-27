/**
 * @external
 */
export type { Observable } from 'rxjs';
export type { IconType } from 'react-icons';

/**
 * @system
 */
export * from 'sys.ui.react.dev.types';
export type {
  EventBus,
  Event,
  Disposable,
  Json,
  JsonMap,
  IgnoredResponse,
} from 'sys.types/src/types.mjs';
export type { CssValue } from 'sys.ui.react.css/src/types.mjs';
export type {
  TestModel,
  BundleImport,
  TestHandlerArgs,
  TestSuiteRunResponse,
} from 'sys.test.spec/src/types.mjs';

/**
 * @local
 */
export * from '../types.mjs';
export type MarginInput = number | [number] | [number, number] | [number, number, number, number];
export type Margin = [number, number, number, number];
export type UrlInput = string | URL | Location;
