import { State } from '../../ui.logic/index.mjs';
import { css, t } from '../common.mjs';
import { MarkdownDoc } from '../Markdown.Doc/index.mjs';
import { MarkdownEditor } from '../Markdown.Editor/index.mjs';
import { MarkdownLayout } from '../Markdown.Layout/index.mjs';
import { MarkdownOutline } from '../Markdown.Outline/index.mjs';

export type MarkdownProps = {
  instance: t.StateInstance;
  location: string; // TEMP 🐷 GET FROM STATE
  style?: t.CssValue;
};

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const show = State.QueryString.show(props.location);
  const state = State.Bus.useEvents(props.instance);

  /**
   * Handlers
   */
  const onEditorChange = (e: { text: string }) => {
    // setMarkdown(e.text);
    /**
     * TODO 🐷
     * update markdown via State
     */
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'x-stretch-stretch',
      overflow: 'hidden',
    }),
    column: css({ display: 'flex' }),
  };

  const elements = show.map((kind, i) => {
    let el: JSX.Element | null = null;
    let flex: undefined | number;
    const markdown = state.current?.outline?.markdown ?? '';

    if (kind === 'outline') {
      flex = undefined;
      el = <MarkdownOutline markdown={markdown} scroll={true} style={{ flex: 1, padding: 40 }} />;
    }

    if (kind === 'doc') {
      flex = 1;
      el = <MarkdownDoc markdown={markdown} scroll={true} style={{ flex: 1 }} />;
    }

    if (kind === 'outline|doc') {
      flex = 2;
      el = <MarkdownLayout markdown={markdown} scroll={true} style={{ flex: 1 }} />;
    }

    if (kind === 'editor') {
      flex = 1;
      el = (
        <MarkdownEditor
          key={i}
          style={{ flex: 1 }}
          markdown={markdown}
          onChange={onEditorChange}
          focusOnLoad={true}
        />
      );
    }

    return (
      <div key={i} {...css(styles.column, { flex })}>
        {el ?? null}
      </div>
    );
  });

  return <div {...css(styles.base, props.style)}>{elements}</div>;
};
