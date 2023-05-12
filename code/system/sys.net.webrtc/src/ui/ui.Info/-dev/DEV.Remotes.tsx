import { useEffect, useState, useRef } from 'react';

import { Button, Icons, PropList, Value, css, t } from '../common';

export type TDevRemote = {
  name: string;
  peer: t.Peer;
  controller: t.WebRtcController;
};

export type DevRemotesProps = {
  controller: t.WebRtcController;
  remotes?: TDevRemote[];
  style?: t.CssValue;
};

export const DevRemotes: React.FC<DevRemotesProps> = (props) => {
  const { remotes = [], controller } = props;
  if (remotes.length === 0) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      userSelect: 'none',
      fontSize: 14,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {remotes.map((remote) => {
        return <Row key={remote.peer.id} controller={controller} remote={remote} />;
      })}
    </div>
  );
};

/**
 * List Item (Row)
 */
export type RowProps = {
  controller: t.WebRtcController;
  remote: TDevRemote;
  style?: t.CssValue;
};

export const Row: React.FC<RowProps> = (props) => {
  const { controller, remote } = props;
  const events = controller.events;
  const network = controller.state.current.network;

  const [isConnecting, setConnecting] = useState(false);

  const short = `peer:${Value.shortenHash(remote.peer.id, [5, 0])}`;
  const exists = Boolean(network.peers[remote.peer.id]);
  const reconnect = async () => {
    setConnecting(true);
    await events.connect.fire(remote.peer.id);
    setConnecting(false);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      placeItems: 'center',
      marginBottom: 5,
      ':last-child': { marginBottom: 0 },
    }),
    left: css({
      display: 'grid',
      gridTemplateColumns: 'repeat(2, auto)',
      placeItems: 'center',
      columnGap: 5,
    }),
    right: css({
      display: 'grid',
      gridTemplateColumns: 'repeat(2, auto)',
      placeItems: 'center',
      columnGap: 5,
    }),
  };

  const elReconnect = (!exists || isConnecting) && (
    <Button onClick={reconnect} spinning={isConnecting}>
      {'reconnect →'}
    </Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <Icons.Person size={15} />
        {`${remote.name}`}
      </div>
      <div />
      <div {...styles.right}>
        {elReconnect}
        <PropList.Chip text={short} />
      </div>
    </div>
  );
};
