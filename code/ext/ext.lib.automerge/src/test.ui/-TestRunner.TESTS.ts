export const TESTS = {
  get all() {
    return [
      //
      import('./-TEST'),
      import('../common/Is.TEST'),
      'Store',
      import('../Store.Web/-TEST'),
      import('../Store.Web/-TEST.storage'),
      import('../Store.Web/-TEST.sync'),
      import('../Store.Web/-TEST.index'),
      import('../Store.IndexDb/-TEST'),
      'UI.Repo',
      import('../ui/ui.RepoList.Model/-TEST'),
    ];
  },
};
