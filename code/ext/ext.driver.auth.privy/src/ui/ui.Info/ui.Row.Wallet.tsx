import { Button, COLORS, DEFAULTS, Hash, Icons, css, type t, Wallet } from './common';
import { useBalance } from './use.Balance';

export type WalletRowProps = {
  enabled?: boolean;
  privy: t.PrivyInterface;
  wallet: t.ConnectedWallet;
  chain: t.EvmChainName;
  showClose?: boolean;
  style?: t.CssValue;
};

export const WalletRow: React.FC<WalletRowProps> = (props) => {
  const { enabled = DEFAULTS.enabled, wallet, showClose = false, privy, chain } = props;
  const { address } = wallet;
  const isEmbedded = Wrangle.isEmbedded(wallet);

  const shortHash = Hash.shorten(address, [2, 4]);
  const balance = useBalance({ wallet, chain });

  /**
   * Handlers
   */
  const unlinkWallet = () => {
    /**
     * TODO 🐷
     * Bug: not working
     * https://privy-developers.slack.com/archives/C059ABLSB47/p1693530998199469
     */
    privy.unlinkWallet(wallet.address);
    wallet.unlink();
  };

  /**
   * [Render]
   */
  const Size = 16;
  const styles = {
    base: css({
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'auto auto 1fr auto ',
      gridGap: '5px',
      justifyContent: 'center',
      alignContent: 'center',
    }),
    wallet: css({}),
    kind: css({ opacity: 0.2, display: 'grid', alignContent: 'center' }),
    address: css({ display: 'grid', alignContent: 'center' }),
    balance: css({ display: 'grid', justifyContent: 'end', alignContent: 'center' }),
    close: css({ Size }),
  };

  const elAddress = (
    <Button.Copy enabled={enabled} style={styles.address} onCopy={(e) => e.copy(address)}>
      {shortHash}
    </Button.Copy>
  );

  const elClose = showClose && !isEmbedded && (
    <Button style={styles.close} enabled={enabled} onClick={unlinkWallet}>
      <Icons.Close size={Size} />
    </Button>
  );
  const elBalance = !elClose && (
    <Button.Copy
      minWidth={80}
      enabled={enabled}
      spinning={balance.is.fetching}
      spinner={{ color: { enabled: COLORS.DARK } }}
      onCopy={(e) => e.copy(balance.eth)}
      style={styles.balance}
    >
      <div>{balance.toString('ETH', 5)}</div>
    </Button.Copy>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Icons.Wallet size={16} opacity={0.8} offset={[0, 0]} style={styles.wallet} />
      {elAddress}
      <div {...styles.kind}>{Wrangle.walletClientType(wallet)}</div>
      {elClose || elBalance}
    </div>
  );
};

/**
 * Helpers
 */
export const Wrangle = {
  isEmbedded(wallet: t.ConnectedWallet) {
    return Wallet.is.embedded(wallet);
  },

  walletClientType(wallet: t.ConnectedWallet) {
    if (Wrangle.isEmbedded(wallet)) return 'embedded';
    return wallet.walletClientType.replace(/_/, ' ').toLocaleLowerCase();
  },
} as const;
