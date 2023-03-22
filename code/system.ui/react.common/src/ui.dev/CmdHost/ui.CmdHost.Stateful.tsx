import { useState, useEffect, useRef } from 'react';
import { CmdHost, CmdHostProps } from './ui.CmdHost';
import { R, DEFAULTS, t, SpecList, rx } from './common';

export type CmdHostStatefulProps = Omit<CmdHostProps, 'filter'> & {
  mutateUrl?: boolean;
};

type T = t.Subject<t.SpecListScrollTarget>;

/**
 * A version of <CmdHost> that manages state interanally.
 */
export const CmdHostStateful: React.FC<CmdHostStatefulProps> = (props) => {
  const { mutateUrl = true, specs } = props;
  const total = specs ? Object.keys(specs).length : -1;

  const [filter, setFilter] = useState(Wrangle.url().filter);
  const [isFocused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hintKeys = Wrangle.hintKey({ isFocused, selectedIndex, specs });
  const filteredSpecs = SpecList.Filter.specs(specs, filter);
  const [childItems, setChildItems] = useState<t.SpecListChildVisibility[]>([]);
  const selectionChangeTrigger = childItems.map((item) => item.isOnScreen).join(',');
  const scrollToRef = useRef<T>(new rx.Subject<t.SpecListScrollTarget>());

  /**
   * Effects
   */
  useEffect(() => {
    const child = childItems[selectedIndex];
    if (child && !child.isOnScreen) {
      const index = child.index;
      scrollToRef.current.next({ index });
    }
  }, [selectedIndex, selectionChangeTrigger]);

  /**
   * [Handlers]
   */
  const handleFilterChanged: t.CmdHostChangedHandler = (e) => {
    if (mutateUrl) Url.mutateFilter(e.command);
    setFilter(e.command);
    props.onChanged?.(e);
  };

  const handleKeyboard = (key: string, preventDefault: () => void) => {
    if (key === 'ArrowUp') {
      preventDefault();
      setSelectedIndex(Wrangle.selected(filteredSpecs, selectedIndex - 1));
    }
    if (key === 'ArrowDown') {
      preventDefault();
      setSelectedIndex(Wrangle.selected(filteredSpecs, selectedIndex + 1));
    }
    if (key === 'Home') {
      preventDefault();
      setSelectedIndex(Wrangle.selected(filteredSpecs, 0));
    }
    if (key === 'End') {
      preventDefault();
      setSelectedIndex(Wrangle.selected(filteredSpecs, total - 1));
    }
    if (key === 'Enter' && mutateUrl) {
      preventDefault();
      Url.mutateSelected(selectedIndex, filteredSpecs);
      window.location.reload();
    }
  };

  /**
   * [Render]
   */
  return (
    <CmdHost
      {...props}
      filter={filter}
      selectedIndex={isFocused ? selectedIndex : undefined}
      hintKey={hintKeys}
      scrollTo$={scrollToRef.current}
      onChanged={handleFilterChanged}
      onCmdFocusChange={(e) => setFocused(e.isFocused)}
      onKeyDown={(e) => handleKeyboard(e.key, e.preventDefault)}
      onChildVisibility={(e) => setChildItems(e.items)}
    />
  );
};

/**
 * [Helpers]
 */
const Wrangle = {
  url() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const filter = params.get(DEFAULTS.QS.filter) ?? '';
    return { url, params, filter };
  },

  selected(specs: t.SpecImports | undefined, next: number) {
    if (!specs) return -1;
    const total = Object.keys(specs).length - 1;
    return total >= 0 ? R.clamp(0, total, next) : -1;
  },

  hintKey(args: { isFocused: boolean; specs?: t.SpecImports; selectedIndex: number }) {
    if (!args.isFocused) return '⌘K';
    return ['↑', '↓', 'enter'];
  },
};

const Url = {
  mutateFilter(filter: string) {
    const { url, params } = Wrangle.url();
    if (filter) params.set(DEFAULTS.QS.filter, filter);
    if (!filter) params.delete(DEFAULTS.QS.filter);
    const path = url.href;
    window.history.pushState({ path }, '', path);
  },

  mutateSelected(selectedIndex: number, specs?: t.SpecImports) {
    if (!specs) return;
    if (selectedIndex < 0) return;

    const { url, params } = Wrangle.url();
    const ns = Object.keys(specs)[selectedIndex];
    if (!ns) return;

    params.set(DEFAULTS.QS.dev, ns);
    const path = url.href;
    window.history.pushState({ path }, '', path);
  },
};
