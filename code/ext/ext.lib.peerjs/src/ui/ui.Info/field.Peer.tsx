import { COLORS, Color, Icons, Value, Webrtc, css, type t } from './common';

type P = t.PropListItem;

const styles = {
  center: css({ Flex: 'x-center-center' }),
  iconRight: css({ marginLeft: 5 }),
  iconLeft: css({ marginRight: 5 }),
};

export function peer(
  data: t.InfoData['peer'],
  fields: t.InfoField[],
  themeName?: t.CommonTheme,
): P | P[] | undefined {
  if (!data) return;
  const self = data?.self;
  const peer = self;
  const current = peer?.current;
  const showRemotes = fields.includes('Peer.Remotes');
  const totalConnections = peer.current.connections.length ?? 0;

  /**
   * Root Peer (Self)
   */
  const theme = Color.theme(themeName);
  const root: P = {
    label: peer ? `Peer ( self:${peer.id} )` : 'Peer',
    value: {
      data: (
        <div {...styles.center}>
          <div>{Wrangle.rootLabel(current)}</div>
          <Icons.Person
            size={14}
            style={styles.iconRight}
            color={totalConnections > 0 ? COLORS.BLUE : theme.alpha.fg(0.4)}
          />
        </div>
      ),
      opacity: current?.open || totalConnections > 0 ? 1 : 0.3,
    },
  };
  if (!peer) return root;

  /**
   * Remote Peers
   */
  const remotes: P[] = [];
  if (showRemotes) {
    const peers = peer.get.conn.remotes;
    Object.keys(peers).forEach((remoteid) => {
      remotes.push({
        label: (
          <div {...styles.center}>
            <Icons.Person size={14} style={styles.iconLeft} flipX={true} />
            <div>{`remote: ${remoteid}`}</div>
          </div>
        ),
        value: (
          <div {...styles.center}>
            <div>{Wrangle.remotesLabel(peers[remoteid])}</div>
            <Icons.Plug size={14} style={styles.iconRight} />
          </div>
        ),
      });
    });
  }

  return [root, ...remotes];
}

/**
 * Helpers
 */
const Wrangle = {
  rootLabel(peer?: t.Peer) {
    return !peer ? '-' : Wrangle.connections(peer.connections.length);
  },

  connections(total: number) {
    return `${total} ${Value.plural(total, 'connection', 'connections')}`;
  },

  remotesLabel(input: t.PeerConnection[]) {
    const conns = {
      data: input.filter((m) => Webrtc.Is.Kind.data(m.kind)),
      media: input.filter((m) => Webrtc.Is.Kind.media(m.kind)),
    };
    const data = `${conns.data.length} data`;
    const media = conns.media.length > 0 ? `${conns.media.length} media` : '';
    return [data, media].filter(Boolean).join(', ');
  },
} as const;
