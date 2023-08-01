import { useEffect, useRef, useState } from 'react';
import { Wrangle } from './Wrangle.mjs';
import { DEFAULTS, type t } from './common';

import { type PlayerProps } from '@vime/react';

type Args = {
  video?: t.VideoSrc;
  playing?: boolean;
  enabled?: boolean;
  loop?: boolean;
  timestamp?: t.Seconds;
  hasInteracted?: boolean;
  onChange?: t.VideoPlayerChangeHandler;
};

/**
 * Manages monitoring and reporting on the state of a video.
 */
export function useStateController(args: Args) {
  const {
    playing = DEFAULTS.playing,
    enabled = DEFAULTS.enabled,
    loop = DEFAULTS.loop,
    timestamp,
  } = args;
  const videoDef = args.video ? `${args.video.kind}.${args.video.id}` : 'empty';

  const ref = useRef<HTMLVmPlayerElement>(null);
  const [video, setVideo] = useState<t.VideoSrc>(DEFAULTS.unknown);
  const [ready, setReady] = useState(false);
  const [total, setTotal] = useState<t.Seconds>(-1);
  const [current, setCurrent] = useState<t.Seconds>(-1);
  const [buffered, setBuffered] = useState<t.Seconds>(-1);
  const [buffering, setBuffering] = useState(false);

  const fireChange = (input?: t.VideoStatus) => {
    const status = input ?? api.status;
    args.onChange?.({ video, status });
  };

  const reset = () => {
    setVideo(args.video ?? DEFAULTS.unknown);
    setTotal(-1);
    setCurrent(0);
  };

  const play = () => ref.current?.play();
  const pause = () => ref.current?.pause();
  const seek = (secs: number, ensurePlay?: boolean) => {
    const player = ref.current;
    if (player) player.currentTime = secs;
    if (player && ensurePlay) play();
  };
  const updatePlay = () => {
    if (playing && enabled) play();
    else pause();
  };

  /**
   * Behavior.
   */
  useEffect(reset, [videoDef]);
  useEffect(updatePlay, [videoDef, playing, loop, args.hasInteracted, enabled]);
  useEffect(() => {
    /**
     * Fire status update event
     * and handle looping.
     */
    const status = api.status;
    const doLoopRestart = status.is.complete && status.is.playing && loop; // NB: looping is determined within the <Status> calculation.
    if (doLoopRestart) seek(0, true);
    fireChange(status);
  }, [total, current, playing, ready]);

  useEffect(() => {
    if (typeof timestamp === 'number') seek(timestamp, playing);
  }, [timestamp]);

  /**
   * Handlers
   */
  const onVmReady = (e: CustomEvent<void>) => {
    setReady(true);
    updatePlay();
  };
  const onVmCurrentTimeChange = (e: CustomEvent<number>) => setCurrent(e.detail);
  const onVmDurationChange = (e: CustomEvent<number>) => {
    setTotal(e.detail);
    updatePlay();
  };
  const onVmBufferingChange = (e: CustomEvent<PlayerProps['buffering']>) => setBuffering(e.detail);
  const onVmBufferedChange = (e: CustomEvent<number>) => setBuffered(e.detail);

  const handlers = {
    onVmReady,
    onVmCurrentTimeChange,
    onVmDurationChange,
    onVmBufferedChange,
    onVmBufferingChange,
  } as const;

  /**
   * API
   */
  const api = {
    ref,
    handlers,
    video,
    get ready() {
      return ready && total > -1;
    },
    get status(): t.VideoStatus {
      if (!api.ready || total <= 0) return DEFAULTS.emptyStatus;
      return Wrangle.toStatus({ total, current, buffered, playing, loop, buffering });
    },
  } as const;
  return api;
}
