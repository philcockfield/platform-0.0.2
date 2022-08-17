import { fs, Paths, t } from './common.mjs';

type TemplateKind = 'vite.config' | 'esm.json' | 'entry:src' | 'entry:html';

/**
 * Template helpers.
 */
export const Template = {
  /**
   * Construct a template path.
   */
  path(...path: string[]) {
    return fs.join(Paths.tmpl.dir, ...path);
  },

  /**
   * Check for the existence of a template file and copy if not already in the target.
   */
  async ensureExists(kind: TemplateKind, targetDir: t.PathString) {
    const copyMaybe = async (source: t.PathString, target: t.PathString) => {
      source = fs.resolve(source);
      target = fs.resolve(target);
      if (await fs.pathExists(target)) return false;
      await fs.copy(source, target);
      return true;
    };

    const copyFileMaybe = async (file: t.PathString) => {
      await copyMaybe(Template.path(file), fs.join(targetDir, file));
    };

    if (kind === 'vite.config') {
      await copyFileMaybe(Paths.tmpl.viteConfig);
      return;
    }

    if (kind === 'esm.json') {
      await copyFileMaybe(Paths.tmpl.esmConfig);
      return;
    }

    if (kind === 'entry:src') {
      for (const path of Paths.tmpl.src) {
        await copyFileMaybe(path);
      }
      return;
    }

    if (kind === 'entry:html') {
      await copyFileMaybe(Paths.tmpl.indexHtml);
      return;
    }

    throw new Error(`template '${kind}' not supported`);
  },

  /**
   * Ensure the target directory has baseline files within it.
   */
  async ensureBaseline(targetDir: t.PathString) {
    const ensure = Template.ensureExists;
    await ensure('vite.config', targetDir);
    await ensure('esm.json', targetDir);
    await ensure('entry:src', targetDir);
    await ensure('entry:html', targetDir);
  },
};
