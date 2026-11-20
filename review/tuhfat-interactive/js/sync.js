/** Bidirectional sync between the book pane and the panel pane, per SKILL.md's contract. */
const Sync = (() => {
  let selectedId = null;

  function select(id) {
    selectedId = id;
    BookView.highlightSelected(id);
    PanelView.highlightSelected(id);
  }

  function current() {
    return selectedId;
  }

  return { select, current };
})();
