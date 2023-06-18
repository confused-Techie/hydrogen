const React = require("react");
const mobx_react_1 = require("mobx-react");
const Watch = require("./watch.js");
const { WATCHES_URI, EmptyMessage } = require("../../utils");

const Watches = (0, mobx_react_1.observer)(({ store: { kernel } }) => {
  if (!kernel) {
    if (atom.config.get("Hydrogen.outputAreaDock")) {
      return React.createElement(EmptyMessage, null);
    }
    atom.workspace.hide(WATCHES_URI);
    return null;
  }
  return React.createElement(
    "div",
    { className: "sidebar watch-sidebar" },
    kernel.watchesStore.watches.map((watch) =>
      React.createElement(Watch, {
        key: watch.editor.id,
        store: watch,
      })
    ),
    React.createElement(
      "div",
      { className: "btn-group" },
      React.createElement(
        "button",
        {
          className: "btn btn-primary icon icon-plus",
          onClick: kernel.watchesStore.addWatch,
        },
        "Add watch"
      ),
      React.createElement(
        "button",
        {
          className: "btn btn-error icon icon-trashcan",
          onClick: kernel.watchesStore.removeWatch,
        },
        "Remove watch"
      )
    )
  );
});

module.exports = Watches;
