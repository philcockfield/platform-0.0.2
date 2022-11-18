import { useEffect, useState } from 'react';

import { Text, Color, css, State, t, useSizeObserver } from '../common';
import { TooSmall } from '../TooSmall';
import { ProgressBar } from '../Video.ProgressBar';
import { VideoDiagramVimeo } from './ui.Vimeo';
import { VideoDiagramImage } from './ui.Image';

/**
 * TODO 🐷 TEMP
 */
const SAMPLE = {
  // video: 727951677,
  // diagram:
  //   'https://user-images.githubusercontent.com/185555/201820392-e66aa287-3df9-4d8f-a480-d15382f62c17.png',
};

export type VideoDiagramProps = {
  instance: t.StateInstance;
  md?: t.ProcessedMdast;
  dimmed?: boolean;
  minHeight?: number;
  minWidth?: number;
  style?: t.CssValue;
};

export const VideoDiagram: React.FC<VideoDiagramProps> = (props) => {
  const { dimmed = false, minWidth = 550, minHeight = 550, md } = props;

  const state = State.useState(props.instance);
  const muted = state.current?.env.media.muted ?? false;

  const [isPlaying, setIsPlaying] = useState(false);
  const [vimeo, setVimeo] = useState<t.VimeoEvents>();
  const [percent, setPercent] = useState(0);

  const [videoId, setVideoId] = useState<t.VimeoId | undefined>();
  const [diagramSrc, setDiagramSrc] = useState('');

  const size = useSizeObserver();
  const isTooSmall = !size.ready
    ? undefined
    : size.rect.width < minHeight || size.rect.height < minWidth;

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    vimeo?.status.$.subscribe((e) => setPercent(e.percent));
  }, [vimeo?.instance.id]);

  useEffect(() => {
    /**
     * TODO 🐷
     * Refactor into non-UI location.
     */
    const def = md?.info.code.typed.find((e) => e.type.toLowerCase().startsWith('doc.diagram'));
    if (def) {
      const yaml = Text.Yaml.parse(def?.text);
      if (typeof yaml.video === 'number') {
        setVideoId(yaml.video);
      }

      if (Array.isArray(yaml.images)) {
        const d = yaml.images[0];
        console.log('d', d);
        if (typeof d?.src === 'string') setDiagramSrc(d.src);
      }
    }
  }, [md?.markdown]);

  /**
   * [Handlers]
   */

  const jumpToPercent = async (percent: number) => {
    if (!vimeo) return;
    const duration = (await vimeo.status.get()).status?.duration ?? 0;
    const secs = duration * percent;
    vimeo.seek.fire(secs);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: Color.format(dimmed ? 0.1 : 1),
      transition: `background-color 300ms`,
      overflow: 'hidden',
    }),
    body: css({
      Absolute: 0,
      opacity: size.ready ? 1 : 0,
      transition: 'opacity 150ms',
    }),
    content: css({ Absolute: [100, 100, 150, 100] }),
    video: css({ Absolute: [null, null, 30, 30] }),
    progressBar: css({
      Absolute: [null, 45, 0, 45],
      opacity: dimmed ? 0 : 1,
      transition: `opacity 300ms`,
    }),
  };

  const elVimeo = videoId !== undefined && (
    <VideoDiagramVimeo
      style={styles.video}
      dimmed={dimmed}
      muted={muted}
      video={videoId}
      autoStart={true}
      onReady={(vimeo) => setVimeo(vimeo)}
      onPlayingChange={(e) => setIsPlaying(e.isPlaying)}
    />
  );

  const elContent = diagramSrc && (
    <VideoDiagramImage src={diagramSrc} dimmed={dimmed} style={styles.content} />
  );

  const elTooSmall = isTooSmall && <TooSmall backgroundColor={0.3} backdropBlur={22} />;
  const elProgressBar = vimeo && (
    <ProgressBar
      percent={percent}
      style={styles.progressBar}
      isPlaying={isPlaying}
      onClick={(e) => jumpToPercent(e.progress)}
    />
  );

  return (
    <div {...css(styles.base, props.style)} ref={size.ref}>
      <div {...styles.body}>
        {elContent}
        {elVimeo}
        {elProgressBar}
        {elTooSmall}
      </div>
    </div>
  );
};
