import { useEffect, useRef, useState } from 'react';
import { DEFAULTS, Color, COLORS, css, t, rx, FC } from '../../common';
import { DocError } from '../Doc.Error';
import { DocImageCaption } from './DocImage.Caption';
import { Util } from './Util.mjs';

export type DocImageProps = {
  node: t.MdastImage;
  def?: t.DocImageDef;
  style?: t.CssValue;
};

export const DocImage: React.FC<DocImageProps> = (props) => {
  const { node, def } = props;
  const src = node.url;

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const width = def?.width;
  const border = def?.border;

  const margin = def?.margin;
  const title = Wrangle.title(def);
  const offset = Wrangle.offset(def);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      maxWidth: DEFAULTS.MD.DOC.width,
      marginTop: margin?.top,
      marginBottom: margin?.bottom,
    }),
    image: {
      base: css({
        Flex: Util.getFlexAlignment(def?.align),
        visibility: loaded ? 'visible' : 'hidden',
        transform: Util.getOffsetTransform(offset),
      }),
      imgElement: css({
        width,
        maxWidth: DEFAULTS.MD.DOC.width,
        boxSizing: 'border-box',
        border: border ? `solid 1px ${Color.alpha(COLORS.DARK, 0.1)}` : undefined,
        borderRadius: def?.radius,
      }),
    },
  };

  const elTitle = title && <DocImageCaption def={title} style={{ marginTop: 20 }} />;

  const elError = loadError && <DocError message={loadError} />;

  const elImage = !loadError && (
    <img
      {...styles.image.imgElement}
      src={src}
      alt={node.alt || undefined}
      onLoad={(e) => setLoaded(true)}
      onError={(e) => {
        setLoaded(true);
        setLoadError(`Failed to load image at location: \`${src}\``);
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)} className={DEFAULTS.MD.CLASS.BLOCK}>
      <div {...styles.image.base}>{elImage}</div>

      {elError}
      {elTitle}
    </div>
  );
};

/**
 * Helpers
 */
const Wrangle = {
  title(def?: t.DocImageDef): t.DocImageCaption | undefined {
    if (!def) return undefined;
    if (!def.caption) return undefined;
    if (typeof def.caption === 'string') return { text: def.caption, align: 'Center' };

    const { text = 'Untitled', align = 'Center' } = def.caption;
    return { text, align };
  },

  offset(def?: t.DocImageDef) {
    if (typeof def?.offset === 'object') {
      const { x, y } = def?.offset;
      return { x, y };
    }

    return undefined;
  },
};
