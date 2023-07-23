import { useEffect, useRef, useState } from 'react';
import { rx, slug, type t } from '../common';
import { View } from './ui';

export const Stateful: React.FC<t.RootStatefulProps> = (props) => {
  const { slugs = [] } = props;

  const busRef = useRef(rx.bus());
  const [selected, setSelected] = useState(0);
  const [vimeo, setVimeo] = useState<t.VimeoInstance>();

  /**
   * Lifecycle
   */
  useEffect(() => {
    const bus = busRef.current;
    const vimeo: t.VimeoInstance = { bus, id: `foo.${slug()}` };
    setVimeo(vimeo);
    props.onReady?.({ vimeo });
  }, []);

  /**
   * Render
   */
  return (
    <View
      vimeo={vimeo}
      slugs={slugs}
      selected={selected}
      onSelect={(e) => {
        setSelected(e.index);
      }}
    />
  );
};
