import { Cmd, Immutable, ObjectPath, type t } from './common';

/**
 * Flags for the <CmdBar>
 */
export const Is = {
  ctrl(input: any): input is t.CmdBarCtrl {
    if (!isObject(input)) return false;
    return Cmd.Is.cmd(input._) && hasCtrlMethods(input);
  },

  paths(input: any): input is t.CmdBarPaths {
    if (!isObject(input)) return false;
    const o = input as t.CmdBarPaths;
    return ObjectPath.Is.path(o.cmd) && ObjectPath.Is.path(o.text);
  },

  ref(input: any): input is t.CmdBarRef {
    if (!isObject(input)) return false;
    const o = input as t.CmdBarRef;
    return Is.ctrl(o.ctrl) && Is.paths(o.paths) && Immutable.Is.immutableRef(o.state);
  },
} as const;

/**
 * Helpers
 */
function isObject(input: any) {
  return input !== null && typeof input === 'object';
}

function areFuncs(...input: any[]) {
  return input.every((v) => typeof v === 'function');
}

function hasCtrlMethods(input: any) {
  if (input === null || typeof input !== 'object') return false;
  const o = input as t.CmdBarCtrl;
  return areFuncs(o.current, o.focus, o.select, o.caretToStart, o.caretToEnd, o.invoke, o.keyboard);
}
