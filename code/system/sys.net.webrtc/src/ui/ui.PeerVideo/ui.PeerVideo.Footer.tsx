import { Button, Color, COLORS, css, Icons, t, TextInput, WebRTC } from '../common';
import { PeerId } from '../ui.PeerId';

export type PeerVideoFooterProps = {
  self?: t.Peer;
  remotePeer?: t.PeerId;
  showPeer: boolean;
  showConnect: boolean;
  spinning?: boolean;
  style?: t.CssValue;
  onLocalPeerCopied?: t.PeerVideoLocalCopiedHandler;
  onRemotePeerChanged?: t.PeerVideoRemoteChangedHandler;
  onConnectRequest?: t.PeerVideoConnectRequestHandler;
};

export const PeerVideoFooter: React.FC<PeerVideoFooterProps> = (props) => {
  const { self, showPeer, showConnect, spinning = false } = props;
  if (!showPeer && !showConnect) return null;

  const canConnect = Wrangle.canConnect(props);
  const isConnected = Wrangle.isConnected(props);

  /**
   * [Handlers]
   */
  const handleCopyPeer = () => {
    const { local } = Wrangle.ids(props);
    props.onLocalPeerCopied?.({ local });
  };

  const handleConnect = () => {
    if (!self || !canConnect) return;
    const { local, remote } = Wrangle.ids(props);
    props.onConnectRequest?.({ local, remote });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    peer: css({
      height: 28,
      boxSizing: 'border-box',
      display: 'grid',
      placeItems: 'center',
      borderTop: `solid 1px ${Color.alpha(COLORS.DARK, 0.1)}`,
    }),
    input: {
      outer: css({
        Padding: [5, 5, 5, 3],
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
      }),
      textbox: css({
        display: 'grid',
        alignContent: 'center',
        marginRight: 5,
      }),
      edgeIcons: css({
        display: 'grid',
        justifyContent: 'center',
        alignContent: 'center',
        gridTemplateColumns: 'repeat(5, auto)',
        gap: '1px',
      }),
    },
    connectButton: css({
      backgroundColor: canConnect ? COLORS.BLUE : undefined,
      transition: 'all 150ms ease-out',
      borderRadius: 5,
      Padding: [4, 12],
      display: 'grid',
      placeItems: 'center',

      fontSize: 11,
      color: COLORS.WHITE,
    }),
    connectedThumbnail: css({
      Padding: [2, 5],
      display: 'grid',
      placeItems: 'center',
    }),
  };

  const elPeer = showPeer && (
    <div {...styles.peer}>{<PeerId peer={self?.id} prefix={'me'} onClick={handleCopyPeer} />}</div>
  );

  const elConnect = showConnect && (
    <div {...styles.input.outer}>
      <div {...styles.input.edgeIcons}>
        {!isConnected && <Icons.Globe.Language size={22} opacity={0.3} color={COLORS.DARK} />}
        {isConnected && (
          <Icons.Globe.Lock
            size={22}
            opacity={1}
            color={COLORS.BLUE}
            tooltip={'Secure Connection'}
          />
        )}
      </div>
      <div {...styles.input.textbox}>
        <TextInput
          value={props.remotePeer}
          valueStyle={{ fontSize: 13, color: Color.alpha(COLORS.DARK, isConnected ? 0.3 : 1) }}
          placeholder={'connect to remote peer'}
          placeholderStyle={{ opacity: 0.3, italic: true }}
          focusAction={'Select'}
          spellCheck={false}
          onEnter={handleConnect}
          onChanged={(e) => props.onRemotePeerChanged?.({ local: self?.id ?? '', remote: e.to })}
        />
      </div>
      <div {...styles.input.edgeIcons}>
        {!isConnected && canConnect && (
          <Button
            style={styles.connectButton}
            isEnabled={canConnect && !spinning}
            disabledOpacity={isConnected ? 1 : 0.3}
            onClick={handleConnect}
          >
            <div>{'Connect'}</div>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elConnect}
      {elPeer}
    </div>
  );
};

/**
 * Helpers
 */
const Wrangle = {
  canConnect(props: PeerVideoFooterProps) {
    if (!props.self || !props.showConnect) return false;
    const { local, remote } = Wrangle.ids(props);
    if (!remote) return false;
    if (local === remote) return false;
    if (Wrangle.isConnected(props)) return false;

    return true;
  },

  ids(props: PeerVideoFooterProps) {
    const local = props.self?.id ?? '';
    const remote = WebRTC.Util.asId(props.remotePeer ?? '');
    return { local, remote };
  },

  isConnected(props: PeerVideoFooterProps) {
    const { remote } = Wrangle.ids(props);
    if (props.spinning) return false;
    return props.self?.connections.all.some((conn) => conn.peer.remote === remote) ?? false;
  },
};
